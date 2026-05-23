import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export const useInternetAvailable = () => {
    const [isInternetAvailable, setIsInternetAvailable] = useState<boolean>(false);

    useEffect(() => {
        const subscription = Network.addNetworkStateListener(({ isInternetReachable }) => {
            setIsInternetAvailable(isInternetReachable === true);
        });
        return () => {
            subscription?.remove();
        };
    }, []);

    return isInternetAvailable;
}