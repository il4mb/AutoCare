import { View, Dimensions, StyleSheet, Pressable, BackHandler } from "react-native";
import { BlurView, BlurTargetView } from "expo-blur";
import { useEffect, useRef } from "react";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';
import { Text } from "./Text";
import DrawerContent from "./DrawerContent";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 300;

interface DrawerProps {
    children?: React.ReactNode
}

export default function Drawer({ children }: DrawerProps) {

    const { colors } = useTheme();
    const router = useRouter();
    const targetRef = useRef<View | null>(null);

    // 1. Reanimated Shared Values
    const translateX = useSharedValue(-DRAWER_WIDTH);
    const contextStartX = useSharedValue(0);
    // Track where the user first touched the screen
    const initialTouchX = useSharedValue(0);

    // 2. Gesture Definition
    const panGesture = Gesture.Pan()
        // Only activate gesture on horizontal swipes to prevent blocking vertical scrolling
        .activeOffsetX([-20, 20])
        .onBegin((event) => {
            // onBegin captures the VERY FIRST touch position before the finger moves
            initialTouchX.value = event.absoluteX;
        })
        .onStart(() => {
            // Save the starting positions when the gesture officially activates
            contextStartX.value = translateX.value;
        })
        .onUpdate((event) => {
            // Strict "most left" edge check (must start within 30 pixels of the left edge)
            if (contextStartX.value === -DRAWER_WIDTH && initialTouchX.value > 30) {
                return;
            }

            // Calculate new position and clamp it between completely closed and completely open
            const nextX = contextStartX.value + event.translationX;
            translateX.value = Math.max(-DRAWER_WIDTH, Math.min(nextX, 0));
        })
        .onEnd((event) => {
            // Ignore release logic if the gesture was rejected in onUpdate
            if (contextStartX.value === -DRAWER_WIDTH && initialTouchX.value > 30) {
                return;
            }

            const isFastSwipeRight = event.velocityX > 500;
            const isFastSwipeLeft = event.velocityX < -500;
            const passedHalfway = translateX.value > -DRAWER_WIDTH / 2;

            // Determine if it should snap open or closed
            if (isFastSwipeRight || (passedHalfway && !isFastSwipeLeft)) {
                translateX.value = withTiming(0, { duration: 250 });
            } else {
                translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
            }
        });

    // 3. Animated Styles
    const drawerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }));

    const blurAnimatedStyle = useAnimatedStyle(() => {
        const isCompletelyClosed = translateX.value === -DRAWER_WIDTH;
        return {
            transform: [
                { translateX: isCompletelyClosed ? -SCREEN_WIDTH : 0 }
            ]
        };
    });

    // NEW: Animated Style for the FAB
    const fabAnimatedStyle = useAnimatedStyle(() => {
        const isCompletelyClosed = translateX.value === -DRAWER_WIDTH;
        return {
            opacity: interpolate(
                translateX.value,
                [-DRAWER_WIDTH, -DRAWER_WIDTH / 2, 0], // Starts fading in halfway through the swipe
                [0, 0, 1],
                Extrapolation.CLAMP
            ),
            transform: [
                {
                    scale: interpolate(
                        translateX.value,
                        [-DRAWER_WIDTH, 0],
                        [0.5, 1], // Grows from half size to full size
                        Extrapolation.CLAMP
                    )
                },
                // Moves the FAB off-screen when completely closed so it can't be pressed invisibly
                { translateX: isCompletelyClosed ? SCREEN_WIDTH : 0 }
            ]
        };
    });

    // Helper for the Pressable background
    const closeDrawer = () => {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
    };

    const gotoAddProfile = () => {
        router.push('/add-profile');
        closeDrawer();
    }


    useEffect(() => {
        const backHandler = () => {
            if (translateX.value === 0) {
                translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
                return true; // Prevent default back action
            }
            return false; // Allow default back action
        }
        // Listen for hardware back button presses on Android
        const subscriber = BackHandler.addEventListener('hardwareBackPress', backHandler);
        return () => {
            subscriber.remove();
        };
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <View style={styles.container}>
                    <BlurTargetView ref={targetRef} style={styles.container}>
                        {children}
                    </BlurTargetView>

                    <Animated.View style={[styles.blurOverlay, blurAnimatedStyle]}>
                        <Pressable style={styles.container} onPress={closeDrawer}>
                            <BlurView
                                blurTarget={targetRef}
                                style={styles.container}
                                blurMethod="dimezisBlurView"
                                intensity={40}
                            />
                        </Pressable>
                    </Animated.View>

                    <Animated.View style={[styles.drawer, drawerAnimatedStyle, { backgroundColor: colors.bgElement }]}>
                        <DrawerContent />
                    </Animated.View>

                    <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
                        <Pressable style={[styles.fabButton, { backgroundColor: colors.primary }]} onPress={gotoAddProfile}>
                            <FontAwesome6 name="plus" size={20} color={colors.textInverted} />
                            <Text type="smallBold" style={{ color: colors.textInverted }}>
                                Tambah
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: DRAWER_WIDTH,
        height: '100%',
        zIndex: 1200,
        elevation: 5, // Drawer berada di elevasi 5
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 1500,
        elevation: 10, // <--- TAMBAHKAN INI. Harus lebih besar dari elevation drawer
    },
    fabButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        elevation: 5,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});