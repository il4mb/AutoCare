import { Alert, View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { clearCookies } from "@/api";
import { useApp } from "@/contexts/AppProvider";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button"; // Pastikan Button mendukung styling/warna

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
            Alert.alert("Error", "Gagal keluar dari akun. Silakan coba lagi.");
        }
    }   

    const confirmLogout = () => {
        Alert.alert(
            "Konfirmasi Keluar",
            "Apakah Anda yakin ingin keluar dari sesi ini?",
            [
                { text: "Batal", style: "cancel" },
                { text: "Keluar", style: "destructive", onPress: handleLogout }
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
                <Text type="title" style={styles.pageTitle}>Profil Pengguna</Text>

                {auth ? (
                    <>
                        {/* Kartu Identitas Utama */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{getInitial(auth.name)}</Text>
                            </View>
                            <Text style={styles.nameText}>{auth.name || "Pengguna"}</Text>
                            <Text style={styles.emailText}>{auth.email || "email@tidak.ada"}</Text>
                        </View>

                        {/* List Detail Tambahan */}
                        <View style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name="identifier" size={20} color="#64748b" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>User ID</Text>
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
                                    <Text style={styles.detailLabel}>Status Akun</Text>
                                    <Text style={styles.detailValue}>Aktif & Terverifikasi</Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Data pengguna tidak tersedia</Text>
                    </View>
                )}

                {/* Tombol Logout */}
                <View style={styles.footerContainer}>
                    <Button 
                        title="Keluar Akun" 
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
        fontSize: 28,
        color: "#0f172a",
        marginBottom: 24,
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
    }
});