import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, Vibration, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from './Text';

export interface SwipeAction {
    /**
     * Label to display when the card is swiped. 
     * This should be a short text indicating the action (e.g., "Delete", "Complete").
     */
    label: string;
    /**
     * Optional color for the action background. 
     * If not provided, it will default to primary color for startAction and error color for endAction.
     */
    color?: string;
    /**
     * Callback function that is called when the action is triggered. Can return a Promise for async actions.
     * use promise if you want to keep the loading state until the async action is completed. 
     * Otherwise, the loading state will be set to false immediately after invoking the callback.
     * @returns 
     */
    onInvoke: () => (void | Promise<any>);
}

export interface SwipableCardProps {
    children?: ReactNode;
    startAction?: SwipeAction; // Action for swiping right (start)
    endAction?: SwipeAction;   // Action for swiping left (end)
    /** How far the user must swipe to trigger the action */
    swipeThreshold?: number;
    /** Maximum swipe distance before resistance is applied */
    maxSwipeDistance?: number;
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
    onPanBegin?: () => void;
    onPanEnd?: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
export default function SwipableCard({
    children,
    startAction,
    endAction,
    swipeThreshold = 100,
    maxSwipeDistance = 150,
    onSwipeStart,
    onSwipeEnd,
    onPanBegin,
    onPanEnd,
}: SwipableCardProps) {

    const { colors } = useTheme();
    const [loading, setLoading] = useState<boolean>(false);
    const [contentHeight, setContentHeight] = useState<number>(0);

    // 0 = unassigned, 1 = right, -1 = left
    const lockedDirection = useSharedValue(0);
    const swipeStartX = useSharedValue<number>(0);
    const isSwiping = useSharedValue<boolean>(false);
    const isLoading = useSharedValue<boolean>(false);

    const pressed = useSharedValue<boolean>(false);
    const offset = useSharedValue<number>(0);


    // Sync loading state to shared value for use in worklets
    useEffect(() => {
        isLoading.value = loading;
    }, [isLoading, loading]);

    // Callbacks wrapped for safe bridging
    const handleStartInvoke = useCallback(async () => {
        try {
            Vibration.vibrate(50);
            setLoading(true);
            await startAction?.onInvoke();
        } catch (error) {
            console.error("Error invoking start action:", error);
        } finally {
            setLoading(false);
            offset.value = withSpring(0, { damping: 50, stiffness: 100 });
        }
    }, [offset, startAction]);

    const handleEndInvoke = useCallback(async () => {
        try {
            Vibration.vibrate(50); // Provide haptic feedback on action trigger
            setLoading(true);
            await endAction?.onInvoke();
        } catch (error) {
            console.error("Error invoking end action:", error);
        } finally {
            setLoading(false);
            offset.value = withSpring(0, { damping: 50, stiffness: 800 });
        }
    }, [endAction, offset]);

    const handlePanBegin = useCallback(() => {
        onPanBegin?.();
    }, [onPanBegin]);

    const handlePanEnd = useCallback(() => {
        onPanEnd?.();
    }, [onPanEnd]);

    const handleOnSwipeStart = useCallback(() => {
        if (!isSwiping.value) {
            onSwipeStart?.();
            isSwiping.value = true;
        }
    }, [isSwiping, onSwipeStart]);

    const handleOnSwipeEnd = useCallback(() => {
        if (isSwiping.value) {
            onSwipeEnd?.();
            isSwiping.value = false;
        }
    }, [isSwiping, onSwipeEnd]);

    const pan = Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-12, 12])
        .onBegin((e) => {
            "worklet";
            scheduleOnRN(handlePanBegin);
            pressed.value = true;
            swipeStartX.value = e.x;
            lockedDirection.value = 0; // Reset the lock on every new touch
        })
        .onChange((event) => {
            "worklet";
            const distanceX = event.x - swipeStartX.value;

            // 1. Determine if the gesture is a swipe based on horizontal movement threshold
            if (!isSwiping.value && Math.abs(distanceX) > 25) {
                scheduleOnRN(handleOnSwipeStart);
                return;
            }
            if (!isSwiping.value) {
                return; // Don't process swipe logic until we've determined it's a swipe
            }
            // 1. Lock the initial swipe direction as soon as they move 2 pixels
            // This prevents jitter from accidental touches locking the wrong way
            if (lockedDirection.value === 0 && Math.abs(event.translationX) > 2) {
                lockedDirection.value = event.translationX > 0 ? 1 : -1;
            }

            // Ignore vertical swipes early
            if (isLoading.value || Math.abs(event.velocityY) >= Math.abs(event.velocityX)) {
                return;
            }

            let translation = event.translationX;
            // 2. PREVENT OVERFLOW: Clamp translation based on the LOCKED direction
            if (lockedDirection.value === 1) {
                // Started Right: Cannot go less than 0 (Left)
                translation = Math.max(0, translation);
            } else if (lockedDirection.value === -1) {
                // Started Left: Cannot go greater than 0 (Right)
                translation = Math.min(0, translation);
            }

            // Prevent swiping if no action exists for that side
            if (translation > 0 && !startAction) translation = 0;
            if (translation < 0 && !endAction) translation = 0;

            // 3. Apply rubber-band resistance
            if (Math.abs(translation) <= maxSwipeDistance) {
                // No need to use Math.max/min here anymore since we already clamped `translation` above
                offset.value = translation;
            } else {
                const excess = Math.abs(translation) - maxSwipeDistance;
                const sign = translation > 0 ? 1 : -1;
                offset.value = sign * (maxSwipeDistance + excess * 0.15); // 15% elasticity
            }
        })
        .onFinalize(() => {
            "worklet";
            pressed.value = false;

            if (isLoading.value) {
                return;
            }

            // Check if threshold is met and trigger appropriate action
            if (offset.value > swipeThreshold && startAction) {
                scheduleOnRN(handleStartInvoke);
            } else if (offset.value < -swipeThreshold && endAction) {
                scheduleOnRN(handleEndInvoke);
            } else {
                offset.value = withSpring(0, { damping: 0, stiffness: 100 });
            }

            if (isSwiping.value) {
                scheduleOnRN(handleOnSwipeEnd);
            }
            scheduleOnRN(handlePanEnd);
        });

    const animatedContent = useAnimatedStyle(() => ({
        transform: [{ translateX: offset.value }]
    }));

    const onContentLayout = (event: LayoutChangeEvent) => {
        setContentHeight(event.nativeEvent.layout.height);
    };

    const startStyle = useAnimatedStyle(() => ({
        flex: 1,
        opacity: lockedDirection.value === 1 ? Math.min(offset.value / swipeThreshold, 1) : 0,
    }));

    const endStyle = useAnimatedStyle(() => ({
        flex: 1,
        opacity: lockedDirection.value === -1 ? Math.min(-offset.value / swipeThreshold, 1) : 0,
    }));

    const renderStartAction = useMemo(() => {
        if (!startAction) return <View style={{ flex: 1 }} />;
        return (
            <Animated.View style={startStyle}>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradientBase, styles.gradientStart]}
                    colors={[startAction.color || colors.primary, 'transparent']}>
                    <View style={styles.actionInner}>
                        {loading ? (
                            <Fragment>
                                <ActivityIndicator size="small" color={colors.text} style={{ marginBottom: 4 }} />
                                <Text style={{ marginBottom: 4, color: colors.text + '99' }}>
                                    Memproses...
                                </Text>
                            </Fragment>
                        ) : (
                            <Text style={{ color: colors.text + '99' }}>
                                {startAction.label}
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    }, [startAction, startStyle, colors.primary, colors.text, loading]);

    const renderEndAction = useMemo(() => {
        if (!endAction) return <View style={{ flex: 1 }} />;
        return (
            <Animated.View style={endStyle}>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={['transparent', endAction.color || colors.error]}
                    style={[styles.gradientBase, styles.gradientEnd]}>
                    <View style={styles.actionInner}>
                        {loading ? (
                            <Fragment>
                                <ActivityIndicator size="small" color={colors.text} style={{ marginBottom: 4 }} />
                                <Text style={{ marginBottom: 4, color: colors.text + '99' }}>
                                    Memproses...
                                </Text>
                            </Fragment>
                        ) : (
                            <Text style={{ color: colors.text + '99' }}>
                                {endAction.label}
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    }, [endAction, colors.error, colors.text, endStyle, loading]);

    return (
        // <GestureHandlerRootView style={styles.container}>
        <View style={[styles.cardWrapper, { height: contentHeight }]}>

            {/* Background Layer: Render dynamic Start/End Actions */}
            {renderStartAction}
            {renderEndAction}

            {/* Foreground Layer: Draggable Content */}
            <GestureDetector gesture={pan}>
                <Animated.View
                    onLayout={onContentLayout}
                    style={[animatedContent, styles.animatedContent]}>
                    {children}
                </Animated.View>
            </GestureDetector>

        </View>
        // </GestureHandlerRootView>
    );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    animatedContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1,
    },
    gradientBase: {
        flex: 1,
        overflow: 'hidden',
    },
    gradientStart: {
        alignItems: 'flex-start',
        paddingLeft: 20,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    gradientEnd: {
        alignItems: 'flex-end',
        paddingRight: 20,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    actionInner: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
});