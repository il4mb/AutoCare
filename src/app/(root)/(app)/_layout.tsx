import DashLayout from "@/components/dash/DashLayout";
import { Stack } from "expo-router";

export default function Layout() {

    return (
        <DashLayout>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </DashLayout>
    );
}