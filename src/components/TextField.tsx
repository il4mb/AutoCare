import { useTheme } from '@react-navigation/native';
import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { Text } from './Text';
import { Fonts } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
    label?: string;
    helperText?: string;
    errorText?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
    { label, helperText, errorText, style, placeholderTextColor, editable = true, ...rest },
    ref
) {
    const { colors } = useTheme();
    const hasError = Boolean(errorText);

    return (
        <View style={styles.container}>
            {label ? (
                <Text style={[styles.label, { color: colors.textSecondary }]} type="smallBold">
                    {label}
                </Text>
            ) : null}

            <TextInput
                ref={ref}
                editable={editable}
                placeholderTextColor={placeholderTextColor ?? colors.textSecondary}
                style={[
                    styles.input,
                    {
                        backgroundColor: editable ? colors.bgElement : colors.bgSelected,
                        color: colors.text,
                        borderColor: hasError ? colors.error : colors.bgSelected,
                    },
                    style,
                ]}
                {...rest}
            />

            {errorText ? (
                <Text style={[styles.helper, { color: colors.error }]} type="small">
                    {errorText}
                </Text>
            ) : helperText ? (
                <Text style={[styles.helper, { color: colors.textSecondary }]} type="small">
                    {helperText}
                </Text>
            ) : null}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        marginLeft: 2,
    },
    input: {
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        fontSize: 16,
        fontFamily: Fonts.medium,
        includeFontPadding: false,
    },
    helper: {
        marginLeft: 2,
    },
});
