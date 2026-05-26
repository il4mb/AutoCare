import { useVehicleBrands } from "@/hooks/use-vehicle-brands";
import i18n from "@/localization";
import { useTheme } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SelectField } from "./SelectField";
import { Text } from "./Text";
import { View } from "./View";

interface VehicleBrandSelectProps {
    onChange?: (value: string) => void;
}

export default function VehicleBrandSelect({ onChange }: VehicleBrandSelectProps) {
    
    const { colors } = useTheme();
    const { brands, fetchBrands, loading, error } = useVehicleBrands();
    const [value, setValue] = useState<string>("");

    const options = useMemo(() => {
        return [{
            label: i18n.t("vehicle.brandPlaceholder"),
            value: "",
        }, ...brands.map(brand => ({ label: brand.name, value: brand.id }))];
    }, [brands]);

    const handleBrandChange = useCallback((value: string) => {
        setValue(value);
        if (onChange) {
            onChange(value);
        }
    }, [onChange]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    return (
        <View>
            <SelectField
                label={i18n.t("vehicle.brandPlaceholder")}
                options={options}
                value={value}
                onValueChange={handleBrandChange}
                disabled={loading || !!error} />
            {loading && (
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                    <ActivityIndicator size="small" color="#0000ff" />
                    <Text>{i18n.t("vehicle.loadingBrands")}</Text>
                </View>
            )}
            {error && (
                <View style={{
                    marginTop: 8,
                    padding: 18,
                    backgroundColor: '#ffe5e5',
                    borderRadius: 18,
                    borderColor: '#ffcccc',
                    borderWidth: 1,
                }}>
                    <Text style={{
                        fontWeight: 'bold', marginBottom: 4,
                        color: colors.error,
                    }}>
                        {i18n.t("vehicle.loadBrandsFailed")}
                    </Text>
                    <Text style={{ color: colors.error }}>
                        {error.message}
                    </Text>
                </View>
            )}
        </View>
    );
}