import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../constants/theme';
import { AchievementDrawer } from '../components/specialized/AchievementDrawer';
import { mockBadges } from '../data/mockData';

const HomeScreen: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleOpenDrawer = () => {
    Alert.alert('测试', '按钮被点击了！');
    console.log('Opening achievement drawer');
    setDrawerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleOpenDrawer}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="emoji-events" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PuddingPlan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>开始你的布丁计划之旅</Text>

        {/* 临时测试按钮 */}
        <TouchableOpacity
          onPress={handleOpenDrawer}
          style={{ marginTop: 20, padding: 15, backgroundColor: Colors.primary }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>测试打开抽屉</Text>
        </TouchableOpacity>
      </ScrollView>

      <AchievementDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        badges={mockBadges}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  menuButton: {
    padding: Spacing.sm,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
  },
});

export default HomeScreen;
