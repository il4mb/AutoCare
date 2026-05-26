import api from "@/api";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { View } from "@/components/View";
import i18n from "@/localization";
import { useState } from "react";

export default function ForgotPasswordScreen() {

    const [sending, setSending] = useState(false);
    const [email, setEmail] = useState("");
    const [info, setInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSendResetLink = async () => {
        if (!email.trim()) {
            setInfo({ type: "error", message: i18n.t("forgotPassword.errors.requiredEmail") });
            return;
        }
        setSending(true);
        setInfo(null);
        try {
            // Asumsi endpoint untuk reset password adalah /auth/forgot-password
            const response = await api.post("/auth/forgot-password", { email });
            if (response.status === 200) {
                setInfo({ type: "success", message: i18n.t("forgotPassword.success") });
                return;
            } else {
                setInfo({ type: "error", message: i18n.t("forgotPassword.errors.sendFailed") });
            }
        } catch (e: any) {
            console.error("Error sending reset link:", e);
            const errorMsg = e.response?.data?.message || i18n.t("forgotPassword.errors.networkError");
            setInfo({ type: "error", message: errorMsg });
        } finally {
            setSending(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text type="title">{i18n.t("forgotPassword.title")}</Text>
            <Text>{i18n.t("forgotPassword.subtitle")}</Text>
            <TextField
                label={i18n.t("forgotPassword.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
            />
            {info && (
                <Text style={{ color: info.type === "success" ? "#16a34a" : "#b91c1c", marginTop: 8 }}>
                    {info.message}
                </Text>
            )}
            <Button
                title={i18n.t("forgotPassword.button")}
                disabled={sending}
                loading={sending}
                onPress={handleSendResetLink} />

        </View>
    );
}