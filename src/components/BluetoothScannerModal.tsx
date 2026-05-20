import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable, Modal, TextInput, FlatList, ActivityIndicator, PermissionsAndroid, Platform, ViewProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { BleManager, Device } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";

// Inisialisasi BLE Manager di luar komponen agar tidak re-render
const bleManager = new BleManager();

interface BluetoothScannerModalProps {
    visible: boolean;
    blurTargetRef: React.RefObject<any>;
    onClose: () => void;
    onSelect: (address: string, name: string) => void;
}

export default function BluetoothScannerModal({ visible, blurTargetRef, onClose, onSelect }: BluetoothScannerModalProps) {

    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [manualAddress, setManualAddress] = useState("");

    // --- PERMISSIONS LOGIC ---
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'Bluetooth Low Energy requires Location',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const isReadGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
                const isConnectGranted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
                return (
                    isReadGranted === PermissionsAndroid.RESULTS.GRANTED &&
                    isConnectGranted === PermissionsAndroid.RESULTS.GRANTED
                );
            }
        }
        return true; // iOS diurus otomatis oleh info.plist / config plugin
    };

    // --- SCANNING LOGIC ---
    const startScan = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setDevices([]);
        setIsScanning(true);

        bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.error(error);
                setIsScanning(false);
                return;
            }

            // Simpan device jika memiliki nama (hilangkan device anonim)
            if (scannedDevice && scannedDevice.name) {
                setDevices((prevDevices) => {
                    if (!prevDevices.find((dev) => dev.id === scannedDevice.id)) {
                        return [...prevDevices, scannedDevice];
                    }
                    return prevDevices;
                });
            }
        });

        // Auto-stop scan setelah 10 detik untuk hemat baterai
        setTimeout(() => {
            stopScan();
        }, 10000);
    };

    const stopScan = () => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
    };

    // Bersihkan scanning saat modal ditutup
    useEffect(() => {
        if (visible && activeTab === 'scan') {
            startScan();
        } else {
            stopScan();
        }
        return () => stopScan();
    }, [visible, activeTab]);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <BlurView
                blurTarget={blurTargetRef} // Menggunakan referensi dari parent
                style={StyleSheet.absoluteFill}
                tint="dark"
                intensity={100}
                blurMethod="dimezisBlurView"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih Perangkat</Text>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <View style={styles.tabContainer}>
                            <Pressable
                                style={[styles.tabButton, activeTab === 'scan' && styles.tabActive]}
                                onPress={() => setActiveTab('scan')}
                            >
                                <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>Scan Device</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.tabButton, activeTab === 'manual' && styles.tabActive]}
                                onPress={() => setActiveTab('manual')}
                            >
                                <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Input Manual</Text>
                            </Pressable>
                        </View>

                        {/* TAB SCAN */}
                        {activeTab === 'scan' && (
                            <View style={styles.tabBody}>
                                {isScanning && devices.length === 0 ? (
                                    <View style={styles.centerContent}>
                                        <ActivityIndicator size="large" color="#0252ff" />
                                        <Text style={styles.scanText}>Mencari perangkat di sekitar...</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={devices}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({ item }) => (
                                            <Pressable
                                                style={styles.deviceItem}
                                                onPress={() => onSelect(item.id, item.name || "Unknown")}
                                            >
                                                <MaterialCommunityIcons name="bluetooth" size={20} color="#555" />
                                                <View style={styles.deviceInfo}>
                                                    <Text style={styles.deviceName}>{item.name}</Text>
                                                    <Text style={styles.deviceAddress}>{item.id}</Text>
                                                </View>
                                            </Pressable>
                                        )}
                                        ListEmptyComponent={
                                            <View style={styles.centerContent}>
                                                <Text style={styles.scanText}>Tidak ada perangkat ditemukan.</Text>
                                            </View>
                                        }
                                    />
                                )}
                                <Pressable
                                    style={styles.rescanButton}
                                    onPress={isScanning ? stopScan : startScan}
                                >
                                    <Text style={styles.rescanText}>
                                        {isScanning ? "Berhenti Pindai" : "Pindai Ulang"}
                                    </Text>
                                </Pressable>
                            </View>
                        )}

                        {/* TAB MANUAL */}
                        {activeTab === 'manual' && (
                            <View style={styles.tabBody}>
                                <Text style={styles.inputLabel}>Masukkan MAC Address Bluetooth:</Text>
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
                                    onPress={() => onSelect(manualAddress.trim(), "Perangkat Manual")}
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
});