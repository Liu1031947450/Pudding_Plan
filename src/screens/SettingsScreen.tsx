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
import { TopAppBar, Toast, BottomDrawer } from '../components';
import { useAuth } from '../contexts';
import { authApi } from '../api';
import {
  SettingSection,
  ProfileEditSheet,
  PhoneBindSheet,
  NotificationSheet,
  DNDSheet,
  AppearanceSheet,
  LegalDocSheet,
  FeedbackSheet,
  ConfirmSheet,
} from '../features/settings';

interface SettingItemData {
  id: string;
  title: string;
  value?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  showArrow?: boolean;
  onPress?: () => void;
}

interface SettingSectionData {
  title: string;
  items: SettingItemData[];
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const [activeDrawer, setActiveDrawer] = React.useState<string | null>(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 本地状态
  const [profile, setProfile] = React.useState({
    nickname: user?.username || '',
    bio: '',
  });
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [notifEnabled, setNotifEnabled] = React.useState(false);
  const [notifTime, setNotifTime] = React.useState('08:00');
  const [dndRange, setDndRange] = React.useState({
    start: '22:00',
    end: '07:00',
  });
  const [appearance, setAppearance] = React.useState<{
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  }>({ theme: 'system', fontSize: 'medium' });

  React.useEffect(() => {
    if (user) {
      setProfile({ nickname: user.username, bio: user.bio || '' });
      setPhone(user.phone);
    }
  }, [user]);

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

  const handleProfileSave = async (data: { nickname: string; bio: string }) => {
    setLoading(true);
    try {
      const response = await authApi.updateProfile({
        username: data.nickname,
        bio: data.bio,
        avatar: user?.avatar || undefined,
      });
      if (response.success && response.data) {
        await updateUser(response.data);
        setProfile({
          nickname: response.data.username,
          bio: response.data.bio || '',
        });
        setActiveDrawer(null);
        showToast('个人资料已更新');
      } else {
        showToast(response.error || '更新失败');
      }
    } catch (error) {
      showToast('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case '1':
        return (
          <ProfileEditSheet initialData={profile} onSave={handleProfileSave} />
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
            onConfirm={async () => {
              setActiveDrawer(null);
              await logout();
              showToast('已安全退出');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as never }],
              });
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
    const drawerTitles: Record<string, string> = {
      '1': '个人资料修改',
      '2': '手机号绑定',
      '3': '每日提醒',
      '4': '勿扰模式',
      '5': '深色模式',
      '6': '字体大小',
      '7': '隐私政策',
      '8': '用户协议',
      '9': '清除所有数据',
      '11': '意见反馈',
    };
    return drawerTitles[activeDrawer || ''] || '设置';
  };

  const getDrawerHeight = () => {
    if (['9', 'logout'].includes(activeDrawer || '')) return '65%';
    if (['7', '8', '11', '1', '3'].includes(activeDrawer || '')) return '85%';
    return '70%';
  };

  // 配置项数据
  const settingSections: SettingSectionData[] = [
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
          value: phone || '未绑定',
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
          value: notifEnabled ? '开启' : '关闭',
        },
        {
          id: '4',
          title: '勿扰模式 (静谧时间)',
          icon: 'do-not-disturb',
          iconColor: Colors.secondary,
          value: `${dndRange.start} - ${dndRange.end}`,
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
          value: appearance.theme === 'dark' ? '开启' : '关闭',
        },
        {
          id: '6',
          title: '字体大小',
          icon: 'text-fields',
          iconColor: Colors.tertiary,
          value: {
            small: '小',
            medium: '标准',
            large: '大',
          }[appearance.fontSize],
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="系统设置" showBackButton onBackPress={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map(section => (
          <SettingSection
            key={section.title}
            title={section.title}
            items={section.items as any}
            onItemPress={handleItemPress}
          />
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
