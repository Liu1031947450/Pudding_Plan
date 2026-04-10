import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background}
        />
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
