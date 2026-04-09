import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card } from '../components';

interface SettingItem {
  id: string;
  title: string;
  value?: string;
  icon: string;
  iconColor: string;
  showArrow?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const mockSettings: SettingSection[] = [
  {
    title: '账号与安全',
    items: [
      { id: '1', title: '个人资料修改', icon: '👤', iconColor: Colors.primary, showArrow: true },
      { id: '2', title: '手机号绑定', value: '138****8888', icon: '📱', iconColor: Colors.primary, showArrow: true },
    ],
  },
  {
    title: '通知管理',
    items: [
      { id: '3', title: '每日提醒', icon: '🔔', iconColor: Colors.secondary, value: '开启' },
      { id: '4', title: '勿扰模式', icon: '🌙', iconColor: Colors.secondary, value: '22:00 - 07:00' },
    ],
  },
  {
    title: '显示设置',
    items: [
      { id: '5', title: '深色模式', icon: '🌙', iconColor: Colors.tertiary, value: '关闭' },
      { id: '6', title: '字体大小', icon: '🔤', iconColor: Colors.tertiary, value: '标准' },
    ],
  },
  {
    title: '隐私与条款',
    items: [
      { id: '7', title: '隐私政策', icon: '🔒', iconColor: Colors.onSurfaceVariant, showArrow: true },
      { id: '8', title: '用户协议', icon: '📄', iconColor: Colors.onSurfaceVariant, showArrow: true },
      { id: '9', title: '清除所有数据', icon: '🗑️', iconColor: Colors.error, showArrow: false },
    ],
  },
  {
    title: '关于',
    items: [
      { id: '10', title: '当前版本', icon: '📄', iconColor: Colors.onSurfaceVariant, value: 'v2.4.0' },
      { id: '11', title: '意见反馈', icon: '💬', iconColor: Colors.onSurfaceVariant, showArrow: true },
    ],
  },
];

const SettingsScreen: React.FC = () => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>系统设置</Text>
      </View>

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
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
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
                    <Text style={styles.settingArrow}>›</Text>
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
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
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
    fontSize: 20,
    marginRight: Spacing.md,
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
