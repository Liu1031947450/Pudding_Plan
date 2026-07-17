import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';

interface DailyQuoteCardProps {
  quote: {
    text: string;
    author: string;
  };
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ quote }) => {
  return (
    <Card
      style={styles.quoteCard}
      gradient
      gradientColors={[Colors.primary, Colors.primaryContainer]}
    >
      <MaterialIcons
        name="format-quote"
        size={32}
        color={Colors.onPrimaryContainer}
      />
      <Text style={styles.quoteText}>
        "{quote.text}"{'\n'}
        <Text style={styles.quoteAuthor}>—— {quote.author}</Text>
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  quoteCard: {
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  quoteText: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    opacity: 0.8,
    fontStyle: 'normal',
  },
});
