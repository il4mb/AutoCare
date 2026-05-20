import BluetoothSuspense from "@/components/BluetoothSuspense";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <BluetoothSuspense>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </BluetoothSuspense>
    );
}