import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from "react-native";

import api from "@/api";
import { Button } from "@/components/Button";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import i18n from "@/localization";
import { AxiosError } from "axios";

export default function SignInScreen() {
    const router = useRouter();
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
            setError(i18n.t("signin.errors.invalidCredentials"));
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
                setError(i18n.t("signin.errors.signInFailed"));
            }
        } catch (e: any) {
            if (e instanceof AxiosError && e.response?.data?.error) {
                setError(i18n.t("signin.errors.networkError"));
                return;
            }
            const errorMsg = e.response?.data?.message || i18n.t("signin.errors.unknownError");
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
                        <Text type="title" style={styles.title}>
                            {i18n.t("common.welcome")}
                        </Text>
                        <Text style={styles.subtitle}>
                            {i18n.t("signin.subtitle")}
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
                            label={i18n.t("signin.emailPlaceholder")}
                            value={data.email}
                            onChangeText={(text) => updateData("email", text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextField
                            label={i18n.t("signin.passwordPlaceholder")}
                            value={data.password}
                            onChangeText={(text) => updateData("password", text)}
                            secureTextEntry
                        />
                        <Text style={styles.forgotPasswordText} onPress={() => router.push("/forgot-password")}>
                            {i18n.t("signin.forgotPassword")}
                        </Text>
                        <Button
                            title={loading ? i18n.t("signin.loading") : i18n.t("signin.button")}
                            onPress={handleSignIn}
                            disabled={loading}
                            style={styles.submitButton}
                        />
                        <Text style={styles.signUpText}>
                            {i18n.t("signin.noAccount")}
                            <Text style={styles.signUpLink} onPress={() => router.push("/sign-up")}>
                                {i18n.t("signin.signUp")}
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