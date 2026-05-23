import { createContext, useCallback, useContext, useEffect, useReducer, useState, useRef } from "react";
import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { initialState, reducer } from "@/reducer";
import { Action, State } from "@/types";
import api from "@/api";

import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Auth = {
    uid: string;
    email: string;
    name: string;
}

type AppContextType = {
    state: State;
    auth: Auth | null;
    dispatch: React.Dispatch<Action>;
    refreshAuth: () => Promise<void>; // Mengekspos fungsi ini agar bisa dipanggil setelah login
}

const Context = createContext<AppContextType | undefined>(undefined);

type Props = {
    children?: React.ReactNode;
}

export default function AppProvider({ children }: Props) {

    const insets = useSafeAreaInsets();
    const router = useRouter();
    const blurRef = useRef<View>(null);

    const [state, dispatch] = useReducer(reducer, initialState);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true); // Default true saat aplikasi baru dibuka
    const [authError, setAuthError] = useState<Error | null>(null);
    const [authErrorVisible, setAuthErrorVisible] = useState<boolean>(false);

    const fetchAuth = useCallback(async () => {
        setLoadingAuth(true);
        setAuthError(null);
        try {
            const response = await api.get("/auth/me");
            if (response.status !== 200) {
                if (response.status === 401) {
                    setAuthErrorVisible(true);
                    throw new Error("Sesi Anda telah habis. Silakan masuk kembali.");
                }
                throw new Error(`Gagal mengambil data autentikasi: ${response.statusText}`);
            }
            setAuth(response.data);
            setAuthErrorVisible(false); // Pastikan modal tertutup jika sukses
        } catch (e: any) {
            console.error("Failed to fetch auth data", e);
            setAuthError(e as Error);
            setAuth(null);

            // Tampilkan modal jika errornya adalah 401 Unauthorized
            if (e.message.includes("Sesi Anda") || e.response?.status === 401) {
                setAuthErrorVisible(true);
            }
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        fetchAuth();
    }, [fetchAuth]);

    const handleRelogin = () => {
        setAuthErrorVisible(false);
        router.replace("/sign-in");
    };

    return (
        <Context.Provider value={{ state, dispatch, auth, refreshAuth: fetchAuth }}>
            <View style={styles.container} ref={blurRef}>
                {loadingAuth ? (
                    <View style={[styles.loadingBadge, { top: insets.top + 15, left: insets.left + 15, right: insets.right + 15 }]}>
                        <ActivityIndicator size="small" color="#3b82f6" />
                        <Text style={{ marginTop: 12, color: "#3b82f6" }}>
                            Sedang memverifikasi sesi...
                        </Text>
                    </View>
                )}
                {children}
            </View>

            {/* Modal Error Autentikasi */}
            <Modal
                visible={authErrorVisible} // FIX: Gunakan state, bukan true statis
                transparent
                animationType="fade"
                onRequestClose={() => setAuthErrorVisible(false)}>
                <BlurView
                    blurTarget={blurRef}
                    blurMethod="dimezisBlurView" // Eksperimental Expo 50+ (Android)
                    tint="dark"                  // Ubah ke dark agar card putih lebih kontras
                    intensity={40}               // Berikan intensitas blur
                    style={styles.blurOverlay}>
                    <View style={styles.modalCard}>
                        {/* Ikon Peringatan */}
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={48} color="#ef4444" />
                        </View>

                        <Text type="title" style={styles.modalTitle}>
                            Autentikasi Gagal
                        </Text>

                        <Text style={styles.modalDescription}>
                            {authError ? authError.message : "Terjadi kesalahan sistem saat memverifikasi sesi Anda."}
                        </Text>

                        <Button
                            title="Masuk Kembali"
                            onPress={handleRelogin}
                            style={styles.actionButton}
                        />
                    </View>
                </BlurView>
            </Modal>
        </Context.Provider>
    );
}

// Custom Hook untuk memanggil context
export const useApp = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingBadge: {
        position: "absolute",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        zIndex: 999,
        flexDirection: "row",
        backgroundColor: "rgb(255, 255, 255)",
        elevation: 5,
    },
    blurOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fallback jika blur gagal
    },
    modalCard: {
        backgroundColor: "#ffffff",
        padding: 32,
        borderRadius: 24,
        width: "85%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fee2e2", // Red 100
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: "#0f172a", // Slate 900
        fontSize: 22,
        marginBottom: 12,
        textAlign: "center",
    },
    modalDescription: {
        textAlign: "center",
        color: "#64748b", // Slate 500
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 28,
    },
    actionButton: {
        width: "100%",
    }
});