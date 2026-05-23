import api from "@/api";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { View } from "@/components/View";
import { useState } from "react";

export default function ForgotPasswordScreen() {

    const [sending, setSending] = useState(false);
    const [email, setEmail] = useState("");
    const [info, setInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSendResetLink = async () => {
        if (!email.trim()) {
            setInfo({ type: "error", message: "Email tidak boleh kosong." });
            return;
        }
        setSending(true);
        try {
            // Asumsi endpoint untuk reset password adalah /auth/forgot-password
            const response = await api.post("/auth/forgot-password", { email });
            if (response.status === 200) {
                setInfo({ type: "success", message: "Tautan reset telah dikirim ke email Anda (jika email terdaftar)." });
                return;
            } else {
                setInfo({ type: "error", message: "Gagal mengirim tautan reset. Silakan coba lagi." });
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || "Koneksi ke server gagal. Silakan coba lagi.";
            setInfo({ type: "error", message: errorMsg });
        } finally {
            setSending(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text type="title">Lupa Kata Sandi</Text>
            <Text>Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi Anda.</Text>
            <TextField
                label="Alamat Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
            />
            <Button
                title="Kirim Tautan Reset"
                disabled={sending}
                loading={sending}
                onPress={handleSendResetLink} />
            {info && (
                <Text style={{ color: info.type === "success" ? "#16a34a" : "#b91c1c", marginTop: 8 }}>
                    {info.message}
                </Text>
            )}
        </View>
    );
}