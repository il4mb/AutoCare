import { Stack } from "expo-router";

export default function Layout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(dash)" />
            <Stack.Screen
                name="drawer"
                options={{
                    animation: "slide_from_left",
                    presentation: "transparentModal",
                    contentStyle: {
                        backgroundColor: 'transparent',
                        maxWidth: 300,
                        width: '100%',
                    },
                    
                }}
            />
        </Stack>
    );
}