import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
import type { Plan, Badge, RhythmData } from '../types/domain';
import { BottomNavBar, TopAppBar, Toast } from '../components';
import {
  PlanList,
  PlanEmptyState,
  RhythmChart,
  NotificationDrawer,
  AchievementDrawer,
} from '../features/plan';
import { usePlanManagement } from '../hooks';
import { useNotificationState } from '../hooks/useNotificationState';
import { useAuth } from '../contexts/AuthContext';
import { badgesApi, rhythmApi } from '../api';

type RhythmPeriod = 'week' | 'month';

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const {
    plans,
    loading,
    isManaging,
    selectedPlans,
    handleDeleteSelected: deleteSelectedPlans,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
    refreshPlans,
  } = usePlanManagement();

  const { notifications, markAsRead, refreshNotifications, unreadCount } =
    useNotificationState();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  const [rhythmPeriod, setRhythmPeriod] = useState<RhythmPeriod>('week');
  const [rhythmData, setRhythmData] = useState<RhythmData[]>([]);
  const [rhythmLoading, setRhythmLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useFocusEffect(
    React.useCallback(() => {
      if (!currentUserId) return;
      refreshPlans(currentUserId, true);
      refreshNotifications(currentUserId);
    }, [currentUserId, refreshPlans, refreshNotifications]),
  );

  const fetchRhythmData = React.useCallback(
    async (period: RhythmPeriod) => {
      if (!currentUserId) {
        setRhythmData([]);
        return;
      }

      setRhythmLoading(true);
      try {
        const response =
          period === 'week'
            ? await rhythmApi.getWeek()
            : await rhythmApi.getMonth();
        if (response.success && response.data) {
          setRhythmData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch rhythm data:', error);
      } finally {
        setRhythmLoading(false);
      }
    },
    [currentUserId],
  );

  // 监听周期变化，自动请求对应数据
  useEffect(() => {
    fetchRhythmData(rhythmPeriod);
  }, [rhythmPeriod, fetchRhythmData]);

  const handleRefresh = React.useCallback(async () => {
    if (!currentUserId) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all([
        refreshPlans(currentUserId, true),
        refreshNotifications(currentUserId),
        fetchRhythmData(rhythmPeriod),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    currentUserId,
    refreshPlans,
    refreshNotifications,
    rhythmPeriod,
    fetchRhythmData,
  ]);

  const handleOpenAchievements = async () => {
    setBadgesLoading(true);
    try {
      const response = await badgesApi.getAll();
      if (response.success && response.data) {
        setBadges(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setBadgesLoading(false);
      setAchievementVisible(true);
    }
  };

  const handleOpenNotifications = () => {
    setNotificationVisible(true);
  };

  const handleCreatePlan = () => {
    navigation.navigate('TemplateSelection' as never);
  };

  const handlePlanPress = (plan: Plan) => {
    (navigation as any).navigate('CreatePlan', { planId: plan.id });
  };

  const handleDeletePlans = async () => {
    if (!currentUserId) return;
    
    try {
      const deletedCount = await deleteSelectedPlans(currentUserId);
      if (deletedCount > 0) {
        setToastMessage(`成功删除 ${deletedCount} 个计划`);
        setToastType('success');
      } else {
        setToastMessage('删除失败，请重试');
        setToastType('error');
      }
    } catch (error) {
      setToastMessage('删除失败，请重试');
      setToastType('error');
    } finally {
      setToastVisible(true);
    }
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
        rightIconShake={unreadCount > 0}
        onLeftPress={handleOpenAchievements}
        onRightPress={handleOpenNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressBackgroundColor={Colors.surface}
          />
        }
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
              onDeleteSelected={handleDeletePlans}
              onMovePlan={movePlan}
              onCreatePlan={handleCreatePlan}
              onPlanPress={handlePlanPress}
            />

            <RhythmChart
              data={rhythmData}
              period={rhythmPeriod}
              loading={rhythmLoading}
              onPeriodChange={setRhythmPeriod}
            />
          </>
        )}
      </ScrollView>

      <NotificationDrawer
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        notifications={notifications}
        onNotificationPress={id =>
          currentUserId && markAsRead(id, currentUserId)
        }
      />

      <AchievementDrawer
        visible={achievementVisible}
        onClose={() => setAchievementVisible(false)}
        badges={badges}
        loading={badgesLoading}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
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
    flexGrow: 1, // 确保 loading 时可以垂直居中
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
