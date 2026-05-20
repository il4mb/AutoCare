import { useEffect, useRef, useState, useCallback } from "react";
import ClassicBT from "react-native-bluetooth-classic";

export const useConnect = (address: string) => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const readCallbacksRef = useRef<Set<(data: string) => void>>(new Set());
    const nativeReadSubscriptionRef = useRef<any>(null);
    const disconnectTimeoutRef = useRef<number | null>(null);

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

        // Batalkan jika kebetulan ada proses disconnect yang tertunda (Fast Refresh safety)
        if (disconnectTimeoutRef.current) {
            clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
        }

        setConnecting(true);
        setError(null);
        try {
            // Cek dulu apakah sebenarnya sudah terkoneksi dari sesi sebelum fast-refresh
            const isAlreadyConnected = await ClassicBT.isDeviceConnected(address);
            if (isAlreadyConnected) {
                setConnected(true);
                return;
            }

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

    const onDataReceived = useCallback((callback: (data: string) => void) => {
        readCallbacksRef.current.add(callback);
        return () => {
            readCallbacksRef.current.delete(callback);
        };
    }, []);

    // ------------------------------------------------------------------
    // EFFECT 1: BIND & UNBIND NATIVE LISTENER
    // ------------------------------------------------------------------
    useEffect(() => {
        // Hapus listener lama jika ada (mencegah duplikasi saat fast refresh)
        if (nativeReadSubscriptionRef.current) {
            nativeReadSubscriptionRef.current.remove();
            nativeReadSubscriptionRef.current = null;
        }

        if (connected && address) {
            nativeReadSubscriptionRef.current = ClassicBT.onDeviceRead(address, (event) => {
                readCallbacksRef.current.forEach((cb) => cb(event.data));
            });
        }

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

        disconnectSub = ClassicBT.onDeviceDisconnected((event) => {
            if (event.device.address === address && isMounted) {
                setConnected(false);
            }
        });

        return () => {
            isMounted = false;

            if (disconnectSub) {
                disconnectSub.remove();
            }

            // --- FAST REFRESH PROTECTION ---
            // Jangan langsung disconnect. Beri jeda 500ms. 
            // Jika ini adalah fast-refresh, komponen akan termount lagi sebelum 500ms
            // dan timeout ini akan dibatalkan di dalam fungsi `connect()`.
            disconnectTimeoutRef.current = setTimeout(() => {
                ClassicBT.disconnectFromDevice(address).catch(() => { });
            }, 500);
        };
    }, [address, connect]);

    return { connecting, connected, error, connect, disconnect, write, onDataReceived };
};