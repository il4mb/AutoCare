export interface ObdMetric {
    pid: string;          // Hexadecimal standard identifier
    name: string;         // Unique uppercase identifier key matching emulator
    label: string;        // Human readable name
    unit: string;         // Unit of measurement
    min: number;          // Minimum expected gauge value
    max: number;          // Maximum expected gauge value
    bytes: number;        // Expected response payload data length
}
    

export const VECHICLES_METRICS = [
    {
        name: 'Honda',
        metrics: [
            { pid: '0C', name: 'Engine RPM' },
            { pid: '0D', name: 'Vehicle Speed' },
            { pid: '05', name: 'Engine Coolant Temperature' },
            { pid: '0F', name: 'Intake Air Temperature' },
            { pid: '11', name: 'Throttle Position' },
            { pid: '04', name: 'Calculated Engine Load' },
            { pid: '2F', name: 'Fuel Tank Level Input' },
            { pid: '0A', name: 'Fuel Pressure' },
            { pid: '33', name: 'Barometric Pressure' },
            { pid: '0E', name: 'Timing Advance' },
            { pid: '46', name: 'Ambient Air Temperature' },
            { pid: '5C', name: 'Engine Oil Temperature' },
            { pid: '42', name: 'Control Module Voltage' }
        ]
    },
    {
        name: "Honda Brio",
        metrics: [
            { pid: '0C', name: 'Engine RPM' },
            { pid: '0D', name: 'Vehicle Speed' },
            { pid: '05', name: 'Engine Coolant Temperature' },
        ]
    },
    {
        name: 'Toyota',
        metrics: [
            { pid: '0C', name: 'Engine RPM' },
            { pid: '0D', name: 'Vehicle Speed' },
            { pid: '05', name: 'Engine Coolant Temperature' },
            { pid: '0F', name: 'Intake Air Temperature' },
            { pid: '11', name: 'Throttle Position' },
            { pid: '04', name: 'Calculated Engine Load' },
            { pid: '2F', name: 'Fuel Tank Level Input' },
            { pid: '0A', name: 'Fuel Pressure' },
            { pid: '33', name: 'Barometric Pressure' },
            { pid: '0E', name: 'Timing Advance' },
            { pid: '46', name: 'Ambient Air Temperature' },
            { pid: '5C', name: 'Engine Oil Temperature' },
            { pid: '42', name: 'Control Module Voltage' }
        ]
    }
] as const;

export const VEHICLE_MODELS = VECHICLES_METRICS.map(vehicle => vehicle.name)