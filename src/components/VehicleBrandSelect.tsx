import { useVehicleBrands } from "@/hooks/use-vehicle-brands";
import { View } from "./View";
import { SelectField } from "./SelectField";
import { useEffect } from "react";
import { Text } from "./Text";
import { ActivityIndicator } from "react-native";
import { useTheme } from '@react-navigation/native';

interface VehicleBrandSelectProps {
}

export default function VehicleBrandSelect({ }: VehicleBrandSelectProps) {
    const { colors } = useTheme();
    const { brands, fetchBrands, loading, error } = useVehicleBrands();

    const onChange = (value: number) => {

    }

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    return (
        <View>
            <SelectField
                label="Pilih Merek Kendaraan"
                options={brands.map(brand => ({ label: brand.name, value: brand.id }))}
                onValueChange={onChange}
                disabled={loading || !!error} />
            {loading && (
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                    <ActivityIndicator size="small" color="#0000ff" />
                    <Text>Memuat merek kendaraan...</Text>
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
                        Gagal memuat merek kendaraan
                    </Text>
                    <Text style={{ color: colors.error }}>
                        {error.message}
                    </Text>
                </View>
            )}
        </View>
    );
}