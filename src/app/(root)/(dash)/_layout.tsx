import RootLayout from "@/components/roots/RootLayout";
import { Stack } from "expo-router";

export default function DashLayout() {

    return (
        <RootLayout>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </RootLayout>
    );
}