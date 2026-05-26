import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

import api from "@/api";
import { Button } from "@/components/Button";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useApp } from "@/contexts/AppProvider"; // Sesuaikan path jika berbeda
import i18n from "@/localization";

export default function EditProfileScreen() {
    const router = useRouter();
    const { auth, refreshAuth } = useApp();

    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [data, setData] = useState({
        name: auth?.name || "",
        password: "",
        confirmPassword: "",
    });

    const updateData = (field: keyof typeof data, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (info) setInfo(null);
    };

    const handleSave = async () => {
        if (!data.name.trim()) {
            setInfo({ type: "error", message: i18n.t("editProfile.errors.nameRequired") });
            return;
        }

        if (data.password) {
            if (data.password.length < 6) {
                setInfo({ type: "error", message: i18n.t("editProfile.errors.passwordTooShort") });
                return;
            }
            if (data.password !== data.confirmPassword) {
                setInfo({ type: "error", message: i18n.t("editProfile.errors.passwordMismatch") });
                return;
            }
        }

        setLoading(true);
        setInfo(null);
        Keyboard.dismiss();

        try {
            const payload: any = { name: data.name };
            if (data.password) {
                payload.password = data.password;
            }

            const response = await api.put("/auth/me", payload);

            if (response.status === 200 || response.status === 201) {
                await refreshAuth();

                setInfo({ type: "success", message: i18n.t("editProfile.success") });

                setData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
            } else {
                setInfo({ type: "error", message: i18n.t("editProfile.errors.saveFailed") });
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || i18n.t("editProfile.errors.networkError");
            setInfo({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenLayout applyInsets style={styles.container}>
            {/* Header Kustom (Kembali & Judul) */}
            <View style={styles.appBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text type="title" style={styles.appBarTitle}>{i18n.t("editProfile.title")}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {/* Ilustrasi / Ikon Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="account-edit-outline" size={48} color="#0252ff" />
                        </View>
                        <Text style={styles.subtitle}>
                            {i18n.t("editProfile.subtitle")}
                        </Text>
                    </View>

                    {/* Banner Info (Sukses / Error) */}
                    {info && (
                        <View style={[
                            styles.infoContainer,
                            info.type === "success" ? styles.infoContainerSuccess : styles.infoContainerError
                        ]}>
                            <MaterialCommunityIcons
                                name={info.type === "success" ? "check-circle-outline" : "alert-circle-outline"}
                                size={20}
                                color={info.type === "success" ? "#16a34a" : "#ef4444"}
                            />
                            <Text style={[
                                styles.infoText,
                                info.type === "success" ? styles.infoTextSuccess : styles.infoTextError
                            ]}>
                                {info.message}
                            </Text>
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <View style={styles.disabledInputContainer}>
                            <Text style={styles.inputLabel}>{i18n.t("editProfile.emailLabel")}</Text>
                            <View style={styles.disabledInputWrapper}>
                                <MaterialCommunityIcons name="email-lock" size={20} color="#94a3b8" />
                                <Text style={styles.disabledInputText}>{auth?.email}</Text>
                            </View>
                            <Text style={styles.helperText}>{i18n.t("editProfile.emailHelper")}</Text>
                        </View>
                        <TextField
                            label={i18n.t("editProfile.nameLabel")}
                            value={data.name}
                            onChangeText={(text) => updateData("name", text)}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />

                        <View style={styles.divider} />
                        <Text style={styles.sectionLabel}>{i18n.t("editProfile.passwordSection")}</Text>
                        <TextField
                            label={i18n.t("editProfile.newPassword")}
                            value={data.password}
                            onChangeText={(text) => updateData("password", text)}
                            secureTextEntry
                        />
                        <TextField
                            label={i18n.t("editProfile.confirmPassword")}
                            value={data.confirmPassword}
                            onChangeText={(text) => updateData("confirmPassword", text)}
                            secureTextEntry
                        />
                        <Button
                            title={loading ? i18n.t("editProfile.saving") : i18n.t("editProfile.save")}
                            onPress={handleSave}
                            disabled={loading}
                            style={styles.submitButton}
                        />
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    appBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#f8fafc",
    },
    backButton: {
        padding: 8,
    },
    appBarTitle: {
        fontSize: 18,
        color: "#0f172a",
        marginBottom: 0,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    // --- INFO BANNER ---
    infoContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        gap: 8,
    },
    infoContainerError: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
    infoContainerSuccess: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
    infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
    infoTextError: { color: "#b91c1c" },
    infoTextSuccess: { color: "#15803d" },
    // --- FORM STYLES ---
    formContainer: {
        gap: 16,
    },
    disabledInputContainer: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: "#334155",
        marginBottom: 6,
        fontWeight: "500",
    },
    disabledInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9", // Abu-abu menandakan disabled
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    disabledInputText: {
        color: "#94a3b8",
        fontSize: 15,
        flex: 1,
    },
    helperText: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 6,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#e2e8f0",
        marginVertical: 8,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0f172a",
        marginTop: 4,
        marginBottom: -4,
    },
    submitButton: {
        marginTop: 16,
        paddingVertical: 14,
    }
});