import { useEffect, useRef, useState, useCallback } from "react";
import ClassicBT from "react-native-bluetooth-classic";

export type CommandLog = {
    id: string;
    type: 'TX' | 'RX'; // TX = Pengiriman (Transmit), RX = Balasan (Receive)
    data: string;
    timestamp: Date;
};

export const useConnect = (address: string) => {
    // --- STATES ---
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commandLogs, setCommandLogs] = useState<CommandLog[]>([]); // State baru untuk log

    // --- REFS ---
    const readCallbacksRef = useRef<Set<(data: string) => void>>(new Set());
    const nativeReadSubscriptionRef = useRef<any>(null);
    const disconnectTimeoutRef = useRef<number | null>(null);

    // --- HELPER: LOGGING ---
    const addLog = useCallback((type: 'TX' | 'RX', data: string) => {
        setCommandLogs((prev) => [
            ...prev,
            { id: `${Date.now()}-${Math.random()}`, type, data, timestamp: new Date() }
        ]);
    }, []);

    const clearLogs = useCallback(() => {
        setCommandLogs([]);
    }, []);

    // --- CORE BLUETOOTH FUNCTIONS ---
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
            const isAlreadyConnected = await ClassicBT.isDeviceConnected(address);
            if (isAlreadyConnected) {
                setConnected(true);
                return;
            }

            const device = await ClassicBT.connectToDevice(address, {
                delimiter: '>', // Sangat krusial untuk ELM327
                readTimeout: 10000,
            });

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

    const request = (command: string, timeoutMs: number = 6000): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            if (!connected) {
                return reject(new Error("Perangkat tidak terhubung"));
            }

            const finalCommand = command.endsWith('\r') ? command : command + '\r';
            addLog('TX', command);

            let timeoutHandle = setTimeout(() => {
                reject(new Error("Request timeout: Tidak ada respon dalam waktu yang ditentukan"));
            }, timeoutMs);
            const subscription = ClassicBT.onDeviceRead(address, (event) => {

                console.log(`[${command}]:`, event.data);
                subscription.remove();
                clearTimeout(timeoutHandle);
                const cleanData = event.data.replace(/[\r\n]+/g, ' ').trim();
                addLog('RX', cleanData);
                resolve(cleanData);
            });

            await ClassicBT.writeToDevice(address, finalCommand, 'ascii').catch((err) => {
                clearTimeout(timeoutHandle);
                subscription.remove();
                reject(err);
            });
            console.log(`[${command}] Dikirim ke perangkat, menunggu respon...`);
        });
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
    // useEffect(() => {
    //     if (nativeReadSubscriptionRef.current) {
    //         nativeReadSubscriptionRef.current.remove();
    //         nativeReadSubscriptionRef.current = null;
    //     }

    //     const bindNativeListener = async () => {
    //         const isConnected = await ClassicBT.isDeviceConnected(address);
    //         if (!isConnected) return;

    //         console.log("Binding listener untuk perangkat:", address);

    //         nativeReadSubscriptionRef.current = ClassicBT.onDeviceRead(address, (event) => {
    //             console.log("Data diterima dari perangkat:", event);
    //             // Bersihkan karakter \r dan \n 
    //             const cleanData = event.data.replace(/[\r\n]+/g, ' ').trim();
    //             if (!cleanData) return
    //             // Teruskan data ke subscriber (termasuk fungsi request)
    //             readCallbacksRef.current.forEach((cb) => cb(cleanData));
    //         });
    //     }

    //     bindNativeListener();

    //     return () => {
    //         if (nativeReadSubscriptionRef.current) {
    //             nativeReadSubscriptionRef.current.remove();
    //             nativeReadSubscriptionRef.current = null;
    //         }
    //     };
    // }, [connected, address, addLog]);

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
                addLog('RX', '[SYSTEM] Perangkat Terputus');
            }
        });

        return () => {
            isMounted = false;
            if (disconnectSub) disconnectSub.remove();

            // Fast Refresh Protection: Beri jeda 500ms sebelum disconnect native
            disconnectTimeoutRef.current = setTimeout(() => {
                ClassicBT.disconnectFromDevice(address).catch(() => { });
            }, 500);
        };
    }, [address, connect, addLog]);

    return {
        connecting,
        connected,
        error,
        commandLogs,
        connect,
        disconnect,
        // write,
        request,
        onDataReceived,
        clearLogs
    };
};