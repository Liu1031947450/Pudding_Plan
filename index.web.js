import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

AppRegistry.registerComponent(appConfig.expo.name, () => App);
AppRegistry.runApplication(appConfig.expo.name, {
  rootTag: document.getElementById('root'),
});
