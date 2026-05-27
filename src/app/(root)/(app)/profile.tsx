import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { clearCookies } from "@/api";
import { Button } from "@/components/Button"; // Pastikan Button mendukung styling/warna
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useApp } from "@/contexts/AppProvider";
import i18n from "@/localization";
import LanguageSwitcher from "@/components/LaguageSwicher";

export default function Profile() {
    const router = useRouter();
    const { auth } = useApp();

    const handleLogout = async () => {
        try {
            await clearCookies();
            // Jika ada fungsi logout/reset context di useApp, panggil di sini
            router.replace("/sign-in");
        } catch (error) {
            console.error("Gagal logout:", error);
            Alert.alert(i18n.t("profile.logoutErrorTitle"), i18n.t("profile.logoutErrorMessage"));
        }
    }

    const confirmLogout = () => {
        Alert.alert(
            i18n.t("profile.logoutTitle"),
            i18n.t("profile.logoutMessage"),
            [
                { text: i18n.t("common.cancel"), style: "cancel" },
                { text: i18n.t("profile.accountLogout"), style: "destructive", onPress: handleLogout }
            ]
        );
    };

    // Ambil inisial nama untuk avatar (misal: "Ilham B" -> "I")
    const getInitial = (name?: string) => {
        if (!name) return "U"; // Default 'U' untuk User
        return name.charAt(0).toUpperCase();
    };

    return (
        <ScreenLayout applyInsets style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Judul */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
                    <Text type="title" style={styles.pageTitle}>{i18n.t("profile.title")}</Text>
                    <View style={{ marginLeft: "auto", flex: 1, maxWidth: 150 }}>
                        <LanguageSwitcher />
                    </View>
                </View>

                {auth ? (
                    <>
                        {/* Kartu Identitas Utama */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{getInitial(auth.name)}</Text>
                            </View>
                            <Text style={styles.nameText}>{auth.name || i18n.t("profile.nameFallback")}</Text>
                            <Text style={styles.emailText}>{auth.email || i18n.t("profile.emailFallback")}</Text>
                        </View>

                        {/* List Detail Tambahan */}
                        <View style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name="identifier" size={20} color="#64748b" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>{i18n.t("profile.userId")}</Text>
                                    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                                        {auth.id}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10b981" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>{i18n.t("profile.accountStatus")}</Text>
                                    <Text style={styles.detailValue}>{i18n.t("profile.activeVerified")}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>{i18n.t("profile.noData")}</Text>
                    </View>
                )}

                {/* Tombol Logout */}
                <View style={styles.footerContainer}>
                    <Button
                        title={i18n.t("profile.editProfile")}
                        onPress={() => router.push("/edit-profile")}
                        style={styles.editButton}
                    />
                    <Button
                        title={i18n.t("profile.logout")}
                        onPress={confirmLogout}
                        style={styles.logoutButton}
                    />
                </View>

            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    pageTitle: {
        fontSize: 24,
        color: "#0f172a",
        // marginBottom: 24,
    },
    // --- KARTU PROFIL ---
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#0252ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#0252ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "bold",
    },
    nameText: {
        fontSize: 22,
        color: "#0f172a",
        fontWeight: "600",
        marginBottom: 4,
    },
    emailText: {
        fontSize: 14,
        color: "#64748b",
    },
    // --- KARTU DETAIL ---
    detailsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: "#334155",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginLeft: 56, // Sejajar dengan teks, bukan ikon
    },
    // --- EMPTY STATE ---
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        color: "#94a3b8",
    },
    // --- FOOTER & LOGOUT ---
    footerContainer: {
        marginTop: "auto", // Mendorong tombol ke bawah jika layar panjang
        paddingTop: 32,
    },
    logoutButton: {
        backgroundColor: "#f08d8d", // Red 100
        borderColor: "#a33636",
        borderWidth: 1,
    },
    editButton: {
        backgroundColor: "#2f6cb8", // Blue 200
        borderColor: "#3b82f6",
        borderWidth: 1,
        marginBottom: 12,
    },
});