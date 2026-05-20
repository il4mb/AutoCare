import VehicleSuspension from '@/components/VehicleSuspension';
import { Stack } from 'expo-router';
import { ReactNode } from 'react';

interface LayoutProps {

}

export default function Layout({ }: LayoutProps) {
    return (
        <VehicleSuspension>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
            </Stack>
        </VehicleSuspension>
    );
}