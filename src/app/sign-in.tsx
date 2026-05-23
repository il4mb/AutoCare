import { useState } from "react";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import api from "@/api";
// import { useApp } from "@/context/AppProvider"; 
import { Button } from "@/components/Button";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { AxiosError } from "axios";

export default function SignInScreen() {
    const router = useRouter();
    // const { refreshAuth } = useApp(); 

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const updateData = (field: keyof typeof data, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    }

    const handleSignIn = async () => {
        if (!data.email.trim() || !data.password.trim()) {
            setError("Email dan password tidak boleh kosong.");
            return;
        }

        setLoading(true);
        setError(null);
        Keyboard.dismiss();

        try {
            const response = await api.post("/auth", data);
            if (response.status === 200) {
                router.replace("/home");
            } else {
                setError("Gagal masuk. Periksa kembali kredensial Anda.");
            }
        } catch (e: any) {
            if(e instanceof AxiosError && e.response?.data?.error) {
                setError(e.response?.data?.error);
                return;
            }
            const errorMsg = e.response?.data?.message || "Koneksi ke server gagal. Silakan coba lagi.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenLayout applyInsets style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}>
                    <View style={styles.spacer} />
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="car-connected" size={48} color="#0252ff" />
                        </View>
                        <Text type="title" style={styles.title}>Selamat Datang</Text>
                        <Text style={styles.subtitle}>
                            Masuk untuk melanjutkan diagnosa kendaraan
                        </Text>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <TextField
                            label="Alamat Email"
                            value={data.email}
                            onChangeText={(text) => updateData("email", text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextField
                            label="Kata Sandi"
                            value={data.password}
                            onChangeText={(text) => updateData("password", text)}
                            secureTextEntry
                        />
                        <Text style={styles.forgotPasswordText} onPress={() => router.push("/forgot-password")}>
                            Lupa kata sandi?
                        </Text>
                        <Button
                            title={loading ? "Memproses..." : "Masuk"}
                            onPress={handleSignIn}
                            disabled={loading}
                            style={styles.submitButton}
                        />
                        <Text style={styles.signUpText}>
                            Belum punya akun?{" "}
                            <Text style={styles.signUpLink} onPress={() => router.push("/sign-up")}>
                                Daftar di sini
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.spacer} />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
    spacer: { flex: 1 },
    headerContainer: { alignItems: "center", marginBottom: 40 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    title: { fontSize: 28, color: "#0f172a", marginBottom: 8 },
    subtitle: { fontSize: 15, color: "#64748b", textAlign: "center", paddingHorizontal: 20 },
    errorContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 12, borderRadius: 8, marginBottom: 20, gap: 8 },
    errorText: { color: "#b91c1c", fontSize: 14, flex: 1 },
    formContainer: { gap: 16 },
    submitButton: { marginTop: 8, paddingVertical: 14 },
    signUpText: { textAlign: "center", color: "#64748b", fontSize: 14 },
    signUpLink: { color: "#0252ff", textDecorationLine: "underline", fontWeight: "bold" },
    forgotPasswordText: { alignSelf: "flex-end", color: "#64748b", fontSize: 14, marginTop: -8, marginBottom: 8 },
});