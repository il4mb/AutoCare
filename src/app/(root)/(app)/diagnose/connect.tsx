import ClassicBT, { BluetoothDevice } from "react-native-bluetooth-classic";
import ScreenLayout from "@/components/ScreenLayout";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnect } from "@/hooks/use-connect";
import { Text } from "@/components/Text";
import ConnectionBadge from "@/components/ConnectionBadge";
import { Button } from "@/components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SelectField } from "@/components/SelectField";
import { VEHICLE_MODELS } from "@/constants/vehicles-models";
import { parseODBResponse } from "@/parser";
import VehicleBrandSelect from "@/components/VehicleBrandSelect";

type ConnectParams = {
    name: string;
    address: string;
}

export default function Connect() {
    const { name, address } = useLocalSearchParams<ConnectParams>();
    const router = useRouter();
    const connect = useConnect(address);

    // Ref untuk scroll view terminal
    const scrollViewRef = useRef<ScrollView>(null);

    // State untuk mengunci tombol saat inisialisasi berjalan
    const [isDiagnosing, setIsDiagnosing] = useState(false);

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
        setIsDiagnosing(true); // Mulai loading
        try {
            console.log("Memulai Inisialisasi...");

            // Pancing buffer jika ada data nyangkut
            await ClassicBT.readFromDevice(address).catch(() => { });

            // Menggunakan request: Kode akan MENUNGGU balasan sebelum lanjut ke baris berikutnya
            await connect.request("ATZ");
            await connect.request("ATE0");
            await connect.request("ATL0");
            await connect.request("ATSP0");
            await connect.request("0100");
            const DTC = await connect.request("03");

            console.log("✅ Semua data inisialisasi berhasil diproses!");
            console.log("DTC:", parseODBResponse(DTC));
        } catch (error: any) {
            console.error("❌ Proses terhenti:", error.message);
        } finally {
            setIsDiagnosing(false); // Selesai loading
        }
    }, [connect, address]);

    // Pastikan parameter name dan address tersedia
    useEffect(() => {
        if (!name || !address) {
            router.back();
            return;
        }
    }, [name, address, router]);

    // Fungsi render untuk status card
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
                <View style={[styles.statusInner, styles.statusInnerCompact]}>
                    <View style={[styles.iconCircle, styles.iconCircleSuccess, styles.iconCircleCompact]}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                    </View>
                    <View style={styles.compactTextContainer}>
                        <Text type="subtitle" style={styles.statusTitleCompact}>Terhubung!</Text>
                        <Text type="small" style={styles.statusDescCompact}>
                            Perangkat siap digunakan.
                        </Text>
                    </View>
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

                {/* Badge Koneksi */}
                <ConnectionBadge
                    name={name}
                    address={address}
                    connected={connect.connected}
                    disabled={connect.connecting}
                    loading={connect.connecting}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />

                <View style={{ marginTop: 24 }}>
                    <VehicleBrandSelect />
                </View>


                {/* Status Card (Mengecil jika terhubung) */}
                <View style={[styles.statusCard, connect.connected && styles.statusCardCompact]}>
                    {renderStatusContent()}
                </View>

                {/* Area Kontrol Diagnosa & Terminal */}
                {connect.connected && (
                    <View style={styles.diagnosticsContainer}>

                        {/* <SelectField
                            label="Pilih Model Kendaraan"
                            options={VEHICLE_MODELS.map((model, i) => ({ label: `${model.brand} ${model.model}`, value: i }))}
                            onValueChange={(value) => {
                                console.log("Model Dipilih:", value);
                            }}
                        /> */}

                        {/* Terminal UI */}
                        <View style={styles.terminalContainer}>
                            <View style={styles.terminalHeader}>
                                <Text style={styles.terminalTitle}>OBD-II Console</Text>
                                <View style={styles.terminalDots}>
                                    <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                                    <View style={[styles.dot, { backgroundColor: '#eab308' }]} />
                                    <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
                                </View>
                            </View>

                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.terminalScroll}
                                contentContainerStyle={{ paddingBottom: 80 }}
                                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                                {(!connect.commandLogs || connect.commandLogs.length === 0) ? (
                                    <Text style={styles.terminalPlaceholder}>Menunggu aktivitas data...</Text>
                                ) : (connect.commandLogs.map((log) => (
                                    <View key={log.id} style={styles.logRow}>
                                        <Text style={[styles.logIcon, { color: log.type === 'TX' ? '#38bdf8' : '#34d399' }]}>
                                            {log.type === 'TX' ? 'OUT' : 'IN'}
                                        </Text>
                                        <Text style={styles.logText}>
                                            {log.data}
                                        </Text>
                                    </View>
                                )))}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>

            {/* Area Aksi Bawah */}
            <View style={styles.footer}>
                <Button
                    title={isDiagnosing ? "Memproses Inisialisasi..." : "Mulai Diagnosa"}
                    disabled={!connect.connected || connect.connecting || isDiagnosing}
                    onPress={sendTestData}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    // --- STATUS CARD ---
    statusCard: {
        marginTop: 24,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 220,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statusCardCompact: {
        minHeight: 80,
        padding: 16,
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statusInner: {
        alignItems: "center",
    },
    statusInnerCompact: {
        flexDirection: "row",
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
    iconCircleCompact: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 0,
        marginRight: 16,
    },
    iconCircleIdle: { backgroundColor: "#f1f5f9" },
    iconCircleSuccess: { backgroundColor: "#d1fae5" },
    iconCircleError: { backgroundColor: "#fee2e2" },
    statusIcon: {
        marginBottom: 16,
        transform: [{ scale: 1.5 }],
    },
    statusTitle: {
        color: "#0f172a",
        marginBottom: 8,
        fontSize: 20,
    },
    statusTitleCompact: {
        color: "#0f172a",
        fontSize: 16,
        marginBottom: 2,
    },
    statusDesc: {
        color: "#64748b",
        textAlign: "center",
        paddingHorizontal: 16,
    },
    statusDescCompact: {
        color: "#64748b",
    },
    compactTextContainer: {
        alignItems: "flex-start",
    },
    textError: {
        color: "#ef4444",
    },
    // --- DIAGNOSTICS AREA ---
    diagnosticsContainer: {
        flex: 1,
        marginTop: 24,
    },
    // --- TERMINAL UI ---
    terminalContainer: {
        flex: 1,
        marginTop: 16,
        backgroundColor: "#0f172a", // Slate 900
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    terminalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1e293b", // Slate 800
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    terminalTitle: {
        color: "#94a3b8",
        fontSize: 12,
        fontFamily: "monospace",
        fontWeight: "bold",
    },
    terminalDots: {
        flexDirection: "row",
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    terminalScroll: {
        flex: 1,
        padding: 12,
        paddingBottom: 80
    },
    terminalPlaceholder: {
        color: "#475569",
        fontFamily: "monospace",
        fontSize: 12,
    },
    logRow: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: "flex-start",
    },
    logIcon: {
        fontWeight: 'bold',
        width: 30,
        fontFamily: 'monospace',
        fontSize: 10,
        marginTop: 1,
    },
    logText: {
        color: '#f8fafc',
        flex: 1,
        fontFamily: 'monospace',
        fontSize: 10,
        lineHeight: 14,
    },
    // --- FOOTER ---
    footer: {
        padding: 20,
        paddingBottom: 32,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    }
});