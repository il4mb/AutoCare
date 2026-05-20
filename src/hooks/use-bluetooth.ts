import { useState, useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import * as ExpoDevice from 'expo-device';

export function useBluetooth() {
    const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
    const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingPaired, setIsLoadingPaired] = useState(false);

    // Meminta Izin Bluetooth & Lokasi (Khusus Android)
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Izin Lokasi',
                        message: 'Bluetooth membutuhkan akses lokasi untuk mencari perangkat',
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
        return true; // iOS biasanya diurus via Info.plist
    };

    // Mengambil perangkat yang sudah dipairing (Bonded Devices)
    const fetchPairedDevices = useCallback(async () => {
        setIsLoadingPaired(true);
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const bonded = await RNBluetoothClassic.getBondedDevices();
            setPairedDevices(bonded);
        } catch (error) {
            console.error("Gagal mengambil perangkat tersimpan:", error);
        } finally {
            setIsLoadingPaired(false);
        }
    }, []);

    // Memulai pemindaian perangkat baru
    const startScan = useCallback(async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            setScannedDevices([]);
            setIsScanning(true);

            // RNBluetoothClassic.startDiscovery() mengembalikan perangkat yang ditemukan
            const discovered = await RNBluetoothClassic.startDiscovery();
            setScannedDevices(discovered);
        } catch (error) {
            console.error("Gagal melakukan pemindaian:", error);
        } finally {
            setIsScanning(false);
        }
    }, []);

    // Menghentikan pemindaian
    const stopScan = useCallback(async () => {
        try {
            await RNBluetoothClassic.cancelDiscovery();
            setIsScanning(false);
        } catch (error) {
            console.error("Gagal menghentikan pemindaian:", error);
        }
    }, []);

    // Pastikan scanning berhenti jika komponen di-unmount
    useEffect(() => {
        return () => {
            if (isScanning) {
                RNBluetoothClassic.cancelDiscovery();
            }
        };
    }, [isScanning]);

    return {
        pairedDevices,
        scannedDevices,
        isScanning,
        isLoadingPaired,
        fetchPairedDevices,
        startScan,
        stopScan,
    };
}