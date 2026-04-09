export const Colors = {
  primary: '#745c00',
  primaryContainer: '#f9d461',
  primaryDim: '#665100',
  primaryFixed: '#f9d461',
  primaryFixedDim: '#eac655',
  onPrimary: '#fff8ee',
  onPrimaryContainer: '#5c4900',
  onPrimaryFixed: '#463600',
  onPrimaryFixedVariant: '#675200',

  secondary: '#4b6646',
  secondaryContainer: '#dafad0',
  secondaryDim: '#3f5a3a',
  secondaryFixed: '#dafad0',
  secondaryFixedDim: '#ccebc2',
  onSecondary: '#eaffe1',
  onSecondaryContainer: '#466141',
  onSecondaryFixed: '#354e30',
  onSecondaryFixedVariant: '#506b4a',

  tertiary: '#31638a',
  tertiaryContainer: '#a1d1fe',
  tertiaryDim: '#22577e',
  tertiaryFixed: '#a1d1fe',
  tertiaryFixedDim: '#93c3ef',
  onTertiary: '#f6f9ff',
  onTertiaryContainer: '#0a476d',
  onTertiaryFixed: '#003351',
  onTertiaryFixedVariant: '#1a5177',

  error: '#aa371c',
  errorContainer: '#fa7150',
  errorDim: '#821a01',
  onError: '#fff7f6',
  onErrorContainer: '#671200',

  surface: '#faf9f8',
  surfaceBright: '#faf9f8',
  surfaceContainer: '#eeeeed',
  surfaceContainerHigh: '#e7e8e7',
  surfaceContainerHighEST: '#e1e3e2',
  surfaceContainerLow: '#f4f3f2',
  surfaceContainerLowest: '#ffffff',
  surfaceDim: '#d8dad9',
  surfaceTint: '#745c00',
  surfaceVariant: '#e1e3e2',

  onSurface: '#303333',
  onSurfaceVariant: '#5d605f',
  onBackground: '#303333',
  background: '#faf9f8',

  outline: '#797b7a',
  outlineVariant: '#b0b2b1',

  inverseSurface: '#0d0e0e',
  inverseOnSurface: '#9d9d9c',
  inversePrimary: '#f9d461',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 56,
  displayLg: 56,
  displaySm: 36,
  titleLg: 22,
  titleMd: 16,
  bodyLg: 16,
  bodyMd: 14,
  labelLg: 14,
  labelMd: 12,
};

export const LineHeight = {
  display: 1.2,
  headline: 1.2,
  title: 1.4,
  body: 1.6,
  label: 1.4,
};

export const LetterSpacing = {
  display: -0.02, // -0.02em for display text
  headline: -0.5, // -0.5px for headlines
  title: -0.5, // -0.5px for titles
  body: 0,
  label: 0.1,
};

export const BorderRadius = {
  sm: 8,      // 0.5rem = 8px
  md: 16,     // 1rem = 16px
  lg: 32,     // 2rem = 32px
  xl: 48,     // 3rem = 48px
  full: 9999,
};

export const FontFamily = {
  headline: 'Plus Jakarta Sans',
  body: 'Plus Jakarta Sans',
  label: 'Plus Jakarta Sans',
};

// Typography presets combining fontSize, lineHeight, letterSpacing
export const Typography = {
  displayLg: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.displayLg,
    lineHeight: FontSize.displayLg * LineHeight.display,
    letterSpacing: FontSize.displayLg * LetterSpacing.display,
    fontWeight: '700' as const,
  },
  displaySm: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.displaySm,
    lineHeight: FontSize.displaySm * LineHeight.display,
    letterSpacing: FontSize.displaySm * LetterSpacing.display,
    fontWeight: '700' as const,
  },
  titleLg: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLg,
    lineHeight: FontSize.titleLg * LineHeight.title,
    letterSpacing: LetterSpacing.title,
    fontWeight: '700' as const,
  },
  titleMd: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleMd,
    lineHeight: FontSize.titleMd * LineHeight.title,
    letterSpacing: LetterSpacing.title,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyLg,
    lineHeight: FontSize.bodyLg * LineHeight.body,
    letterSpacing: LetterSpacing.body,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMd,
    lineHeight: FontSize.bodyMd * LineHeight.body,
    letterSpacing: LetterSpacing.body,
    fontWeight: '400' as const,
  },
  labelLg: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelLg,
    lineHeight: FontSize.labelLg * LineHeight.label,
    letterSpacing: LetterSpacing.label,
    fontWeight: '500' as const,
  },
  labelMd: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelMd,
    lineHeight: FontSize.labelMd * LineHeight.label,
    letterSpacing: LetterSpacing.label,
    fontWeight: '500' as const,
  },
};
