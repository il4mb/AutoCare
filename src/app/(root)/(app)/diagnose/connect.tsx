import ClassicBT, { BluetoothDevice } from "react-native-bluetooth-classic";
import ScreenLayout from "@/components/ScreenLayout";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { useConnect } from "@/hooks/use-connect";
import { Text } from "@/components/Text";
import ConnectionBadge from "@/components/ConnectionBadge";
import { Button } from "@/components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SelectField } from "@/components/SelectField";

type ConnectParams = {
    name: string;
    address: string;
}

export default function Connect() {

    const { name, address } = useLocalSearchParams<ConnectParams>();
    const router = useRouter();
    const connect = useConnect(address);

    const handleConnect = useCallback(async () => {
        if (connect.connected || connect.connecting) return;
        await connect.connect();
    }, [connect]);

    const handleDisconnect = useCallback(async () => {
        if (!connect.connected || connect.connecting) return;
        await connect.disconnect();
    }, [connect]);


    const sendTestData = useCallback(async () => {
        if (!connect.connected) return;
        try {
            await connect.write("03\r");
            console.log("Data berhasil dikirim ke perangkat.");
        } catch (error) {
            console.error("Gagal mengirim data:", error);
        }
    }, [connect]);

    // Pastikan parameter name dan address tersedia, jika tidak kembali ke halaman sebelumnya
    useEffect(() => {
        if (!name || !address) {
            router.back();
            return;
        }
    }, [name, address, router]);


    useEffect(() => {
        return connect.onDataReceived((data) => {
            console.log("Data diterima dari perangkat:", data);
        });
    }, [connect.connected]);



    // Fungsi render untuk status card agar kode lebih rapi
    const renderStatusContent = () => {
        if (connect.connecting) {
            return (
                <View style={styles.statusInner}>
                    <ActivityIndicator size="large" color="#0252ff" style={styles.statusIcon} />
                    <Text type="subtitle" style={styles.statusTitle}>Menghubungkan...</Text>
                    <Text type="small" style={styles.statusDesc}>
                        Membangun koneksi ke {name}
                    </Text>
                </View>
            );
        }

        if (connect.error) {
            return (
                <View style={styles.statusInner}>
                    <View style={[styles.iconCircle, styles.iconCircleError]}>
                        <MaterialCommunityIcons name="bluetooth-off" size={32} color="#ef4444" />
                    </View>
                    <Text type="subtitle" style={styles.statusTitle}>Koneksi Gagal</Text>
                    <Text type="small" style={[styles.statusDesc, styles.textError]}>
                        {connect.error}
                    </Text>
                </View>
            );
        }

        if (connect.connected) {
            return (
                <View style={styles.statusInner}>
                    <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                        <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
                    </View>
                    <Text type="subtitle" style={styles.statusTitle}>Terhubung!</Text>
                    <Text type="small" style={styles.statusDesc}>
                        Perangkat {name} siap digunakan.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.statusInner}>
                <View style={[styles.iconCircle, styles.iconCircleIdle]}>
                    <MaterialCommunityIcons name="bluetooth-connect" size={32} color="#64748b" />
                </View>
                <Text type="subtitle" style={styles.statusTitle}>Menunggu Koneksi</Text>
                <Text type="small" style={styles.statusDesc}>
                    Ketuk tombol hubungkan pada badge di atas.
                </Text>
            </View>
        );
    };

    return (
        <ScreenLayout applyInsets style={styles.container}>
            <View style={styles.content}>

                {/* Komponen Bawaan Anda */}
                <ConnectionBadge
                    name={name}
                    address={address}
                    connected={connect.connected}
                    disabled={connect.connecting}
                    loading={connect.connecting}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />

                {/* Status Card */}
                <View style={styles.statusCard}>
                    {renderStatusContent()}
                </View>

                {connect.connected && (
                    <SelectField
                        label="Pilih Mode Diagnosa"
                        options={[
                            { label: "Diagnosa Lengkap", value: "full" },
                            { label: "Diagnosa Cepat", value: "quick" },
                        ]}
                        onValueChange={(value) => {
                            console.log("Mode Diagnosa Dipilih:", value);
                        }}
                    />
                )}

            </View>

            {/* Area Aksi Bawah */}
            <View style={styles.footer}>
                <Button
                    title="Mulai Diagnosa"
                    disabled={!connect.connected || connect.connecting}
                    onPress={sendTestData}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc", // Warna latar modern yang lembut
    },
    content: {
        flex: 1,
        padding: 20,
    },
    statusCard: {
        marginTop: 24,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 220,
        // Bayangan lembut
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statusInner: {
        alignItems: "center",
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    iconCircleIdle: {
        backgroundColor: "#f1f5f9", // Slate 100
    },
    iconCircleSuccess: {
        backgroundColor: "#d1fae5", // Emerald 100
    },
    iconCircleError: {
        backgroundColor: "#fee2e2", // Red 100
    },
    statusIcon: {
        marginBottom: 16,
        transform: [{ scale: 1.5 }],
    },
    statusTitle: {
        color: "#0f172a",
        marginBottom: 8,
        fontSize: 20,
    },
    statusDesc: {
        color: "#64748b",
        textAlign: "center",
        paddingHorizontal: 16,
    },
    textError: {
        color: "#ef4444",
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    }
});