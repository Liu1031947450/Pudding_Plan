import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens';
import { AuthProvider, NotificationProvider } from './src/contexts';

// 全局通知行为配置：前台收到通知时也弹出提示
// 在 Expo Go 中可能不可用，用 try-catch 保护
try {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[App] expo-notifications 初始化跳过（可能在 Expo Go 中）:', e);
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <AuthProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={Colors.background}
            />
            <SplashScreen onFinish={handleSplashFinish} />
          </SafeAreaProvider>
        </NotificationProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
          <AppNavigator />
        </SafeAreaProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
