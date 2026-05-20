import AppProvider from "@/contexts/AppProvider";
import { Stack } from "expo-router";

export default function Layout() {

    return (
        <AppProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen
                    name="drawer"
                    options={{
                        animation: "slide_from_left",
                        presentation: "containedModal",
                    }}
                />
            </Stack>
        </AppProvider>
    );
}