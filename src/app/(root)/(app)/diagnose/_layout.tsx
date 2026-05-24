import BluetoothSuspense from "@/components/BluetoothSuspense";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(bluetooth)" />
            <Stack.Screen name="result" />
        </Stack>
    );
}