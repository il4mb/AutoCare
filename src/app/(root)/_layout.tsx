import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProvider from "@/contexts/AppProvider";
import { Stack } from "expo-router";

export default function Layout() {

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <Stack>
                    <Stack.Screen
                        name="(app)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen name='add-profile' />
                </Stack>
            </AppProvider>
        </GestureHandlerRootView>
    );
}