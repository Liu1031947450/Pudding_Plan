import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
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
import { useAppSettings, useNotifications } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import { badgesApi, rhythmApi } from '../api';
import { syncNotificationSettings } from '../services/notificationScheduler';

type RhythmPeriod = 'week' | 'month';

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const {
    plans,
    loading,
    error,
    isManaging,
    selectedPlans,
    handleDeleteSelected: deleteSelectedPlans,
    handleUpdatePlan,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
    refreshPlans,
  } = usePlanManagement();
  const { settings } = useAppSettings();

  const {
    notifications,
    markAsRead,
    refreshNotifications,
    unreadCount,
    showNewMessageAnimation,
  } = useNotifications();
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
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'success',
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!currentUserId) return;
      refreshPlans(currentUserId, true);
      refreshNotifications();
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
      } catch (caught) {
        console.error('Failed to fetch rhythm data:', caught);
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
        refreshNotifications(),
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
    } catch (caught) {
      console.error('Failed to fetch badges:', caught);
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
    } catch {
      setToastMessage('删除失败，请重试');
      setToastType('error');
    } finally {
      setToastVisible(true);
    }
  };

  const activePlans = plans.filter(
    plan => (plan.status || 'active') === 'active',
  );
  const pausedPlans = plans.filter(plan => plan.status === 'paused');
  const archivedPlans = plans.filter(plan => plan.status === 'archived');

  const movePlan = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= activePlans.length) return;
    const reorderedActive = [...activePlans];
    const [movedPlan] = reorderedActive.splice(fromIndex, 1);
    reorderedActive.splice(toIndex, 0, movedPlan);
    handleReorderPlans([
      ...reorderedActive,
      ...plans.filter(plan => (plan.status || 'active') !== 'active'),
    ]);
  };

  const handleStatusChange = async (
    plan: Plan,
    status: 'active' | 'paused' | 'archived',
  ) => {
    const response = await handleUpdatePlan(plan.id, { status }, currentUserId);
    if (response.success) {
      await syncNotificationSettings(settings);
      setToastMessage(
        status === 'active'
          ? '计划已恢复'
          : status === 'paused'
          ? '计划已暂停'
          : '计划已归档',
      );
      setToastType('success');
    } else {
      setToastMessage(response.error || '更新计划状态失败');
      setToastType('error');
    }
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="我的计划"
        leftIcon="emoji-events"
        rightIcon="notifications"
        rightIconShake={unreadCount > 0}
        notificationCount={unreadCount}
        showNewMessageAnimation={showNewMessageAnimation}
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
        ) : error && plans.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refreshPlans(currentUserId)}
            >
              <Text style={styles.retryText}>重新加载</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <PlanEmptyState onCreatePlan={handleCreatePlan} />
        ) : (
          <>
            <PlanList
              title="正在进行"
              plans={activePlans}
              isManaging={isManaging}
              selectedPlans={selectedPlans}
              onToggleManage={toggleManageMode}
              onToggleSelect={togglePlanSelection}
              onDeleteSelected={handleDeletePlans}
              onMovePlan={movePlan}
              onCreatePlan={handleCreatePlan}
              onPlanPress={handlePlanPress}
              onStatusChange={handleStatusChange}
            />

            {pausedPlans.length > 0 && (
              <PlanList
                title="已暂停"
                plans={pausedPlans}
                isManaging={false}
                selectedPlans={new Set()}
                onToggleManage={() => {}}
                onToggleSelect={() => {}}
                onDeleteSelected={() => {}}
                onMovePlan={() => {}}
                onCreatePlan={handleCreatePlan}
                onPlanPress={handlePlanPress}
                onStatusChange={handleStatusChange}
                showManagement={false}
                showCreate={false}
              />
            )}

            {archivedPlans.length > 0 && (
              <PlanList
                title="历史归档"
                plans={archivedPlans}
                isManaging={false}
                selectedPlans={new Set()}
                onToggleManage={() => {}}
                onToggleSelect={() => {}}
                onDeleteSelected={() => {}}
                onMovePlan={() => {}}
                onCreatePlan={handleCreatePlan}
                onPlanPress={handlePlanPress}
                onStatusChange={handleStatusChange}
                showManagement={false}
                showCreate={false}
              />
            )}

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
        onNotificationPress={id => markAsRead(id)}
        navigation={navigation}
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
  errorText: {
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
  },
  retryText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },
});

export default PlanScreen;
