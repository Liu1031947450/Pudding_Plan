import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
import type { Plan, Badge } from '../types/domain';
import { BottomNavBar, TopAppBar, NotificationDrawer } from '../components';
import { PlanList, PlanEmptyState, RhythmChart } from '../components/plan';
import { AchievementDrawer } from '../components/specialized/AchievementDrawer';
import { usePlanManagement } from '../hooks';
import { useNotificationState } from '../hooks/useNotificationState';
import { mockWeekRhythmData, mockMonthRhythmData } from '../data/mockData';
import { fetchBadges } from '../api';

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

  const { notifications, markAsRead } = useNotificationState();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  const [rhythmPeriod, setRhythmPeriod] = useState<RhythmPeriod>('week');

  // 当页面获得焦点时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      refreshPlans();
    }, [refreshPlans]),
  );

  const rhythmData =
    rhythmPeriod === 'week' ? mockWeekRhythmData : mockMonthRhythmData;

  const handleOpenAchievements = async () => {
    setBadgesLoading(true);
    try {
      const data = await fetchBadges();
      setBadges(data);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setBadgesLoading(false);
      setAchievementVisible(true);
    }
  };

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
        leftIcon="emoji-events"
        rightIcon="notifications"
        onLeftPress={handleOpenAchievements}
        onRightPress={() => setNotificationVisible(true)}
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
          </>
        )}
      </ScrollView>

      <NotificationDrawer
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        notifications={notifications}
        onNotificationPress={markAsRead}
      />

      <AchievementDrawer
        visible={achievementVisible}
        onClose={() => setAchievementVisible(false)}
        badges={badges}
        loading={badgesLoading}
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
