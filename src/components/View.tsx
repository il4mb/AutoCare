import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ViewProps = RNViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function View({ style, lightColor, darkColor, type, ...otherProps }: ViewProps) {
  const theme = useTheme();

  return <RNView style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
