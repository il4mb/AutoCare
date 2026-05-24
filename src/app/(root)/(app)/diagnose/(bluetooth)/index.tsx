import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenLayout from "@/components/ScreenLayout";
import { Text } from "@/components/Text";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { BluetoothDevice } from "react-native-bluetooth-classic";
import { useRouter } from "expo-router";

export default function DiagnoseScreen() {

    const router = useRouter();
    const bt = useBluetooth();

    const handleConnect = async (device: BluetoothDevice) => {
        router.push(`/diagnose/connect?name=${encodeURIComponent(device.name || "Unknown")}&address=${device.address}`);
    }

    const DeviceCard = ({ device, isSaved = false, }: { device: BluetoothDevice, isSaved?: boolean }) => (
        <Pressable style={[styles.deviceCard]} onPress={() => handleConnect(device)}>
            <View style={[styles.iconContainer, isSaved ? styles.iconSaved : styles.iconScanned]}>
                <MaterialCommunityIcons name={isSaved ? "bluetooth-connect" : "bluetooth"} size={24} color={isSaved ? "#0252ff" : "#64748b"} />
            </View>
            <View style={styles.deviceInfo}>
                <Text type="default" style={styles.deviceName}>
                    {device.name || "Perangkat Tidak Dikenal"}
                </Text>
                <Text type="small" style={styles.deviceAddress}>
                    {device.address}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </Pressable>
    );

    useEffect(() => {
        bt.fetchPairedDevices();
        return () => {
            bt.stopScan();
        };
    }, [bt.fetchPairedDevices, bt.stopScan]);

    return (
        <ScreenLayout applyInsets>
            <View style={styles.container}>

                <View style={styles.header}>
                    <Text type="title" style={styles.headerTitle}>
                        Pilih Perangkat
                    </Text>
                    <Text type="small" style={styles.headerSubtitle}>
                        Hubungkan ke perangkat OBD/Sensor untuk memulai diagnosa.
                    </Text>
                </View>

                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={bt.isLoadingPaired && !bt.isScanning} onRefresh={bt.fetchPairedDevices} colors={["#0252ff"]} />}>
                    <View style={styles.section}>
                        <Text type="smallBold" style={styles.sectionTitle}>TERSIMPAN SEBELUMNYA</Text>

                        {bt.isLoadingPaired ? (
                            <ActivityIndicator size="small" color="#0252ff" style={styles.loader} />
                        ) : bt.pairedDevices.length > 0 ? (bt.pairedDevices.map((device) => (
                            <DeviceCard key={device.address} device={device} isSaved={true} />
                        ))) : (
                            <View style={styles.emptyState}>
                                <Text type="small" style={styles.emptyText}>Belum ada perangkat yang tersimpan.</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text type="smallBold" style={styles.sectionTitle}>PERANGKAT TERSEDIA</Text>
                            <Pressable
                                onPress={bt.isScanning ? bt.stopScan : bt.startScan}
                                style={styles.scanActionBtn}>
                                {bt.isScanning ? (
                                    <ActivityIndicator size="small" color="#0252ff" />
                                ) : (
                                    <MaterialCommunityIcons name="refresh" size={20} color="#0252ff" />
                                )}
                                <Text type="smallBold" style={styles.scanActionText}>
                                    {bt.isScanning ? "Memindai..." : "Pindai"}
                                </Text>
                            </Pressable>
                        </View>

                        {bt.scannedDevices.length > 0 ? (bt.scannedDevices.map((device) => (
                            <DeviceCard
                                key={device.address}
                                device={device}
                                isSaved={false}
                            />
                        ))) : (
                            <View style={styles.emptyState}>
                                {bt.isScanning ? (
                                    <Text type="small" style={styles.emptyText}>Mencari perangkat di sekitar Anda...</Text>
                                ) : (
                                    <Text type="small" style={styles.emptyText}>Ketuk "Pindai" untuk mencari perangkat baru.</Text>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
    headerTitle: { color: "#0f172a", fontSize: 32 },
    headerSubtitle: { color: "#64748b", marginTop: 4 },
    scrollArea: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 100 },
    section: { marginBottom: 32 },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { color: "#94a3b8", letterSpacing: 0.5, marginBottom: 12 },
    scanActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#eff6ff", borderRadius: 16, marginBottom: 12 },
    scanActionText: { color: "#0252ff" },
    loader: { marginVertical: 20 },
    emptyState: { padding: 24, alignItems: "center", backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "dashed" },
    emptyText: { color: "#94a3b8", textAlign: "center" },
    deviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    deviceCardPressed: { backgroundColor: "#f8fafc", transform: [{ scale: 0.98 }] },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 16 },
    iconSaved: { backgroundColor: "#eff6ff" },
    iconScanned: { backgroundColor: "#f1f5f9" },
    deviceInfo: { flex: 1 },
    deviceName: { color: "#1e293b", fontWeight: "bold", marginBottom: 4 },
    deviceAddress: { color: "#64748b", fontFamily: "monospace" },
});