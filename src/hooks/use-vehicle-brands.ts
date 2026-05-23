import { useState, useCallback } from "react";
import api from "@/api";

type VehicleBrand = {
    id: string;
    name: string;
}
export const useVehicleBrands = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [error, setError] = useState<Error | null>(null);

    const fetchBrands = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await api.get("/dictionary/brands");
            if (response.status !== 200) {
                if (response.status === 401) {
                    throw new Error("Unauthorized. Please log in again.");
                }
                throw new Error(`Failed to fetch brands: ${response.statusText}`);
            }
            if (!response.data.data || !Array.isArray(response.data.data)) {
                throw new Error("Unexpected response format for brands");
            }
            const data = response.data.data as VehicleBrand[];
            setBrands(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { brands, fetchBrands, loading, error };
}