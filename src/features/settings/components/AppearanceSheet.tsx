import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize as GlobalFontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Card, Button } from '../../../components/common';

interface AppearanceSheetProps {
  currentTheme: 'light' | 'dark' | 'system';
  currentFontSize: 'small' | 'medium' | 'large';
  onSave: (theme: any, fontSize: any) => void;
}

export const AppearanceSheet: React.FC<AppearanceSheetProps> = ({
  currentTheme,
  currentFontSize,
  onSave,
}) => {
  const [theme, setTheme] = useState(currentTheme);
  const [fontSize, setFontSize] = useState(currentFontSize);

  const themeOptions = [
    { label: '浅色', value: 'light', icon: 'wb-sunny' },
    { label: '深色', value: 'dark', icon: 'nights-stay' },
    { label: '跟随系统', value: 'system', icon: 'settings-brightness' },
  ];

  const fontSizeOptions = [
    { label: '特小', value: 'small', size: 14 },
    { label: '标准', value: 'medium', size: 16 },
    { label: '特大', value: 'large', size: 18 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观主题</Text>
          <View style={styles.themeGrid}>
            {themeOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.themeItem,
                  theme === opt.value && styles.themeItemActive,
                ]}
                onPress={() => setTheme(opt.value as any)}
              >
                <View
                  style={[
                    styles.themeIconCircle,
                    theme === opt.value && styles.themeIconCircleActive,
                  ]}
                >
                  <MaterialIcons
                    name={opt.icon as any}
                    size={24}
                    color={
                      theme === opt.value
                        ? Colors.onPrimary
                        : Colors.onSurfaceVariant
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.themeLabel,
                    theme === opt.value && styles.themeLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>字体大小</Text>
          <Card style={styles.previewCard}>
            <Text
              style={[
                styles.previewLabel,
                {
                  fontSize:
                    fontSize === 'small' ? 12 : fontSize === 'medium' ? 14 : 16,
                },
              ]}
            >
              预览效果
            </Text>
            <Text
              style={[
                styles.previewText,
                {
                  fontSize:
                    fontSize === 'small' ? 14 : fontSize === 'medium' ? 16 : 20,
                  lineHeight:
                    fontSize === 'small' ? 20 : fontSize === 'medium' ? 24 : 28,
                },
              ]}
            >
              治愈计划，让每一份坚持都充满温度。在这里，你可以感受时间的流淌，记录成长的点滴。
            </Text>
          </Card>

          <View style={styles.fontSizeSelector}>
            {fontSizeOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.fontSizeItem,
                  fontSize === opt.value && styles.fontSizeItemActive,
                ]}
                onPress={() => setFontSize(opt.value as any)}
              >
                <Text
                  style={[
                    styles.fontSizeText,
                    { fontSize: opt.size / 1.1 },
                    fontSize === opt.value && styles.fontSizeTextActive,
                  ]}
                >
                  A
                </Text>
                <Text
                  style={[
                    styles.fontSizeLabel,
                    fontSize === opt.value && styles.fontSizeLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="应用设置"
          onPress={() => onSave(theme, fontSize)}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: GlobalFontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  themeItemActive: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  themeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconCircleActive: {
    backgroundColor: Colors.primary,
  },
  themeLabel: {
    fontSize: GlobalFontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  themeLabelActive: {
    color: Colors.primary,
  },
  previewCard: {
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  previewLabel: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    color: Colors.onSurface,
  },
  fontSizeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 6,
  },
  fontSizeItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  fontSizeItemActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fontSizeText: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 2,
  },
  fontSizeTextActive: {
    color: Colors.primary,
  },
  fontSizeLabel: {
    fontSize: 10,
    color: Colors.outline,
    fontWeight: '500',
  },
  fontSizeLabelActive: {
    color: Colors.primary,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
