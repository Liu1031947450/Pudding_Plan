import React from 'react';
import {
  StyleSheet,
  Text as NativeText,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { useAppSettings } from '../../contexts/SettingsContext';

export const scaleTextStyle = (
  style: TextStyle | undefined,
  fontScale: number,
): TextStyle | undefined =>
  fontScale === 1
    ? undefined
    : {
        fontSize:
          typeof style?.fontSize === 'number'
            ? style.fontSize * fontScale
            : undefined,
        lineHeight:
          typeof style?.lineHeight === 'number'
            ? style.lineHeight * fontScale
            : undefined,
      };

export const AppText = React.forwardRef<
  React.ComponentRef<typeof NativeText>,
  TextProps
>(({ style, ...props }, ref) => {
  const { fontScale } = useAppSettings();
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  const scaledStyle = scaleTextStyle(flattened, fontScale);

  return <NativeText ref={ref} {...props} style={[style, scaledStyle]} />;
});

AppText.displayName = 'AppText';
