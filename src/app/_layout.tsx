
import { useFonts, GoogleSans_400Regular, GoogleSans_400Regular_Italic, GoogleSans_500Medium, GoogleSans_500Medium_Italic, GoogleSans_600SemiBold, GoogleSans_600SemiBold_Italic, GoogleSans_700Bold, GoogleSans_700Bold_Italic } from '@expo-google-fonts/google-sans';
import { Colors } from '@/constants/theme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { StatusBar } from 'react-native';

export default function TabLayout() {

    const [fontsLoaded] = useFonts({
        GoogleSansRegular: GoogleSans_400Regular,
        GoogleSansRegularItalic: GoogleSans_400Regular_Italic,
        GoogleSansMedium: GoogleSans_500Medium,
        GoogleSansMediumItalic: GoogleSans_500Medium_Italic,
        GoogleSansSemiBold: GoogleSans_600SemiBold,
        GoogleSansSemiBoldItalic: GoogleSans_600SemiBold_Italic,
        GoogleSansBold: GoogleSans_700Bold,
        GoogleSansBoldItalic: GoogleSans_700Bold_Italic,
    });

    const theme = useMemo(() => ({
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            ...Colors
        }
    }), []);

    return (
        <ThemeProvider value={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(root)" />
            </Stack>
            <StatusBar barStyle={"dark-content"} />
        </ThemeProvider>
    );
}
