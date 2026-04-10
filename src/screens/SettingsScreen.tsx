import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  TopAppBar,
  Card,
  Toast,
  BottomDrawer,
  ProfileEditSheet,
  PhoneBindSheet,
  NotificationSheet,
  DNDSheet,
  AppearanceSheet,
  LegalDocSheet,
  FeedbackSheet,
  ConfirmSheet,
} from '../components';

interface SettingItem {
  id: string;
  title: string;
  value?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
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
      {
        id: '1',
        title: '个人资料修改',
        icon: 'person',
        iconColor: Colors.primary,
        showArrow: true,
      },
      {
        id: '2',
        title: '手机号绑定',
        value: '138****8888',
        icon: 'phone',
        iconColor: Colors.primary,
        showArrow: true,
      },
    ],
  },
  {
    title: '通知管理',
    items: [
      {
        id: '3',
        title: '每日提醒',
        icon: 'notifications',
        iconColor: Colors.secondary,
        showArrow: false,
        value: '开启',
      },
      {
        id: '4',
        title: '勿扰模式 (静谧时间)',
        icon: 'do-not-disturb',
        iconColor: Colors.secondary,
        value: '22:00 - 07:00',
      },
    ],
  },
  {
    title: '显示设置',
    items: [
      {
        id: '5',
        title: '深色模式',
        icon: 'dark-mode',
        iconColor: Colors.tertiary,
        showArrow: false,
        value: '关闭',
      },
      {
        id: '6',
        title: '字体大小',
        icon: 'text-fields',
        iconColor: Colors.tertiary,
        value: '标准',
      },
    ],
  },
  {
    title: '隐私与条款',
    items: [
      {
        id: '7',
        title: '隐私政策',
        icon: 'privacy-tip',
        iconColor: Colors.onSurfaceVariant,
        showArrow: true,
      },
      {
        id: '8',
        title: '用户协议',
        icon: 'description',
        iconColor: Colors.onSurfaceVariant,
        showArrow: true,
      },
      {
        id: '9',
        title: '清除所有数据',
        icon: 'delete-forever',
        iconColor: Colors.error,
        showArrow: false,
      },
    ],
  },
  {
    title: '关于',
    items: [
      {
        id: '10',
        title: '当前版本',
        icon: 'info',
        iconColor: Colors.onSurfaceVariant,
        value: 'v2.4.0 (Stable)',
      },
      {
        id: '11',
        title: '意见反馈',
        icon: 'feedback',
        iconColor: Colors.onSurfaceVariant,
        showArrow: true,
      },
    ],
  },
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeDrawer, setActiveDrawer] = React.useState<string | null>(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  // 模拟本地状态
  const [profile, setProfile] = React.useState({
    nickname: '治愈小助手',
    bio: '让每一天都充满阳光 ☀️',
  });
  const [phone, setPhone] = React.useState('138****8888');
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [notifTime, setNotifTime] = React.useState('08:00');
  const [dndRange, setDndRange] = React.useState({
    start: '22:00',
    end: '07:00',
  });
  const [appearance, setAppearance] = React.useState<{
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  }>({ theme: 'system', fontSize: 'medium' });

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleItemPress = (itemId: string) => {
    setActiveDrawer(itemId);
  };

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case '1':
        return (
          <ProfileEditSheet
            initialData={profile}
            onSave={data => {
              setProfile(prev => ({ ...prev, ...data }));
              setActiveDrawer(null);
              showToast('个人资料已更新');
            }}
          />
        );
      case '2':
        return (
          <PhoneBindSheet
            currentPhone={phone}
            onBind={newPhone => {
              setPhone(newPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
              setActiveDrawer(null);
              showToast('手机号绑定成功');
            }}
          />
        );
      case '3':
        return (
          <NotificationSheet
            initialEnabled={notifEnabled}
            initialTime={notifTime}
            onSave={(enabled, time) => {
              setNotifEnabled(enabled);
              setNotifTime(time);
              setActiveDrawer(null);
              showToast('通知设置已保存');
            }}
          />
        );
      case '4':
        return (
          <DNDSheet
            initialStartTime={dndRange.start}
            initialEndTime={dndRange.end}
            onSave={(start, end) => {
              setDndRange({ start, end });
              setActiveDrawer(null);
              showToast('勿扰时间已更新');
            }}
          />
        );
      case '5':
      case '6':
        return (
          <AppearanceSheet
            currentTheme={appearance.theme}
            currentFontSize={appearance.fontSize}
            onSave={(theme, fontSize) => {
              setAppearance({ theme, fontSize });
              setActiveDrawer(null);
              showToast('外观设置已应用');
            }}
          />
        );
      case '7':
        return <LegalDocSheet title="隐私政策" />;
      case '8':
        return <LegalDocSheet title="用户协议" />;
      case '9':
        return (
          <ConfirmSheet
            title="确认清除所有数据？"
            message="此操作将永久删除你的所有计划、打卡记录和个人设置，且无法撤销。"
            confirmLabel="确认清除"
            isDestructive
            onConfirm={() => {
              setActiveDrawer(null);
              showToast('所有数据已清除');
            }}
            onCancel={() => setActiveDrawer(null)}
          />
        );
      case '11':
        return (
          <FeedbackSheet
            onSubmit={() => {
              setActiveDrawer(null);
              showToast('反馈已提交，感谢你的支持');
            }}
          />
        );
      case 'logout':
        return (
          <ConfirmSheet
            title="退出登录"
            message="确定要退出当前账号吗？"
            confirmLabel="退出"
            isDestructive
            onConfirm={() => {
              setActiveDrawer(null);
              showToast('已安全退出');
            }}
            onCancel={() => setActiveDrawer(null)}
          />
        );
      default:
        return null;
    }
  };

  const getDrawerTitle = () => {
    if (activeDrawer === 'logout') return '安全退出';
    const allItems = mockSettings.flatMap(s => s.items);
    return allItems.find(i => i.id === activeDrawer)?.title || '设置';
  };

  const getDrawerHeight = () => {
    if (['9', 'logout'].includes(activeDrawer || '')) return 'auto';
    if (['7', '8', '11', '1', '3'].includes(activeDrawer || '')) return '85%';
    return '70%';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="系统设置" showBackButton onBackPress={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockSettings.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 &&
                      styles.settingItemBorder,
                  ]}
                  onPress={() => handleItemPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: `${item.iconColor}10` },
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
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
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={Colors.outlineVariant}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setActiveDrawer('logout')}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomDrawer
        visible={activeDrawer !== null}
        onClose={() => setActiveDrawer(null)}
        title={getDrawerTitle()}
        height={getDrawerHeight()}
      >
        {renderDrawerContent()}
      </BottomDrawer>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
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
    paddingTop: 32,
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
