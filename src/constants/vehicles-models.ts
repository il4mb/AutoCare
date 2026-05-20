export interface ObdMetric {
    pid: string;          // Hexadecimal standard identifier
    name: string;         // Unique uppercase identifier key matching emulator
    label: string;        // Human readable name
    unit: string;         // Unit of measurement
    min: number;          // Minimum expected gauge value
    max: number;          // Maximum expected gauge value
    bytes: number;        // Expected response payload data length
}
export interface VehicleModel {
    brand: string;
    model: string;
    year: string;
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    obdMetrics: ObdMetric[];
}

export const VEHICLE_MODELS: VehicleModel[] = [
    {
        brand: 'Honda',
        model: 'Brio',
        year: '2020',
        fuelType: 'gasoline',
        obdMetrics: [
            { pid: '0C', name: 'Engine RPM', label: 'RPM', unit: 'rpm', min: 0, max: 8000, bytes: 2 },
            { pid: '0D', name: 'Vehicle Speed', label: 'Speed', unit: 'km/h', min: 0, max: 240, bytes: 1 },
            { pid: '05', name: 'Engine Coolant Temperature', label: 'Coolant Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '0F', name: 'Intake Air Temperature', label: 'Intake Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '11', name: 'Throttle Position', label: 'Throttle Pos', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '04', name: 'Calculated Engine Load', label: 'Engine Load', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '2F', name: 'Fuel Tank Level Input', label: 'Fuel Level', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '0A', name: 'Fuel Pressure', label: 'Fuel Pressure', unit: 'kPa', min: 0, max: 765, bytes: 1 },
            { pid: '33', name: 'Barometric Pressure', label: 'Barometric Pressure', unit: 'kPa', min: 0, max: 255, bytes: 1 },
            { pid: '0E', name: 'Timing Advance', label: 'Timing Advance', unit: '°', min: -64, max: 63.5, bytes: 1 },
            { pid: '46', name: 'Ambient Air Temperature', label: 'Ambient Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '5C', name: 'Engine Oil Temperature', label: 'Oil Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '42', name: 'Control Module Voltage', label: 'Voltage', unit: 'V', min: 0, max: 65.535, bytes: 2 },
        ]
    },
    {
        brand: 'Toyota',
        model: 'Avanza',
        year: '2021',
        fuelType: 'gasoline',
        obdMetrics: [
            { pid: '0C', name: 'Engine RPM', label: 'RPM', unit: 'rpm', min: 0, max: 8000, bytes: 2 },
            { pid: '0D', name: 'Vehicle Speed', label: 'Speed', unit: 'km/h', min: 0, max: 240, bytes: 1 },
            { pid: '05', name: 'Engine Coolant Temperature', label: 'Coolant Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '0F', name: 'Intake Air Temperature', label: 'Intake Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '11', name: 'Throttle Position', label: 'Throttle Pos', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '04', name: 'Calculated Engine Load', label: 'Engine Load', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '2F', name: 'Fuel Tank Level Input', label: 'Fuel Level', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '0A', name: 'Fuel Pressure', label: 'Fuel Pressure', unit: 'kPa', min: 0, max: 765, bytes: 1 },
            { pid: '33', name: 'Barometric Pressure', label: 'Barometric Pressure', unit: 'kPa', min: 0, max: 255, bytes: 1 },
            { pid: '0E', name: 'Timing Advance', label: 'Timing Advance', unit: '°', min: -64, max: 63.5, bytes: 1 },
            { pid: '46', name: 'Ambient Air Temperature', label: 'Ambient Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '5C', name: 'Engine Oil Temperature', label: 'Oil Temp', unit: '°C', min: -40, max: 215, bytes: 1 },
            { pid: '42', name: 'Control Module Voltage', label: 'Voltage', unit: 'V', min: 0, max: 65.535, bytes: 2 },
        ]
    },
    {
        brand: 'Tesla',
        model: 'Model 3',
        year: '2022',
        fuelType: 'electric',
        obdMetrics: [
            { pid: '0C', name: 'Motor RPM', label: 'RPM', unit: 'rpm', min: 0, max: 20000, bytes: 2 },
            { pid: '0D', name: 'Vehicle Speed', label: 'Speed', unit: 'km/h', min: 0, max: 250, bytes: 1 },
            { pid: '05', name: 'Battery Temperature', label: 'Battery Temp', unit: '°C', min: -40, max: 125, bytes: 1 },
            { pid: '0F', name: 'Inverter Temperature', label: 'Inverter Temp', unit: '°C', min: -40, max: 125, bytes: 1 },
            { pid: '11', name: 'Throttle Position', label: 'Throttle Pos', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '04', name: 'Calculated Load', label: 'Load', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '2F', name: 'Battery Level', label: 'Battery Level', unit: '%', min: 0, max: 100, bytes: 1 },
            { pid: '0A', name: 'Battery Voltage', label: 'Battery Voltage', unit: 'V', min: 0, max: 400, bytes: 2 },
            { pid: '33', name: 'Ambient Temperature', label: 'Ambient Temp', unit: '°C', min: -40, max: 125, bytes: 1 },
            { pid: '0E', name: 'Timing Advance', label: 'Timing Advance', unit: '°', min: -64, max: 63.5, bytes: 1 },
            { pid: '46', name: 'Cabin Temperature', label: 'Cabin Temp', unit: '°C', min: -40, max: 125, bytes: 1 },
            { pid: '5C', name: 'Motor Temperature', label: 'Motor Temp', unit: '°C', min: -40, max: 125, bytes: 1 },
            { pid: '42', name: 'Control Module Voltage', label: 'Voltage', unit: 'V', min: 0, max: 65.535, bytes: 2 },
        ]
    }
];