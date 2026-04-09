import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  BottomNavBar,
  TopAppBar,
  Card,
  ProgressBar,
  BloomProgress,
  NotificationDrawer,
} from '../components';

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  days: number;
  totalDays: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const mockPlans: Plan[] = [
  {
    id: '1',
    title: '21天正念冥想',
    subtitle: '已坚持 14 天',
    progress: 66,
    days: 14,
    totalDays: 21,
    icon: 'self-improvement',
    color: Colors.primaryContainer,
  },
  {
    id: '2',
    title: '60天减脂挑战',
    subtitle: '已坚持 12 天',
    progress: 20,
    days: 12,
    totalDays: 60,
    icon: 'fitness-center',
    color: Colors.tertiaryContainer,
  },
];

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  unlocked: boolean;
}

const mockBadges: Badge[] = [
  {
    id: '1',
    title: '7天星火',
    description: '完成第一周',
    icon: 'local-fire-department',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
  {
    id: '2',
    title: '自律达人',
    description: '维持 14 天连续纪录',
    icon: 'workspace-premium',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
  {
    id: '3',
    title: '初入圈子',
    description: '同行共进，更好生活',
    icon: 'groups',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
];

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'social' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: '每日打卡提醒',
    message: '别忘了完成今天的冥想打卡哦，坚持就是胜利！',
    time: '2分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: '恭喜解锁新成就',
    message: '你已连续打卡7天，获得"7天星火"勋章！',
    time: '1小时前',
    read: false,
  },
  {
    id: '3',
    type: 'social',
    title: '好友互动',
    message: 'Elena R. 给你的计划点赞并留言：加油，一起进步！',
    time: '3小时前',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: '系统更新',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题。',
    time: '昨天',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: '系统更新2',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题2。',
    time: '昨天',
    read: true,
  },
];

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationVisible, setNotificationVisible] = useState(false);

  const handleCreatePlan = () => {
    navigation.navigate('TemplateSelection' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="我的计划"
        leftIcon="spa"
        rightIcon="notifications"
        onRightPress={() => setNotificationVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>正在进行</Text>
            <TouchableOpacity>
              <Text style={styles.manageText}>管理计划</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.plansList}>
            {mockPlans.map(plan => (
              <Card
                key={plan.id}
                style={styles.planCard}
                gradient
                gradientColors={[Colors.primary, Colors.primaryContainer]}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <View
                      style={[styles.planIcon, { backgroundColor: plan.color }]}
                    >
                      <MaterialIcons
                        name={plan.icon}
                        size={24}
                        color={Colors.onSurface}
                      />
                    </View>
                    <View style={styles.planText}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                    </View>
                  </View>
                  <BloomProgress
                    progress={plan.progress}
                    size={56}
                    strokeWidth={6}
                  />
                </View>
                <ProgressBar
                  progress={plan.progress}
                  color={
                    plan.progress === 66 ? Colors.primary : Colors.tertiary
                  }
                  height={8}
                />
              </Card>
            ))}

            <TouchableOpacity
              style={styles.addPlanCard}
              onPress={handleCreatePlan}
            >
              <View style={styles.addIconWrapper}>
                <MaterialIcons name="add" size={24} color={Colors.outline} />
              </View>
              <Text style={styles.addText}>开启新计划</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>坚持节奏</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodTextActive}>周</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.periodText}>月</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Card style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {[40, 65, 55, 95, 70, 45, 80].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    {
                      height: `${height}%`,
                      backgroundColor:
                        index === 3
                          ? Colors.primaryFixed
                          : Colors.secondaryFixedDim,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.chartLabels}>
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <Text key={index} style={styles.chartLabel}>
                  {day}
                </Text>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>已获成就</Text>
          <View style={styles.badgesGrid}>
            {mockBadges.map(badge => (
              <Card key={badge.id} style={styles.badgeCard}>
                <View
                  style={[styles.badgeIcon, { backgroundColor: badge.color }]}
                >
                  <MaterialIcons
                    name={badge.icon}
                    size={32}
                    color={Colors.onSurface}
                  />
                </View>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <NotificationDrawer
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        notifications={mockNotifications}
        onNotificationPress={id => {
          console.log('Notification pressed:', id);
          setNotificationVisible(false);
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
    paddingBottom: 140,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  manageText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  plansList: {
    gap: Spacing.sm,
  },
  planCard: {
    padding: Spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  progressText: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  addPlanCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.outlineVariant}30`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: Colors.outline,
  },
  addText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    padding: 4,
    gap: 4,
  },
  periodButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  periodTextActive: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
  periodText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  chartCard: {
    padding: Spacing.lg,
    height: 200,
  },
  chartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  chartBar: {
    flex: 1,
    marginHorizontal: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badgeCard: {
    width: '30%',
    minWidth: 100,
    alignItems: 'center',
    padding: Spacing.md,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
  },
  badgeIconText: {
    fontSize: 32,
  },
  badgeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default PlanScreen;
