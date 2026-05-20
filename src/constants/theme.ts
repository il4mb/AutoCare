/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
    text: '#000000',
    textInverted: '#ffffff',
    primary: '#0252ff',
    bgPrimary: '#d7dae6',
    textPrimary: '#8eccff',
    secondary: '#ffae00',
    bgSecondary: '#f9f0fc',
    textSecondary: '#5e5e5e',
    error: '#ff3b30',
    bgError: '#ffe5e0',
    textError: '#ff8c86',
    success: '#34c759',
    bgSuccess: '#e5f9eb',
    textSuccess: '#93ffae',
    info: '#007aff',
    bgInfo: '#e0f0ff',
    textInfo: '#9ecdff',
    bg: '#ffffff',
    bgElement: '#F0F0F3',
    bgSelected: '#E0E1E6',
    border: '#ddd',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
    default: {
        regular: 'GoogleSansRegular',
        medium: 'GoogleSansMedium',
        semiBold: 'GoogleSansSemiBold',
        bold: 'GoogleSansBold',
        mono: 'monospace',
    }
});

export const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
