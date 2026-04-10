import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
import type { Plan } from '../types/domain';
import {
  BottomNavBar,
  TopAppBar,
  NotificationDrawer,
} from '../components';
import {
  PlanList,
  PlanEmptyState,
  BadgeSection,
  RhythmChart,
} from '../components/plan';
import { usePlanManagement, useNotifications } from '../hooks';
import { mockBadges, mockWeekRhythmData, mockMonthRhythmData } from '../data/mockData';

type RhythmPeriod = 'week' | 'month';

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    plans,
    loading,
    isManaging,
    selectedPlans,
    handleDeleteSelected,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
    refreshPlans,
  } = usePlanManagement();

  const {
    notifications,
    notificationVisible,
    toggleNotificationDrawer,
  } = useNotifications();

  const [rhythmPeriod, setRhythmPeriod] = useState<RhythmPeriod>('week');

  // 当页面获得焦点时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      console.log('PlanScreen focused, refreshing plans...');
      refreshPlans();
    }, [refreshPlans])
  );

  const rhythmData = rhythmPeriod === 'week' ? mockWeekRhythmData : mockMonthRhythmData;

  const handleCreatePlan = () => {
    navigation.navigate('TemplateSelection' as never);
  };

  const handlePlanPress = (plan: Plan) => {
    (navigation as any).navigate('CreatePlan', { planId: plan.id });
  };

  const movePlan = (fromIndex: number, toIndex: number) => {
    const newPlans = [...plans];
    const [movedPlan] = newPlans.splice(fromIndex, 1);
    newPlans.splice(toIndex, 0, movedPlan);
    handleReorderPlans(newPlans);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="我的计划"
        leftIcon="spa"
        rightIcon="notifications"
        onRightPress={toggleNotificationDrawer}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : plans.length === 0 ? (
          <PlanEmptyState onCreatePlan={handleCreatePlan} />
        ) : (
          <>
            <PlanList
              plans={plans}
              isManaging={isManaging}
              selectedPlans={selectedPlans}
              onToggleManage={toggleManageMode}
              onToggleSelect={togglePlanSelection}
              onDeleteSelected={handleDeleteSelected}
              onMovePlan={movePlan}
              onCreatePlan={handleCreatePlan}
              onPlanPress={handlePlanPress}
            />

            <RhythmChart
              data={rhythmData}
              period={rhythmPeriod}
              onPeriodChange={setRhythmPeriod}
            />

            <BadgeSection badges={mockBadges} />
          </>
        )}
      </ScrollView>

      <NotificationDrawer
        visible={notificationVisible}
        onClose={toggleNotificationDrawer}
        notifications={notifications}
        onNotificationPress={id => {
          console.log('Notification pressed:', id);
        }}
      />

      <BottomNavBar />
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});

export default PlanScreen;
