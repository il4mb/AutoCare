import { isCookieValid } from "@/api";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function IndexScreen() {

    const router = useRouter();
    const checkAuthentication = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const isValid = await isCookieValid('auth_token');
            if (isValid) {
                router.replace('/home');
            } else {
                router.replace('/sign-in');
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            router.replace('/sign-in');
        }
    }, [router]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication]);

    // Selama proses pengecekan berjalan, selalu tampilkan Splash Screen
    return (
        <ScreenLayout applyInsets style={styles.container}>
            <View style={styles.content}>

                {/* Area Logo & Judul Aplikasi */}
                <View style={styles.brandContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="engine-outline" size={72} color="#ffffff" />
                    </View>
                    <Text type="title" style={styles.appName}>
                        AutoCare
                    </Text>
                    <Text style={styles.tagline}>
                        Solusi Cerdas untuk Diagnosa Mobil Anda
                    </Text>
                </View>

                {/* Area Indikator Loading di Bawah */}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0252ff" />
                    <Text style={styles.loadingText}>Menyiapkan sistem...</Text>
                </View>

            </View>

            {/* Footer / Versi Aplikasi */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>v1.0.0</Text>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc", // Latar belakang Slate 50 (soft white)
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    brandContainer: {
        alignItems: "center",
        // Mengangkat posisi logo sedikit ke atas dari tengah agar terlihat lebih pas
        transform: [{ translateY: -40 }],
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#0252ff", // Warna biru utama aplikasi Anda
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        // Efek bayangan (shadow)
        shadowColor: "#0252ff",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    appName: {
        fontSize: 32,
        color: "#0f172a", // Slate 900
        fontWeight: "bold",
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: "#64748b", // Slate 500
        letterSpacing: 1,
    },
    loadingContainer: {
        position: "absolute",
        bottom: 100, // Menempel di bagian bawah
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        color: "#94a3b8", // Slate 400
        fontSize: 14,
    },
    footer: {
        paddingBottom: 20,
        alignItems: "center",
    },
    versionText: {
        color: "#cbd5e1", // Slate 300
        fontSize: 12,
        fontFamily: "monospace",
    }
});