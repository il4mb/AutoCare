import { useEffect, useRef, useState, useCallback } from "react";
import ClassicBT, { BluetoothDeviceEvent } from "react-native-bluetooth-classic";

export const useConnect = (address: string) => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Menyimpan fungsi callback JS dari UI (Bisa diisi kapan saja, bahkan sebelum connect)
    const readCallbacksRef = useRef<Set<(data: string) => void>>(new Set());

    // Menyimpan 1 listener native bawaan library
    const nativeReadSubscriptionRef = useRef<any>(null);

    const disconnect = useCallback(async () => {
        if (!address) return;
        setConnecting(true);
        setError(null);
        try {
            await ClassicBT.disconnectFromDevice(address);
            setConnected(false); // Ini akan memicu cleanup pada Effect 1
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
        if (!connected) {
            console.warn("Tidak dapat mengirim data: Perangkat tidak terhubung");
            return;
        }
        try {
            await ClassicBT.writeToDevice(address, data);
        } catch (err) {
            throw new Error("Gagal mengirim data ke perangkat");
        }
    };

    // Fungsi untuk UI mendengarkan data. 
    // Aman dipanggil di useEffect UI kapan pun tanpa error native.
    const onDataReceived = useCallback((callback: (data: string) => void) => {
        // Simpan callback ke dalam memori
        readCallbacksRef.current.add(callback);

        // Return fungsi cleanup untuk UI (unsubscribe)
        return () => {
            readCallbacksRef.current.delete(callback);
        };
    }, []);

    // ------------------------------------------------------------------
    // EFFECT 1: BIND & UNBIND NATIVE LISTENER SECARA OTOMATIS
    // ------------------------------------------------------------------
    useEffect(() => {
        // Jika sedang terhubung, jalankan Native Listener
        if (connected && address) {
            nativeReadSubscriptionRef.current = ClassicBT.onDeviceRead(address, (event) => {
                // Teruskan data yang masuk ke semua fungsi yang tersimpan di memori
                readCallbacksRef.current.forEach((cb) => cb(event.data));
            });
        }

        // Cleanup: Jika disconnect (connected berubah false) atau komponen unmount
        return () => {
            if (nativeReadSubscriptionRef.current) {
                nativeReadSubscriptionRef.current.remove();
                nativeReadSubscriptionRef.current = null;
            }
        };
    }, [connected, address]);

    // ------------------------------------------------------------------
    // EFFECT 2: CEK KONEKSI AWAL & MONITOR SYSTEM DISCONNECT
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!address) return;
        let isMounted = true;
        let disconnectSub: any = null;

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

        // Dengarkan jika perangkat tiba-tiba terputus (contoh: alat mati / hilang sinyal)
        disconnectSub = ClassicBT.onDeviceDisconnected((event) => {
            if (event.device.address === address && isMounted) {
                setConnected(false);
            }
        });

        return () => {
            isMounted = false;

            // Hapus listener pemantau disconnect sistem
            if (disconnectSub) {
                disconnectSub.remove();
            }

            // Putuskan koneksi native sepenuhnya saat keluar dari layar
            ClassicBT.disconnectFromDevice(address).catch(() => { });
        };
    }, [address, connect]);

    return { connecting, connected, error, connect, disconnect, write, onDataReceived };
};