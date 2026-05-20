import { Fonts } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

export type SelectFieldOption<T extends string | number> = {
    label: string;
    value: T;
};

export type SelectFieldProps<T extends string | number> = {
    label?: string;
    helperText?: string;
    errorText?: string;
    placeholder?: string;
    options: SelectFieldOption<T>[];
    value?: T | null;
    onValueChange: (value: T) => void;
    disabled?: boolean;
};

export function SelectField<T extends string | number>({
    label,
    helperText,
    errorText,
    placeholder = 'Pilih opsi',
    options,
    value,
    onValueChange,
    disabled = false,
}: SelectFieldProps<T>) {
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);
    const hasError = Boolean(errorText);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value]
    );

    const handleSelect = (selectedValue: T) => {
        onValueChange(selectedValue);
        setOpen(false);
    };

    return (
        <View style={styles.container}>
            {label ? (
                <Text style={[styles.label, { color: colors.textSecondary }]} type="smallBold">
                    {label}
                </Text>
            ) : null}

            <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => setOpen(true)}
                style={[
                    styles.field,
                    {
                        backgroundColor: disabled ? colors.bgSelected : colors.bgElement,
                        borderColor: hasError ? colors.error : colors.bgSelected,
                        opacity: disabled ? 0.7 : 1,
                    },
                ]}
            >
                <Text
                    type="default"
                    style={[
                        styles.fieldText,
                        { color: selectedOption ? colors.text : colors.textSecondary },
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>

                <MaterialCommunityIcons
                    name="chevron-down"
                    size={22}
                    color={colors.textSecondary}
                />
            </Pressable>

            {errorText ? (
                <Text style={[styles.helper, { color: colors.error }]} type="small">
                    {errorText}
                </Text>
            ) : helperText ? (
                <Text style={[styles.helper, { color: colors.textSecondary }]} type="small">
                    {helperText}
                </Text>
            ) : null}

            <Modal
                animationType="fade"
                transparent
                visible={open}
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <Pressable
                        style={[
                            styles.sheet,
                            { backgroundColor: colors.bg, borderColor: colors.bgSelected },
                        ]}
                        onPress={() => null}
                    >
                        <View style={styles.sheetHeader}>
                            <Text type="smallBold" style={{ color: colors.text }}>
                                {label ?? 'Pilih opsi'}
                            </Text>
                            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            </Pressable>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;

                                return (
                                    <Pressable
                                        onPress={() => handleSelect(item.value)}
                                        style={[
                                            styles.option,
                                            {
                                                backgroundColor: isSelected
                                                    ? colors.bgSelected
                                                    : colors.bg,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: isSelected ? colors.primary : colors.text,
                                                },
                                            ]}
                                            type="default"
                                        >
                                            {item.label}
                                        </Text>
                                        {isSelected ? (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        ) : null}
                                    </Pressable>
                                );
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={[styles.separator, { backgroundColor: colors.bgSelected }]} />
                            )}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    Tidak ada opsi.
                                </Text>
                            }
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        marginLeft: 2,
    },
    field: {
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    fieldText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: Fonts.medium,
        includeFontPadding: false,
    },
    helper: {
        marginLeft: 2,
    },
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheet: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    sheetHeader: {
        minHeight: 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    option: {
        minHeight: 52,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: Fonts.medium,
        includeFontPadding: false,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
    },
    emptyText: {
        padding: 16,
        textAlign: 'center',
    },
});