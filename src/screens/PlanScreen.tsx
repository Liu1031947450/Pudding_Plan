import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
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
  {
    id: '3',
    title: '99天正念冥想',
    subtitle: '已坚持 98 天',
    progress: 66,
    days: 98,
    totalDays: 99,
    icon: 'self-improvement',
    color: Colors.primaryContainer,
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
  {
    id: '4',
    title: '初入圈子2',
    description: '啊啊啊不不不',
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

type RhythmPeriod = 'week' | 'month';

interface RhythmData {
  label: string;
  value: number; // 完成率百分比 0-100
}

// 模拟周数据：周一到周日的完成率
const mockWeekData: RhythmData[] = [
  { label: '周一', value: 100 },
  { label: '周二', value: 85 },
  { label: '周三', value: 100 },
  { label: '周四', value: 70 },
  { label: '周五', value: 95 },
  { label: '周六', value: 60 },
  { label: '周日', value: 80 },
];

// 模拟月数据：1-30号的完成率
const mockMonthData: RhythmData[] = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.max(
    40,
    Math.min(100, 65 + Math.sin(i / 4) * 25 + (Math.random() - 0.5) * 15),
  ),
}));

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [rhythmPeriod, setRhythmPeriod] = useState<RhythmPeriod>('week');

  // 根据选择的周期获取对应数据
  const rhythmData = rhythmPeriod === 'week' ? mockWeekData : mockMonthData;

  // 生成SVG曲线路径
  const generateCurvePath = (
    data: RhythmData[],
    width: number,
    height: number,
  ) => {
    if (data.length === 0) return '';

    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - (item.value / 100) * height,
    }));

    // 使用贝塞尔曲线平滑连接点
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const handleCreatePlan = () => {
    navigation.navigate('TemplateSelection' as never);
  };

  const toggleManageMode = () => {
    setIsManaging(!isManaging);
    setSelectedPlans(new Set());
  };

  const togglePlanSelection = (id: string) => {
    const newSelected = new Set(selectedPlans);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPlans(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedPlans.size === 0) return;

    setPlans(plans.filter(plan => !selectedPlans.has(plan.id)));
    setSelectedPlans(new Set());
    setIsManaging(false);
  };

  const movePlan = (fromIndex: number, toIndex: number) => {
    const newPlans = [...plans];
    const [movedPlan] = newPlans.splice(fromIndex, 1);
    newPlans.splice(toIndex, 0, movedPlan);
    setPlans(newPlans);
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
        {plans.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyImageContainer}>
              <View style={styles.emptyImagePlaceholder}>
                <MaterialIcons
                  name="spa"
                  size={120}
                  color={Colors.primaryContainer}
                />
              </View>
            </View>
            <Text style={styles.emptyTitle}>还没有计划？</Text>
            <Text style={styles.emptySubtitle}>
              开启你的第一个治愈计划，让成长自然发生。
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePlan}
            >
              <MaterialIcons
                name="add-circle"
                size={24}
                color={Colors.onPrimaryContainer}
              />
              <Text style={styles.createButtonText}>创建治愈计划</Text>
            </TouchableOpacity>

            <View style={styles.templatesSection}>
              <Text style={styles.templatesSectionTitle}>从模板开始</Text>
              <View style={styles.templatesGrid}>
                <TouchableOpacity
                  style={styles.templateCardWrapper}
                  onPress={handleCreatePlan}
                >
                  <Card style={styles.templateCard}>
                    <View
                      style={[
                        styles.templateIcon,
                        { backgroundColor: Colors.secondaryContainer },
                      ]}
                    >
                      <MaterialIcons
                        name="spa"
                        size={24}
                        color={Colors.secondary}
                      />
                    </View>
                    <Text style={styles.templateTitle}>晨间唤醒</Text>
                    <Text style={styles.templateSubtitle}>21天习惯养成</Text>
                  </Card>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateCardWrapper}
                  onPress={handleCreatePlan}
                >
                  <Card style={styles.templateCard}>
                    <View
                      style={[
                        styles.templateIcon,
                        { backgroundColor: Colors.tertiaryContainer },
                      ]}
                    >
                      <MaterialIcons
                        name="menu-book"
                        size={24}
                        color={Colors.tertiary}
                      />
                    </View>
                    <Text style={styles.templateTitle}>专注阅读</Text>
                    <Text style={styles.templateSubtitle}>每周一本书</Text>
                  </Card>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>正在进行</Text>
                <TouchableOpacity onPress={toggleManageMode}>
                  <Text style={styles.manageText}>
                    {isManaging ? '完成' : '管理计划'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isManaging && selectedPlans.size > 0 && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteSelected}
                >
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={Colors.onError}
                  />
                  <Text style={styles.deleteButtonText}>
                    删除 ({selectedPlans.size})
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.plansList}>
                {plans.map((plan, index) => (
                  <Card
                    key={plan.id}
                    style={styles.planCard}
                    gradient
                    gradientColors={[Colors.primary, Colors.primaryContainer]}
                  >
                    <View style={styles.planHeader}>
                      <View style={styles.planInfo}>
                        {isManaging && (
                          <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => togglePlanSelection(plan.id)}
                          >
                            <View
                              style={[
                                styles.checkboxInner,
                                selectedPlans.has(plan.id) &&
                                  styles.checkboxChecked,
                              ]}
                            >
                              {selectedPlans.has(plan.id) && (
                                <MaterialIcons
                                  name="check"
                                  size={16}
                                  color={Colors.onPrimary}
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        )}
                        <View
                          style={[
                            styles.planIcon,
                            { backgroundColor: plan.color },
                          ]}
                        >
                          <MaterialIcons
                            name={plan.icon}
                            size={24}
                            color={Colors.onSurface}
                          />
                        </View>
                        <View style={styles.planText}>
                          <Text style={styles.planTitle}>{plan.title}</Text>
                          <Text style={styles.planSubtitle}>
                            {plan.subtitle}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.planActions}>
                        {isManaging && (
                          <View style={styles.dragHandle}>
                            <TouchableOpacity
                              disabled={index === 0}
                              onPress={() => movePlan(index, index - 1)}
                            >
                              <MaterialIcons
                                name="keyboard-arrow-up"
                                size={24}
                                color={
                                  index === 0
                                    ? Colors.outlineVariant
                                    : Colors.onSurface
                                }
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              disabled={index === plans.length - 1}
                              onPress={() => movePlan(index, index + 1)}
                            >
                              <MaterialIcons
                                name="keyboard-arrow-down"
                                size={24}
                                color={
                                  index === plans.length - 1
                                    ? Colors.outlineVariant
                                    : Colors.onSurface
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        <BloomProgress
                          progress={plan.progress}
                          size={56}
                          strokeWidth={6}
                        />
                      </View>
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
                    <MaterialIcons
                      name="add"
                      size={24}
                      color={Colors.outline}
                    />
                  </View>
                  <Text style={styles.addText}>开启新计划</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>坚持节奏</Text>
                <View style={styles.periodToggle}>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      rhythmPeriod === 'week' && styles.periodButtonActive,
                    ]}
                    onPress={() => setRhythmPeriod('week')}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        rhythmPeriod === 'week' && styles.periodTextActive,
                      ]}
                    >
                      周
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      rhythmPeriod === 'month' && styles.periodButtonActive,
                    ]}
                    onPress={() => setRhythmPeriod('month')}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        rhythmPeriod === 'month' && styles.periodTextActive,
                      ]}
                    >
                      月
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Card style={styles.chartCard}>
                {rhythmPeriod === 'week' ? (
                  // 周视图：柱状图
                  <>
                    <View style={styles.chartContainer}>
                      {rhythmData.map((item, index) => (
                        <View
                          key={index}
                          style={[
                            styles.chartBar,
                            {
                              height: `${item.value}%`,
                              backgroundColor:
                                item.value > 80
                                  ? Colors.primaryFixed
                                  : item.value > 0
                                    ? Colors.secondaryFixedDim
                                    : Colors.surfaceContainerHigh,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <View style={styles.chartLabels}>
                      {rhythmData.map((item, index) => (
                        <Text key={index} style={styles.chartLabel}>
                          {item.label}
                        </Text>
                      ))}
                    </View>
                  </>
                ) : (
                  // 月视图：SVG曲线图
                  <>
                    <View style={styles.svgChartContainer}>
                      <Svg
                        width="100%"
                        height={160}
                        viewBox={`0 0 ${Dimensions.get('window').width - Spacing.md * 2 - Spacing.lg * 2} 160`}
                      >
                        <Path
                          d={generateCurvePath(
                            rhythmData,
                            Dimensions.get('window').width -
                              Spacing.md * 2 -
                              Spacing.lg * 2,
                            160,
                          )}
                          stroke={Colors.primary}
                          strokeWidth="3"
                          fill="none"
                        />
                      </Svg>
                    </View>
                    <View style={styles.monthLabels}>
                      <Text style={styles.monthLabel}>1</Text>
                      <Text style={styles.monthLabel}>10</Text>
                      <Text style={styles.monthLabel}>15</Text>
                      <Text style={styles.monthLabel}>20</Text>
                      <Text style={styles.monthLabel}>25</Text>
                      <Text style={styles.monthLabel}>30</Text>
                    </View>
                  </>
                )}
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { marginBottom: Spacing.lg }]}>
                已获成就
              </Text>
              <View style={styles.badgesGrid}>
                {mockBadges.slice(0, 6).map(badge => (
                  <Card key={badge.id} style={styles.badgeCard}>
                    <View
                      style={[
                        styles.badgeIcon,
                        { backgroundColor: badge.color },
                      ]}
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
          </>
        )}
      </ScrollView>

      <NotificationDrawer
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        notifications={mockNotifications}
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
  section: {
    marginBottom: Spacing.xl * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
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
  },
  chartCard: {
    padding: Spacing.lg,
    minHeight: 220,
  },
  chartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    gap: 2,
  },
  chartBar: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chartLabelHidden: {
    opacity: 0,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  deleteButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onError,
  },
  checkbox: {
    marginRight: Spacing.sm,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dragHandle: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  emptyImageContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  emptyImagePlaceholder: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 256,
    height: 256,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl * 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  createButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  templatesSection: {
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  templatesSectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  templatesGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  templateCardWrapper: {
    flex: 1,
  },
  templateCard: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  templateSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  lineChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineChartStyle: {
    marginVertical: 0,
    borderRadius: BorderRadius.md,
  },
  svgChartContainer: {
    width: '100%',
    height: 160,
    marginBottom: Spacing.sm,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  monthLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});

export default PlanScreen;
