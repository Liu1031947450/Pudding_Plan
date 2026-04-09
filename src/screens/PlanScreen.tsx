import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
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
    isManaging,
    selectedPlans,
    handleDeleteSelected,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
  } = usePlanManagement();

  const {
    notifications,
    notificationVisible,
    toggleNotificationDrawer,
  } = useNotifications();

  const [rhythmPeriod, setRhythmPeriod] = useState<RhythmPeriod>('week');

  const rhythmData = rhythmPeriod === 'week' ? mockWeekRhythmData : mockMonthRhythmData;

  const handleCreatePlan = () => {
    navigation.navigate('TemplateSelection' as never);
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
        {plans.length === 0 ? (
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
});

export default PlanScreen;
