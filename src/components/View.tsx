import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';

export type ViewProps = RNViewProps & {
    lightColor?: string;
    darkColor?: string;
    type?: ThemeColor;
};

export function View({ style, lightColor, darkColor, type, ...otherProps }: ViewProps) {

    return <RNView style={[style]} {...otherProps} />;
}
