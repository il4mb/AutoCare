import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Modal, TextInput, FlatList, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useBluetooth } from "@/hooks/use-bluetooth";

interface BluetoothScannerModalProps {
    visible: boolean;
    blurTargetRef: React.RefObject<any>;
    onClose: () => void;
    onSelect: (address: string, name: string) => void;
}

export default function BluetoothScannerModal({
    visible, blurTargetRef, onClose, onSelect
}: BluetoothScannerModalProps) {

    // Panggil hook Bluetooth
    const {
        pairedDevices, scannedDevices, isScanning, isLoadingPaired,
        fetchPairedDevices, startScan, stopScan
    } = useBluetooth();

    // UI State
    const [activeTab, setActiveTab] = useState<'paired' | 'scan' | 'manual'>('paired');
    const [manualAddress, setManualAddress] = useState("");

    // Trigger logika Bluetooth berdasarkan tab yang aktif
    useEffect(() => {
        if (visible) {
            if (activeTab === 'paired') {
                stopScan();
                fetchPairedDevices();
            } else if (activeTab === 'scan') {
                startScan();
            }
        } else {
            // Hentikan scan jika modal ditutup
            stopScan();
        }
    }, [visible, activeTab]);

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <BlurView
                blurTarget={blurTargetRef}
                style={StyleSheet.absoluteFill}
                tint="dark"
                intensity={100}
                blurMethod="dimezisBlurView">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        {/* HEADER */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih Perangkat</Text>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        {/* TAB SWITCHER */}
                        <View style={styles.tabContainer}>
                            <Pressable style={[styles.tabButton, activeTab === 'paired' && styles.tabActive]} onPress={() => setActiveTab('paired')}>
                                <Text style={[styles.tabText, activeTab === 'paired' && styles.tabTextActive]}>Tersimpan</Text>
                            </Pressable>
                            <Pressable style={[styles.tabButton, activeTab === 'scan' && styles.tabActive]} onPress={() => setActiveTab('scan')}>
                                <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>Pindai Baru</Text>
                            </Pressable>
                            <Pressable style={[styles.tabButton, activeTab === 'manual' && styles.tabActive]} onPress={() => setActiveTab('manual')}>
                                <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Manual</Text>
                            </Pressable>
                        </View>

                        {/* TAB KONTEN: TERSIMPAN (BONDED) */}
                        {activeTab === 'paired' && (
                            <View style={styles.tabBody}>
                                {isLoadingPaired ? (
                                    <ActivityIndicator size="large" color="#0252ff" style={{ marginTop: 20 }} />
                                ) : (
                                    <FlatList
                                        data={pairedDevices}
                                        keyExtractor={(item) => item.address}
                                        renderItem={({ item }) => (
                                            <Pressable style={styles.deviceItem} onPress={() => onSelect(item.address, item.name)}>
                                                <MaterialCommunityIcons name="bluetooth" size={20} color="#555" />
                                                <View style={styles.deviceInfo}>
                                                    <Text style={styles.deviceName}>{item.name}</Text>
                                                    <Text style={styles.deviceAddress}>{item.address}</Text>
                                                </View>
                                            </Pressable>
                                        )}
                                        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada perangkat tersimpan.</Text>}
                                    />
                                )}
                            </View>
                        )}

                        {/* TAB KONTEN: PINDAI BARU (DISCOVERY) */}
                        {activeTab === 'scan' && (
                            <View style={styles.tabBody}>
                                {isScanning && scannedDevices.length === 0 ? (
                                    <View style={styles.centerContent}>
                                        <ActivityIndicator size="large" color="#0252ff" />
                                        <Text style={styles.scanText}>Mencari perangkat...</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={scannedDevices}
                                        keyExtractor={(item) => item.address}
                                        renderItem={({ item }) => (
                                            <Pressable style={styles.deviceItem} onPress={() => onSelect(item.address, item.name)}>
                                                <MaterialCommunityIcons name="bluetooth" size={20} color="#555" />
                                                <View style={styles.deviceInfo}>
                                                    <Text style={styles.deviceName}>{item.name}</Text>
                                                    <Text style={styles.deviceAddress}>{item.address}</Text>
                                                </View>
                                            </Pressable>
                                        )}
                                        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada perangkat ditemukan.</Text>}
                                    />
                                )}
                                <Pressable style={styles.rescanButton} onPress={isScanning ? stopScan : startScan}>
                                    <Text style={styles.rescanText}>{isScanning ? "Berhenti Pindai" : "Pindai Ulang"}</Text>
                                </Pressable>
                            </View>
                        )}

                        {/* TAB KONTEN: MANUAL */}
                        {activeTab === 'manual' && (
                            <View style={styles.tabBody}>
                                <Text style={styles.inputLabel}>MAC Address Bluetooth:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Contoh: 00:1D:A5:02:03:57"
                                    placeholderTextColor="#999"
                                    value={manualAddress}
                                    onChangeText={setManualAddress}
                                    autoCapitalize="characters"
                                />
                                <Pressable
                                    style={[styles.submitButton, !manualAddress.trim() && styles.submitButtonDisabled]}
                                    onPress={() => {
                                        onSelect(manualAddress.trim(), "Perangkat Manual");
                                        setManualAddress("");
                                    }}
                                    disabled={!manualAddress.trim()}
                                >
                                    <Text style={styles.submitButtonText}>Hubungkan</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

// ... styles tetap sama seperti yang kita buat sebelumnya ...
const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { width: "100%", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    closeBtn: { padding: 4 },
    tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
    tabActive: { borderBottomWidth: 2, borderBottomColor: "#0252ff" },
    tabText: { fontSize: 14, color: "#666", fontWeight: "600" },
    tabTextActive: { color: "#0252ff" },
    tabBody: { padding: 16, minHeight: 300, maxHeight: 400 },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 150 },
    scanText: { marginTop: 12, color: "#666", fontSize: 14 },
    deviceItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
    deviceInfo: { marginLeft: 12 },
    deviceName: { fontSize: 16, fontWeight: "bold", color: "#333" },
    deviceAddress: { fontSize: 12, color: "#888", marginTop: 2 },
    rescanButton: { marginTop: 16, padding: 12, backgroundColor: "#f0f4ff", borderRadius: 8, alignItems: "center" },
    rescanText: { color: "#0252ff", fontWeight: "bold" },
    inputLabel: { fontSize: 14, color: "#555", marginBottom: 8 },
    textInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16, color: "#333", marginBottom: 16, backgroundColor: "#fafafa" },
    submitButton: { backgroundColor: "#0252ff", padding: 14, borderRadius: 8, alignItems: "center" },
    submitButtonDisabled: { backgroundColor: "#ccc" },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});