import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../constants/theme';
import { TopAppBar } from '../components';
import { CircleDetailContent } from '../features/circle/components/CircleDetailContent';

type CircleDetailRouteProp = RouteProp<
  { CircleDetail: { circleId: string } },
  'CircleDetail'
>;

const CircleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CircleDetailRouteProp>();
  const { circleId } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="动态详情"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {circleId && <CircleDetailContent circleId={circleId} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

export default CircleDetailScreen;
