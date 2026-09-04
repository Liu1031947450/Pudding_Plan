import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens';
import {
  AuthProvider,
  NotificationProvider,
  SettingsProvider,
} from './src/contexts';
import { shouldPresentNotification } from './src/services/notificationScheduler';

// 全局通知行为配置：前台收到通知时也弹出提示
// 在 Expo Go 中可能不可用，用 try-catch 保护
if (Platform.OS !== 'web') {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        const shouldPresent = shouldPresentNotification();
        return {
          shouldShowAlert: shouldPresent,
          shouldPlaySound: shouldPresent,
          shouldSetBadge: false,
          shouldShowBanner: shouldPresent,
          shouldShowList: shouldPresent,
        };
      },
    });
  } catch (e) {
    console.warn(
      '[App] expo-notifications 初始化跳过（可能在 Expo Go 中）:',
      e,
    );
  }
}

const AppContent: React.FC<{
  showSplash: boolean;
  onSplashFinish: () => void;
}> = ({ showSplash, onSplashFinish }) => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.app}>
        {showSplash ? (
          <SplashScreen onFinish={onSplashFinish} />
        ) : (
          <AppNavigator />
        )}
      </View>
    </SafeAreaProvider>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AppContent
            showSplash={showSplash}
            onSplashFinish={handleSplashFinish}
          />
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: Colors.background },
});

export default App;
