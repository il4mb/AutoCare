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
        // 1. Cegah double-click dari UI
        if (isScanningRef.current) return;

        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            setScannedDevices([]);
            setIsScanning(true);
            isScanningRef.current = true;

            await BTClassic.cancelDiscovery(); // Pastikan tidak ada sesi discovery lain yang berjalan
            const discovered = await BTClassic.startDiscovery();
            setScannedDevices(discovered);

        } catch (error: any) {
            // 2. Tangkap error spesifik jika OS sudah dalam mode discovery
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('already in discovery mode') || errorMessage.includes('discovering')) {
                console.log("Sistem sedang scan. Membatalkan sesi sebelumnya untuk memulai yang baru...");
                try {
                    await BTClassic.cancelDiscovery();
                    // Coba eksekusi ulang setelah dibatalkan
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
            // Abaikan error jika ternyata memang tidak sedang melakukan discovery
            console.log("Berhenti pemindaian:", error?.message);
        } finally {
            setIsScanning(false);
            isScanningRef.current = false;
        }
    }, []);

    // Bersihkan sesi scan saat komponen di unmount/keluar dari layar
    useEffect(() => {
        const getConnectedDevices = async () => {
            try {
                const connectedDevices = await BTClassic.getConnectedDevices();
                console.log("Perangkat yang terhubung saat ini:", connectedDevices);
                setConnected(connectedDevices);
            } catch (error) {
                console.error("Gagal mengambil perangkat yang terhubung:", error);
            }
        }
        getConnectedDevices();

        const subscriptions = [
            BTClassic.onDeviceConnected(() => getConnectedDevices()),
            BTClassic.onDeviceDisconnected(() => getConnectedDevices()),
            BTClassic.onStateChanged((state) => {
                console.log("Status Bluetooth berubah:", state);
                // Perbarui daftar perangkat terhubung saat status Bluetooth berubah
                getConnectedDevices();
            }),
        ];

        return () => {
            BTClassic.cancelDiscovery().catch(() => { });
            subscriptions.forEach(sub => sub.remove());
        }
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
    };
}