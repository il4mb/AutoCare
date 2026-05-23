import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="create-diagnose" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="edit-profile" />
        </Stack>
    )
}