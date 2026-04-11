import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface LegalDocSheetProps {
  title: string;
}

export const LegalDocSheet: React.FC<LegalDocSheetProps> = ({ title }) => {
  const loremIpsum = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

  Section 1: Data Collection
  At Pudding Plan, we value your privacy. We collect minimal data necessary to provide a therapeutic experience. This includes your plan data, streak information, and optional profile details.

  Section 2: Usage of Information
  Your data is used solely to provide and improve the application's features. We do not sell your personal information to third parties.

  Section 3: Security
  We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.

  Section 4: Your Rights
  You have the right to access, rectify, or delete your data at any time through the application's settings.

  Conclusion
  By using Pudding Plan, you agree to the terms outlined in this document. We may update these terms occasionally, and will notify you of any significant changes.
  `;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.lastUpdate}>最后更新：2026年4月</Text>
      <View style={styles.divider} />
      <Text style={styles.text}>{loremIpsum}</Text>
      <Text style={styles.text}>{loremIpsum}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  lastUpdate: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: `${Colors.outlineVariant}20`,
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: Spacing.md,
    textAlign: 'justify',
  },
});
