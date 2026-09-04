import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import {
  Colors,
  Spacing,
  FontSize as GlobalFontSize,
} from '../../../constants/theme';
import { Card, Button } from '../../../components/common';

interface AppearanceSheetProps {
  currentFontSize: 'small' | 'medium' | 'large';
  onSave: (fontSize: 'small' | 'medium' | 'large') => void;
}

type FontSizeOption = AppearanceSheetProps['currentFontSize'];

const fontSizeOptions: Array<{ label: string; value: FontSizeOption }> = [
  { label: '特小', value: 'small' },
  { label: '标准', value: 'medium' },
  { label: '特大', value: 'large' },
];

export const AppearanceSheet: React.FC<AppearanceSheetProps> = ({
  currentFontSize,
  onSave,
}) => {
  const [fontSize, setFontSize] = useState(currentFontSize);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>字体大小</Text>
          <Card style={styles.previewCard}>
            <Text
              style={[
                styles.previewLabel,
                fontSize === 'small'
                  ? styles.previewLabelSmall
                  : fontSize === 'medium'
                  ? styles.previewLabelMedium
                  : styles.previewLabelLarge,
              ]}
            >
              预览效果
            </Text>
            <Text
              style={[
                styles.previewText,
                fontSize === 'small'
                  ? styles.previewTextSmall
                  : fontSize === 'medium'
                  ? styles.previewTextMedium
                  : styles.previewTextLarge,
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
                onPress={() => setFontSize(opt.value)}
              >
                <Text
                  style={[
                    styles.fontSizeText,
                    opt.value === 'small'
                      ? styles.fontSizeTextSmall
                      : opt.value === 'medium'
                      ? styles.fontSizeTextMedium
                      : styles.fontSizeTextLarge,
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
          onPress={() => onSave(fontSize)}
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
  previewLabelSmall: {
    fontSize: 12,
  },
  previewLabelMedium: {
    fontSize: 14,
  },
  previewLabelLarge: {
    fontSize: 16,
  },
  previewText: {
    color: Colors.onSurface,
  },
  previewTextSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewTextMedium: {
    fontSize: 16,
    lineHeight: 24,
  },
  previewTextLarge: {
    fontSize: 20,
    lineHeight: 28,
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
  fontSizeTextSmall: {
    fontSize: 13,
  },
  fontSizeTextMedium: {
    fontSize: 15,
  },
  fontSizeTextLarge: {
    fontSize: 16,
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
