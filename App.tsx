import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/theme';

// 根据平台选择不同的导航器
const AppNavigator = Platform.select({
  web: () => require('./src/navigation/AppNavigator.web').default,
  default: () => require('./src/navigation/AppNavigator').default,
})();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.surface}
        translucent={Platform.OS !== 'web'}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
