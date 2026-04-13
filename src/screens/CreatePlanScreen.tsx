import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/theme';
import { TopAppBar, Toast, BottomDrawer } from '../components';
import {
  PlanFormHeader,
  PlanGoalList,
  PlanBasicInfoForm,
  CheckInMethodSelector,
  PlanReminderSection,
  PlanMilestoneSection,
  TimePickerModal,
  MilestoneEditorDrawerContent,
} from '../features/plan';
import { PlanFormButton } from './components/PlanFormButton';
import { usePlanManagement } from '../hooks';
import { planService } from '../services/planService';
import { templateService } from '../services/templateService';
import { formatTime } from '../utils';
import type { TemplateDetail, Reminder, Plan } from '../types/domain';

type CreatePlanRouteProp = RouteProp<
  { CreatePlan: { templateId?: string; planId?: string } },
  'CreatePlan'
>;

const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CreatePlanRouteProp>();
  const templateId = route.params?.templateId;
  const planId = route.params?.planId;
  const { handleCreatePlan, handleUpdatePlan, plans } = usePlanManagement();

  const [existingPlan, setExistingPlan] = useState<Plan | undefined>(undefined);
  const [templateData, setTemplateData] = useState<TemplateDetail | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!planId;

  useEffect(() => {
    if (planId) {
      const fetchPlanDetail = async () => {
        // 实际应用中，userId应该从用户认证状态中获取
        const userId = ''; // 留空，由后端处理
        const response = await planService.getPlanById(planId, userId);
        if (response.success && response.data) {
          setExistingPlan(response.data);
        }
      };
      fetchPlanDetail();
    }
  }, [planId]);

  // 从后端 API 获取模板数据
  useEffect(() => {
    if (templateId) {
      const fetchTemplateDetail = async () => {
        try {
          setLoading(true);
          const data = await templateService.getTemplateById(templateId);
          setTemplateData(data);
        } catch (error) {
          console.error('Failed to fetch template:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplateDetail();
    }
  }, [templateId]);

  const [planName, setPlanName] = useState(
    existingPlan?.title || templateData?.title || '',
  );
  const [planDays, setPlanDays] = useState(
    existingPlan?.totalDays.toString() ||
      templateData?.duration.toString() ||
      '',
  );
  const [planIcon, setPlanIcon] = useState<string>('stars');
  const [planColor, setPlanColor] = useState<string>(Colors.primaryContainer);

  // 根据模板获取图标
  const getIconForPlan = (plan?: Plan, template?: TemplateDetail): string => {
    if (plan?.icon) {
      return plan.icon;
    }
    if (template?.icon) {
      return template.icon;
    }
    // 自定义计划使用默认图标
    return 'stars';
  };

  const [checkInMethod, setCheckInMethod] = useState<0 | 1 | 2>(
    existingPlan?.type ?? 0,
  );
  const [reminders, setReminders] = useState<Reminder[]>(
    existingPlan?.remindSetting.map((r, idx) => ({
      id: `${idx + 1}`,
      time: r.time,
      label: '每日',
      enabled: r.status,
    })) || [
      {
        id: '1',
        time: new Date(2024, 0, 1, 7, 30),
        label: '每日',
        enabled: true,
      },
      {
        id: '2',
        time: new Date(2024, 0, 1, 22, 0),
        label: '复盘',
        enabled: false,
      },
    ],
  );
  const [_milestones, _setMilestones] = useState<
    {
      times: number;
      title: string;
      description: string;
      status: boolean;
    }[]
  >(existingPlan?.rewords || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'success',
  );
  const [showMilestoneDrawer, setShowMilestoneDrawer] = useState(false);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<
    number | null
  >(null);
  const [milestoneDay, setMilestoneDay] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneReward, setMilestoneReward] = useState('');

  // 当 existingPlan 数据加载完成后，更新表单数据
  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.title);
      setPlanDays(existingPlan.totalDays.toString());
      setCheckInMethod(existingPlan.type);
      setPlanIcon(getIconForPlan(existingPlan, templateData));
      setPlanColor(
        existingPlan.color || templateData?.color || Colors.primaryContainer,
      );

      // 更新提醒设置
      if (existingPlan.remindSetting && existingPlan.remindSetting.length > 0) {
        setReminders(
          existingPlan.remindSetting.map((r, idx) => ({
            id: `${idx + 1}`,
            time: r.time,
            label: '每日',
            enabled: r.status,
          })),
        );
      }

      // 更新里程碑
      if (existingPlan.rewords && existingPlan.rewords.length > 0) {
        _setMilestones(existingPlan.rewords);
      }
    } else if (templateData) {
      // 如果是模板模式，设置模板的 icon 和 color
      setPlanIcon(getIconForPlan(undefined, templateData));
      setPlanColor(templateData.color || Colors.primaryContainer);
    }
  }, [existingPlan, templateData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = async () => {
    // 验证输入
    if (!planName.trim()) {
      setToastMessage('请输入计划名称');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const days = parseInt(planDays, 10);
    if (!days || days <= 0) {
      setToastMessage('请输入有效的打卡周期');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setIsCreating(true);

    try {
      // 构建计划数据
      const newPlanData: Omit<Plan, 'id'> = {
        title: planName,
        totalDays: days,
        // completedDate 是唯一事实源：编辑模式继承原有打卡记录，新建时为空数组
        completedDate: existingPlan?.completedDate ?? [],
        type: checkInMethod,
        remindSetting: reminders.map(r => ({
          time: typeof r.time === 'string' ? r.time : formatTime(r.time),
          status: r.enabled,
        })),
        rewords: _milestones.map(
          (m: {
            times: number;
            title: string;
            description: string;
            status: boolean;
          }) => ({
            times: m.times,
            title: m.title,
            description: m.description,
            status: m.status,
          }),
        ),
        icon: planIcon,
        color: planColor,
      };

      // 调用 API 创建或更新计划
      // 实际应用中，userId应该从用户认证状态中获取
      const userId = ''; // 留空，由后端处理
      const result = isEditMode
        ? await handleUpdatePlan(planId!, newPlanData, userId)
        : await handleCreatePlan(newPlanData, userId);

      if (result.success) {
        // 显示成功提示
        setToastMessage(isEditMode ? '计划更新成功！' : '计划创建成功！');
        setToastType('success');
        setToastVisible(true);

        // 延迟返回，让用户看到提示
        setTimeout(() => {
          setIsCreating(false);

          if (isEditMode) {
            navigation.goBack();
          } else {
            // 新建计划完成后，统一跳转到“计划”页面
            navigation.navigate('Main' as never, { screen: 'Plan' } as never);
          }
        }, 1500);
      } else {
        setIsCreating(false);
        setToastMessage(
          result.error || (isEditMode ? '计划更新失败，请重试' : '计划创建失败，请重试'),
        );
        setToastType('error');
        setToastVisible(true);
      }
    } catch (error) {
      console.error('Create/Update plan error:', error);
      setIsCreating(false);
      setToastMessage(
        isEditMode ? '计划更新失败，请重试' : '计划创建失败，请重试',
      );
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleAddReminder = () => {
    if (reminders.length >= 5) return; // 最多5个提醒
    setEditingReminderId(null); // 新增模式
    const now = new Date();
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    setShowTimePicker(true);
  };

  const handleAddMilestone = () => {
    setEditingMilestoneIndex(null);
    setMilestoneDay('');
    setMilestoneTitle('');
    setMilestoneReward('');
    setShowMilestoneDrawer(true);
  };

  const handleEditMilestone = (index: number) => {
    const milestone = _milestones[index];
    setEditingMilestoneIndex(index);
    setMilestoneDay(milestone.times.toString());
    setMilestoneTitle(milestone.title);
    setMilestoneReward(milestone.description);
    setShowMilestoneDrawer(true);
  };

  const handleSaveMilestone = () => {
    const day = parseInt(milestoneDay, 10);
    if (!day || day <= 0) {
      setToastMessage('请输入有效的天数');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (!milestoneTitle.trim()) {
      setToastMessage('请输入里程碑名称');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (!milestoneReward.trim()) {
      setToastMessage('请输入奖励内容');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const newMilestone = {
      times: day,
      title: milestoneTitle,
      description: milestoneReward,
      status: false,
    };

    if (editingMilestoneIndex !== null) {
      // 编辑模式
      const updated = [..._milestones];
      updated[editingMilestoneIndex] = newMilestone;
      _setMilestones(updated);
    } else {
      // 新增模式
      _setMilestones([..._milestones, newMilestone]);
    }

    setShowMilestoneDrawer(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleDeleteMilestone = (index: number) => {
    const updated = _milestones.filter((_, i) => i !== index);
    _setMilestones(updated);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminderId(reminder.id); // 编辑模式
    // 解析时间字符串
    const timeStr =
      typeof reminder.time === 'string'
        ? reminder.time
        : formatTime(reminder.time);
    const [hours, minutes] = timeStr.split(':').map(Number);
    setSelectedHour(hours);
    setSelectedMinute(minutes);
    setShowTimePicker(true);
  };

  const handleConfirmTime = () => {
    const timeString = `${selectedHour
      .toString()
      .padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

    if (editingReminderId) {
      // 编辑模式：更新现有提醒
      setReminders(
        reminders.map(r =>
          r.id === editingReminderId ? { ...r, time: timeString } : r,
        ),
      );
    } else {
      // 新增模式：添加新提醒
      const newReminder: Reminder = {
        id: Date.now().toString(),
        time: timeString,
        label: '每日',
        enabled: true,
      };
      setReminders([...reminders, newReminder]);
    }

    setShowTimePicker(false);
    setEditingReminderId(null);
  };

  const toggleReminder = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 1200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        springDamping: 0.8,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    // 切换提醒的启用/禁用状态
    setReminders(
      reminders.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title={isEditMode ? '编辑计划' : '定制我的计划'}
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlanFormHeader
          planName={planName}
          planIcon={planIcon}
          planColor={planColor}
          isEditMode={isEditMode}
          categoryLabel={templateData?.category}
          description={!isEditMode ? templateData?.description : undefined}
        />

        <PlanGoalList goals={templateData?.goals || []} />

        <PlanBasicInfoForm
          planName={planName}
          planDays={planDays}
          onNameChange={setPlanName}
          onDaysChange={setPlanDays}
        />

        <View style={styles.section}>
          <CheckInMethodSelector
            selectedMethod={
              checkInMethod === 0
                ? 'stamp'
                : checkInMethod === 1
                ? 'number'
                : 'diary'
            }
            onMethodChange={method =>
              setCheckInMethod(
                method === 'stamp' ? 0 : method === 'number' ? 1 : 2,
              )
            }
          />
        </View>

        <PlanReminderSection
          reminders={reminders}
          onAddReminder={handleAddReminder}
          onEditReminder={handleEditReminder}
          onToggleReminder={toggleReminder}
        />

        <PlanMilestoneSection
          milestones={_milestones}
          onAddMilestone={handleAddMilestone}
          onEditMilestone={handleEditMilestone}
          onDeleteMilestone={handleDeleteMilestone}
        />
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onConfirm={handleConfirmTime}
      />

      <BottomDrawer
        visible={showMilestoneDrawer}
        onClose={() => setShowMilestoneDrawer(false)}
        title={editingMilestoneIndex !== null ? '编辑里程碑' : '添加里程碑'}
        height="75%"
      >
        <MilestoneEditorDrawerContent
          milestoneDay={milestoneDay}
          milestoneTitle={milestoneTitle}
          milestoneReward={milestoneReward}
          onDayChange={setMilestoneDay}
          onTitleChange={setMilestoneTitle}
          onRewardChange={setMilestoneReward}
          onCancel={() => setShowMilestoneDrawer(false)}
          onSave={handleSaveMilestone}
        />
      </BottomDrawer>

      <View style={styles.bottomBar}>
        <PlanFormButton
          title={isCreating ? '创建中...' : '完成'}
          onPress={handleComplete}
          disabled={isCreating}
          loading={isCreating}
        />
      </View>
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
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  bottomBar: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
});

export default CreatePlanScreen;
