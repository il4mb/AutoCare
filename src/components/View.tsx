import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

export type ViewProps = RNViewProps;
export function View({ style, ...otherProps }: ViewProps) {
    return <RNView style={[style]} {...otherProps} />;
}
