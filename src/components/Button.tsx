import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';

export type ButtonProps = {
    title: string;
    onPress: () => void;
    color?: ThemeColor;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    loading?: boolean;
};

export function Button({
    title,
    onPress,
    color = 'primary',
    style,
    disabled = false,
    loading = false,
}: ButtonProps) {
    const { colors } = useTheme();
    const isDisabled = disabled || loading;

    const backgroundColor = colors[color] ?? colors.primary;
    const textColor = color === 'bg' || color === 'bgElement' || color === 'bgSelected'
        ? colors.text
        : colors.textInverted;

    return (
        <Pressable
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.base,
                {
                    backgroundColor,
                    borderColor: backgroundColor,
                },
                style,
                {
                    opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
                },
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={textColor}
                    />
                ) : null}

                <Text
                    type="smallBold"
                    style={[
                        styles.label,
                        {
                            color: textColor,
                        },
                    ]}
                >
                    {title}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    label: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: Fonts.medium,
        includeFontPadding: false,
    },
});