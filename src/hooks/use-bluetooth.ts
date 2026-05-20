import { useState, useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import BTClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import * as ExpoDevice from 'expo-device';

export function useBluetooth() {
    const [connected, setConnected] = useState<BluetoothDevice[]>([]);
    const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
    const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingPaired, setIsLoadingPaired] = useState(false);

    // Ref untuk mencegah race-condition di UI saat tombol dipencet berkali-kali
    const isScanningRef = useRef(false);

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
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
        return true;
    };

    const fetchPairedDevices = useCallback(async () => {
        setIsLoadingPaired(true);
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const bonded = await BTClassic.getBondedDevices();
            setPairedDevices(bonded);
        } catch (error) {
            console.error("Gagal mengambil perangkat tersimpan:", error);
        } finally {
            setIsLoadingPaired(false);
        }
    }, []);

    const startScan = useCallback(async () => {
        if (isScanningRef.current) return;

        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            setScannedDevices([]);
            setIsScanning(true);
            isScanningRef.current = true;

            await BTClassic.cancelDiscovery();
            const discovered = await BTClassic.startDiscovery();
            setScannedDevices(discovered);

        } catch (error: any) {
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('already in discovery mode') || errorMessage.includes('discovering')) {
                try {
                    await BTClassic.cancelDiscovery();
                    const discovered = await BTClassic.startDiscovery();
                    setScannedDevices(discovered);
                } catch (retryError) {
                    console.error("Gagal scan ulang:", retryError);
                }
            } else {
                console.error("Gagal melakukan pemindaian:", error);
            }
        } finally {
            setIsScanning(false);
            isScanningRef.current = false;
        }
    }, []);

    const stopScan = useCallback(async () => {
        if (!isScanningRef.current) return;

        try {
            await BTClassic.cancelDiscovery();
        } catch (error: any) {
            console.log("Berhenti pemindaian:", error?.message);
        } finally {
            setIsScanning(false);
            isScanningRef.current = false;
        }
    }, []);

    // ---------------------------------------------------------
    // 1. EFFECT KHUSUS UNTUK LISTENER KONEKSI & STATUS
    // ---------------------------------------------------------
    const refreshConnectedDevices = useCallback(async () => {
        try {
            const connectedDevices = await BTClassic.getConnectedDevices();
            setConnected(connectedDevices);
        } catch (error) {
            console.error("Gagal mengambil perangkat yang terhubung:", error);
        }
    }, []);

    useEffect(() => {
        // Ambil data pertama kali saat komponen mount
        refreshConnectedDevices();

        const connectSub = BTClassic.onDeviceConnected((event) => {
            console.log("Terhubung dengan perangkat:", event.device.name || event.device.address);
            refreshConnectedDevices();
        });

        const disconnectSub = BTClassic.onDeviceDisconnected((event) => {
            console.log("Terputus dari perangkat:", event.device.name || event.device.address);
            // Anda juga bisa melakukan state update manual: 
            // setConnected(prev => prev.filter(d => d.address !== event.device.address));
            refreshConnectedDevices();
        });

        const stateSub = BTClassic.onStateChanged((state) => {
            console.log("Status Bluetooth berubah:", state.enabled);
            if (state.enabled) {
                refreshConnectedDevices();
            } else {
                // Jika Bluetooth mati, kosongkan state connected
                setConnected([]);
            }
        });

        return () => {
            connectSub.remove();
            disconnectSub.remove();
            stateSub.remove();
        };
    }, [refreshConnectedDevices]);

    // ---------------------------------------------------------
    // 2. EFFECT KHUSUS UNTUK CLEANUP DISCOVERY SAAT UNMOUNT
    // ---------------------------------------------------------
    useEffect(() => {
        return () => {
            if (isScanningRef.current) {
                BTClassic.cancelDiscovery().catch(() => { });
            }
        };
    }, []);

    return {
        connected,
        pairedDevices,
        scannedDevices,
        isScanning,
        isLoadingPaired,
        fetchPairedDevices,
        startScan,
        stopScan,
        // Optional: Anda bisa mengekspos fungsi ini jika ingin memanggilnya manual setelah connect di UI
        refreshConnectedDevices,
    };
}