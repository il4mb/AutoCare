import { useEffect, useRef, useState, useCallback } from "react";
import ClassicBT, { BluetoothDeviceEvent } from "react-native-bluetooth-classic";

export const useConnect = (address: string) => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Array untuk menampung semua subscription agar mudah di-cleanup
    const subscriptionsRef = useRef<any[]>([]);

    const disconnect = useCallback(async () => {
        if (!address) return;
        setConnecting(true);
        setError(null);
        try {
            await ClassicBT.disconnectFromDevice(address);
            setConnected(false);
        } catch (err) {
            setError("Gagal memutuskan koneksi");
        } finally {
            setConnecting(false);
        }
    }, [address]);

    const connect = useCallback(async () => {
        if (!address) return;
        setConnecting(true);
        setError(null);
        try {
            const device = await ClassicBT.connectToDevice(address);
            const isConnected = await device.isConnected();
            setConnected(isConnected);
            if (!isConnected) {
                setError("Gagal terhubung ke perangkat");
            }
        } catch (err) {
            setError("Gagal terhubung ke perangkat");
            setConnected(false);
        } finally {
            setConnecting(false);
        }
    }, [address]);

    const write = async (data: string) => {
        if (!connected) throw new Error("Perangkat belum terhubung");
        try {
            await ClassicBT.writeToDevice(address, data);
        } catch (err) {
            throw new Error("Gagal mengirim data ke perangkat");
        }
    };

    // Fungsi khusus untuk mendengarkan data masuk dari sensor/OBD
    const onDataReceived = useCallback((callback: (data: string) => void) => {
        // Gunakan onDeviceRead bawaan library
        const subscription = ClassicBT.onDeviceRead(address, (event) => {
            callback(event.data);
        });

        subscriptionsRef.current.push(subscription);

        // Return fungsi untuk unsubscribe manual jika dibutuhkan
        return () => {
            subscription.remove();
            subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub !== subscription);
        };
    }, [address]);

    // Effect utama untuk Cek Koneksi Awal, Auto-Connect, dan Monitor Disconnect
    useEffect(() => {
        if (!address) return;
        let isMounted = true;

        const checkConnection = async () => {
            try {
                const isConnected = await ClassicBT.isDeviceConnected(address);
                if (isMounted) {
                    if (!isConnected) {
                        connect();
                    } else {
                        setConnected(true);
                    }
                }
            } catch (err) {
                console.error("Error mengecek status koneksi:", err);
            }
        };

        checkConnection();

        // Dengarkan jika perangkat tiba-tiba terputus (misal: alat dimatikan)
        const disconnectSub = ClassicBT.onDeviceDisconnected((event) => {
            if (event.device.address === address && isMounted) {
                setConnected(false);
            }
        });
        subscriptionsRef.current.push(disconnectSub);

        // CLEANUP: Dipanggil HANYA saat komponen unmount atau address berubah
        return () => {
            isMounted = false;

            // 1. Hapus semua listener/subscription agar tidak memory leak
            subscriptionsRef.current.forEach(sub => sub.remove());
            subscriptionsRef.current = [];

            // 2. Putuskan koneksi dari perangkat (Pastikan Anda memang ingin putus saat keluar layar)
            ClassicBT.disconnectFromDevice(address).catch(() => { });
        };
    }, [address, connect]);

    return { connecting, connected, error, connect, disconnect, write, onDataReceived };
};