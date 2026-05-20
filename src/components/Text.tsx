import { Platform, Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { Fonts, ThemeColor } from '@/constants/theme';
import { useMemo } from 'react';

export type TextProps = RNTextProps & {
    type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
    themeColor?: ThemeColor;
};

export function Text({ style, type = 'default', themeColor, ...rest }: TextProps) {

    // 1. Tentukan base font berdasarkan type
    const baseFontFamily = useMemo(() => {
        switch (type) {
            case 'default': return Fonts.regular;
            case 'title': return Fonts.semiBold;
            case 'small': return Fonts.regular;
            case 'smallBold': return Fonts.bold;
            case 'subtitle': return Fonts.semiBold;
            case 'link': return Fonts.regular;
            case 'linkPrimary': return Fonts.regular;
            case 'code': return Fonts.mono;
            default: return Fonts.regular;
        }
    }, [type]);

    // 2. Flatten styles untuk mengekstrak properti menjadi satu object statis
    const flatStyle = StyleSheet.flatten([
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
    ]);

    // 3. Pisahkan (buang) fontFamily dan fontWeight dari sisa style
    // @ts-ignore - Kita tahu fontFamily dan fontWeight akan di-handle secara manual, jadi kita bisa abaikan dari tipe style yang diteruskan ke RNText
    const { fontFamily: _ignoredFontFamily, fontWeight, ...cleanStyle } = flatStyle || {};

    // 4. Mapping fontWeight ke Fonts jika fontWeight terdeteksi
    const resolvedFontFamily = useMemo(() => {
        if (!fontWeight) return baseFontFamily;

        // Ubah jadi string agar aman membandingkan angka (misal: 700) maupun string ('bold')
        const weight = String(fontWeight).toLowerCase();

        if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
            return Fonts.bold;
        }
        if (weight === '600') {
            return Fonts.semiBold;
        }
        if (weight === 'normal' || weight === '400' || weight === '500') {
            return Fonts.regular;
        }

        // Fallback jika nilainya tidak dikenali
        return baseFontFamily;
    }, [fontWeight, baseFontFamily]);

    return (
        <RNText
            // Gabungkan style yang sudah bersih dengan fontFamily hasil mapping
            style={[cleanStyle, { fontFamily: resolvedFontFamily, includeFontPadding: false }]}
            {...rest}
        />
    );
}

// Catatan: fontWeight dan fontFamily sudah saya hapus dari StyleSheet di bawah
// Karena properti tersebut kini sepenuhnya diurus oleh logika mapping di atas berdasarkan `type`.
const styles = StyleSheet.create({
    small: {
        fontSize: 14,
        lineHeight: 20,
    },
    smallBold: {
        fontSize: 14,
        lineHeight: 20,
    },
    default: {
        fontSize: 16,
        lineHeight: 18,
    },
    title: {
        fontSize: 48,
    },
    subtitle: {
        fontSize: 32,
        lineHeight: 44,
    },
    link: {
        lineHeight: 30,
        fontSize: 14,
    },
    linkPrimary: {
        lineHeight: 30,
        fontSize: 14,
        color: '#3c87f7',
    },
    code: {
        fontSize: 12,
    },
});