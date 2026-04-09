import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PuddingPlan</Text>
      <Text style={styles.subtitle}>Welcome!1111</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
  },
});

export default HomeScreen;
