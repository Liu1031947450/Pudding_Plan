import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card } from '../components';

interface SettingItem {
  id: string;
  title: string;
  value?: string;
  icon: string;
  iconColor: string;
  showArrow?: boolean;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const mockSettings: SettingSection[] = [
  {
    title: '账号与安全',
    items: [
      { id: '1', title: '个人资料修改', icon: '\uE7FD', iconColor: Colors.primary, showArrow: true },
      { id: '2', title: '手机号绑定', value: '138****8888', icon: '\uE8DF', iconColor: Colors.primary, showArrow: true },
    ],
  },
  {
    title: '通知管理',
    items: [
      { id: '3', title: '每日提醒', icon: '\uE7F4', iconColor: Colors.secondary, showArrow: false, value: '开启' },
      { id: '4', title: '勿扰模式 (静谧时间)', icon: '\uE524', iconColor: Colors.secondary, value: '22:00 - 07:00' },
    ],
  },
  {
    title: '显示设置',
    items: [
      { id: '5', title: '深色模式', icon: '\uE3C9', iconColor: Colors.tertiary, showArrow: false, value: '关闭' },
      { id: '6', title: '字体大小', icon: '\uE262', iconColor: Colors.tertiary, value: '标准' },
    ],
  },
  {
    title: '隐私与条款',
    items: [
      { id: '7', title: '隐私政策', icon: '\uE8B6', iconColor: Colors.onSurfaceVariant, showArrow: true },
      { id: '8', title: '用户协议', icon: '\uE8F4', iconColor: Colors.onSurfaceVariant, showArrow: true },
      { id: '9', title: '清除所有数据', icon: '\uE872', iconColor: Colors.error, showArrow: false },
    ],
  },
  {
    title: '关于',
    items: [
      { id: '10', title: '当前版本', icon: '\uE8F4', iconColor: Colors.onSurfaceVariant, value: 'v2.4.0 (Stable)' },
      { id: '11', title: '意见反馈', icon: '\uE0CA', iconColor: Colors.onSurfaceVariant, showArrow: true },
    ],
  },
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="系统设置" showBackButton onBackPress={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockSettings.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: `${item.iconColor}10` },
                      ]}
                    >
                      <Text style={[styles.settingIconText, { color: item.iconColor }]}>
                        {item.icon}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.settingTitle,
                        item.id === '9' && styles.settingTitleDanger,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                    {item.showArrow && (
                      <Text style={styles.settingArrow}>{'\uE5E1'}</Text>
                    )}
                    {item.id === '9' && (
                      <Text style={styles.settingArrow}>{'\uE872'}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 80,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  settingTitleDanger: {
    color: Colors.error,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.xs,
  },
  settingArrow: {
    fontSize: 20,
    color: Colors.outlineVariant,
  },
  logoutButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});

export default SettingsScreen;
