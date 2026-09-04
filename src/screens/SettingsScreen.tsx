import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Toast, BottomDrawer } from '../components';
import { useAppSettings, useAuth } from '../contexts';
import { authApi, feedbackApi } from '../api';
import type { UserSettings } from '../types/domain';
import {
  SettingSection,
  ProfileEditSheet,
  NotificationSheet,
  DNDSheet,
  AppearanceSheet,
  LegalDocSheet,
  FeedbackSheet,
  ConfirmSheet,
  PasswordSheet,
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
  const navigation = useNavigation<any>();
  const { user, logout, updateUser, updateToken } = useAuth();
  const { settings, updateSettings, resetSettings } = useAppSettings();
  const [activeDrawer, setActiveDrawer] = React.useState<string | null>(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [clearingData, setClearingData] = React.useState(false);

  // 本地状态
  const [profile, setProfile] = React.useState({
    nickname: user?.username || '',
    bio: '',
    avatar: user?.avatar || undefined,
    goalTags: user?.goalTags || ['自律'],
  });
  const notifEnabled = settings.notificationsEnabled;
  const notifTime = settings.notificationTime;
  const dndRange = { start: settings.dndStart, end: settings.dndEnd };
  const fontSize = settings.fontSize;

  React.useEffect(() => {
    if (user) {
      setProfile({
        nickname: user.username,
        bio: user.bio || '',
        avatar: user.avatar || undefined,
        goalTags: user.goalTags || ['自律'],
      });
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
    if (itemId === 'blocks') {
      navigation.navigate('BlockedUsers');
      return;
    }
    setActiveDrawer(itemId);
  };

  const handleProfileSave = async (data: {
    nickname: string;
    bio: string;
    goalTags: string[];
  }) => {
    try {
      const response = await authApi.updateProfile({
        username: data.nickname,
        bio: data.bio,
        goalTags: data.goalTags,
      });
      if (response.success && response.data) {
        await updateUser(response.data);
        setProfile({
          nickname: response.data.username,
          bio: response.data.bio || '',
          avatar: response.data.avatar || undefined,
          goalTags: response.data.goalTags,
        });
        setActiveDrawer(null);
        showToast('个人资料已更新');
      } else {
        showToast(response.error || '更新失败');
      }
    } catch {
      showToast('更新失败，请稍后重试');
    }
  };

  const handleAvatarUpload = async (uri: string) => {
    try {
      const response = await authApi.uploadAvatar(uri);
      if (!response.success || !response.data) {
        return { error: response.error || '头像上传失败' };
      }
      await updateUser(response.data);
      setProfile(current => ({
        ...current,
        avatar: response.data?.avatar || undefined,
      }));
      showToast('头像已更新');
      return { avatar: response.data.avatar || undefined };
    } catch {
      return { error: '头像上传失败，请稍后重试' };
    }
  };

  const saveSettings = async (updates: Partial<UserSettings>) => {
    const response = await updateSettings(updates);
    if (response.success && response.data) {
      setActiveDrawer(null);
      showToast('设置已保存');
      return;
    }
    showToast(response.error || '保存设置失败');
  };

  const handleClearData = async () => {
    setClearingData(true);
    const response = await authApi.clearData();
    if (!response.success) {
      setClearingData(false);
      showToast(response.error || '清除数据失败');
      return;
    }
    await resetSettings();
    setClearingData(false);
    setActiveDrawer(null);
    showToast('所有业务数据已清除');
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case '1':
        return (
          <ProfileEditSheet
            initialData={profile}
            onSave={handleProfileSave}
            onAvatarUpload={handleAvatarUpload}
          />
        );
      case '3':
        return (
          <NotificationSheet
            initialEnabled={notifEnabled}
            initialTime={notifTime}
            onSave={(enabled, time) => {
              saveSettings({
                notificationsEnabled: enabled,
                notificationTime: time,
              });
            }}
          />
        );
      case '4':
        return (
          <DNDSheet
            initialStartTime={dndRange.start}
            initialEndTime={dndRange.end}
            onSave={(start, end) => {
              saveSettings({ dndStart: start, dndEnd: end });
            }}
          />
        );
      case '6':
        return (
          <AppearanceSheet
            currentFontSize={fontSize}
            onSave={nextFontSize => {
              saveSettings({ fontSize: nextFontSize });
            }}
          />
        );
      case 'password':
        return (
          <PasswordSheet
            mode="change"
            onSubmit={async data => {
              const response = await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword || '',
                confirmPassword: data.confirmPassword || '',
              });
              if (!response.success || !response.data) {
                return response.error || '修改密码失败';
              }
              await updateToken(response.data.token);
              setActiveDrawer(null);
              showToast('密码已修改');
              return null;
            }}
          />
        );
      case 'deleteAccount':
        return (
          <PasswordSheet
            mode="delete"
            onSubmit={async data => {
              const response = await authApi.deleteAccount(
                data.currentPassword,
              );
              if (!response.success) return response.error || '注销账号失败';
              await resetSettings();
              await logout({ skipRemote: true });
              navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
              return null;
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
            loading={clearingData}
            onConfirm={handleClearData}
            onCancel={() => setActiveDrawer(null)}
          />
        );
      case '11':
        return (
          <FeedbackSheet
            onSubmit={async (category, content, contact) => {
              const response = await feedbackApi.submit(
                category,
                content,
                contact,
              );
              if (response.success) {
                setActiveDrawer(null);
                showToast('反馈已提交，感谢你的支持');
              } else {
                showToast(response.error || '反馈提交失败');
              }
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
      '3': '每日提醒',
      '4': '勿扰模式',
      '6': '字体大小',
      '7': '隐私政策',
      '8': '用户协议',
      '9': '清除所有数据',
      '11': '意见反馈',
      password: '修改密码',
      deleteAccount: '注销账号',
    };
    return drawerTitles[activeDrawer || ''] || '设置';
  };

  const getDrawerHeight = () => {
    if (['9', 'logout'].includes(activeDrawer || '')) return '65%';
    if (
      ['7', '8', '11', '1', '3', 'password', 'deleteAccount'].includes(
        activeDrawer || '',
      )
    )
      return '85%';
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
          id: 'blocks',
          title: '黑名单管理',
          icon: 'block',
          iconColor: Colors.error,
          showArrow: true,
        },
        {
          id: 'password',
          title: '修改密码',
          icon: 'lock-reset',
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
          id: '6',
          title: '字体大小',
          icon: 'text-fields',
          iconColor: Colors.tertiary,
          value: {
            small: '小',
            medium: '标准',
            large: '大',
          }[fontSize],
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
        {
          id: 'deleteAccount',
          title: '彻底注销账号',
          icon: 'person-remove',
          iconColor: Colors.error,
          showArrow: true,
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
          value: '1.0.0',
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
