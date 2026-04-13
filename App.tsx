import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens';
import { AuthProvider } from './src/contexts';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Colors.background}
          />
          <SplashScreen onFinish={handleSplashFinish} />
        </SafeAreaProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
