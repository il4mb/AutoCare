import i18n from "@/localization";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import ClassicBT from "react-native-bluetooth-classic";
import { Button } from "./Button";
import { Text } from "./Text";

interface BluetoothSuspenseProps {
    children?: ReactNode;
}

export default function BluetoothSuspense({ children }: BluetoothSuspenseProps) {
    const [loading, setLoading] = useState(true);
    const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(true);
    const [enabling, setEnabling] = useState(false);

    // Animasi untuk transisi layar
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;

    const enableBluetooth = useCallback(async () => {
        setEnabling(true);
        try {
            const granted = await ClassicBT.requestBluetoothEnabled();
            setIsBluetoothAvailable(granted);
        } catch (error) {
            console.error("Gagal mengaktifkan Bluetooth:", error);
            setIsBluetoothAvailable(false);
        } finally {
            setEnabling(false);
        }
    }, []);

    useEffect(() => {
        const subscribe = ClassicBT.onStateChanged((state) => {
            setIsBluetoothAvailable(state.enabled);
            setLoading(false);
        });

        ClassicBT.isBluetoothEnabled()
            .then(enabled => {
                setIsBluetoothAvailable(enabled);
                setLoading(false);
            })
            .catch(() => {
                setIsBluetoothAvailable(false);
                setLoading(false);
            });

        return () => subscribe.remove();
    }, []);

    // Trigger animasi ketika layar "Bluetooth Off" muncul
    useEffect(() => {
        if (!loading && !isBluetoothAvailable) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateYAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Reset animasi
            fadeAnim.setValue(0);
            translateYAnim.setValue(20);
        }
    }, [loading, isBluetoothAvailable, fadeAnim, translateYAnim]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text type="smallBold" style={styles.loadingText}>
                        {i18n.t("bluetooth.checkingBluetooth")}
                    </Text>
                </View>
            </View>
        );
    }

    if (!isBluetoothAvailable) {
        return (
            <View style={styles.container}>
                <Animated.View style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: translateYAnim }]
                    }
                ]}>

                    {/* Visual Anchor dengan Concentric Rings */}
                    <View style={styles.iconOuterRing}>
                        <View style={styles.iconInnerRing}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="bluetooth-off" size={48} color="#ef4444" />
                            </View>
                        </View>
                    </View>

                    {/* Text Content */}
                    <Text type="subtitle" style={styles.title}>
                        {i18n.t("bluetooth.bluetoothOff")}
                    </Text>

                    <Text type="default" style={styles.description}>
                        {i18n.t("bluetooth.connectHint")}
                    </Text>

                    {/* Action Button */}
                    <View style={styles.buttonWrapper}>
                        <Button
                            title={enabling ? i18n.t("bluetooth.processingInit") : i18n.t("bluetooth.enableBluetooth")}
                            onPress={enableBluetooth}
                            disabled={enabling}
                        />
                    </View>

                </Animated.View>
            </View>
        );
    }

    return children;
}

const styles = StyleSheet.create({
    // --- Loading Styles ---
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#f8fafc', // Warna background yang lebih lembut
    },
    loadingBox: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    loadingText: {
        marginTop: 16,
        color: '#64748b',
    },

    // --- Empty State Styles ---
    container: {
        flex: 1,
        backgroundColor: "#f8fafc", // Abu-abu sangat terang agar card menonjol
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignItems: "center",
        backgroundColor: '#fff',
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },

    // --- Icon Concentric Rings ---
    iconOuterRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#fef2f2', // Merah sangat pudar
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconInnerRing: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: '#fee2e2', // Merah pudar
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fecaca', // Merah yang lebih pekat
        justifyContent: "center",
        alignItems: "center",
    },

    // --- Typography ---
    title: {
        fontSize: 24, // Disesuaikan agar tidak terlalu raksasa (48px)
        textAlign: 'center',
        color: '#0f172a',
        marginBottom: 12,
    },
    description: {
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 12,
        marginBottom: 32,
    },

    // --- Actions ---
    buttonWrapper: {
        width: '100%',
    },
});