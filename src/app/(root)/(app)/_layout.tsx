import Drawer from "@/components/Drawer";
import { Stack } from "expo-router";

export default function Layout() {

    return (
        <Drawer>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </Drawer>
    );
}