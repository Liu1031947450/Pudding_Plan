import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card, Button, Toast } from '../components';
import { templateDetails } from '../data/templates';
import { usePlanManagement } from '../hooks';
import { planService } from '../services/planService';
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
  const isEditMode = !!planId;

  useEffect(() => {
    if (planId) {
      const fetchPlanDetail = async () => {
        const userId = '1234567890'; // mock userId
        const planData = await planService.getPlanById(planId, userId);
        if (planData) {
          setExistingPlan(planData);
        }
      };
      fetchPlanDetail();
    }
  }, [planId]);

  // 获取模板数据
  const templateData: TemplateDetail | undefined = templateId
    ? templateDetails[templateId]
    : undefined;

  const [planName, setPlanName] = useState(
    existingPlan?.title || templateData?.title || '',
  );
  const [planDays, setPlanDays] = useState(
    existingPlan?.totalDays.toString() ||
      templateData?.duration.toString() ||
      '',
  );
  const [planIcon, setPlanIcon] = useState<string>('✨');
  const [planColor, setPlanColor] = useState<string>(Colors.primaryContainer);

  // 根据模板获取图标，如果是 emoji 则直接使用，否则使用默认的 MaterialIcon
  const getIconForPlan = (plan?: Plan, template?: TemplateDetail): string => {
    if (plan?.icon) {
      return plan.icon;
    }
    if (template?.icon) {
      // 如果模板有 emoji 图标，返回 emoji
      return template.icon;
    }
    // 自定义计划使用默认图标
    return '✨';
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
        currentDays: existingPlan?.currentDays ?? 0, // 保留已完成天数
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
        // 可选的展示字段
        color: planColor,
      };

      // 调用 API 创建或更新计划
      const userId = '1234567890'; // mock userId
      const result = isEditMode
        ? await handleUpdatePlan(planId!, newPlanData, userId)
        : await handleCreatePlan(newPlanData, userId);

      if (result) {
        // 显示成功提示
        setToastMessage(isEditMode ? '计划更新成功！' : '计划创建成功！');
        setToastType('success');
        setToastVisible(true);

        // 延迟返回，让用户看到提示
        setTimeout(() => {
          setIsCreating(false);

          // 获取导航状态，判断是否需要返回多层
          const navState = navigation.getState();
          const routes = navState?.routes || [];
          const currentIndex = navState?.index || 0;

          // 如果当前路由栈中有 TemplateSelection，需要返回两层
          const hasTemplateSelection = routes.some(
            r => r.name === 'TemplateSelection',
          );

          if (hasTemplateSelection && currentIndex >= 2) {
            // 返回到 Main（Plan 页面），跳过 TemplateSelection
            navigation.navigate('Main' as never);
          } else {
            // 直接返回上一页
            navigation.goBack();
          }
        }, 1500);
      } else {
        setIsCreating(false);
        setToastMessage(
          isEditMode ? '计划更新失败，请重试' : '计划创建失败，请重试',
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

  // 获取排序后的提醒列表
  const getSortedReminders = () => {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const enabled = reminders
      .filter(r => r.enabled)
      .sort((a, b) => {
        const timeA = parseTime(
          typeof a.time === 'string' ? a.time : formatTime(a.time),
        );
        const timeB = parseTime(
          typeof b.time === 'string' ? b.time : formatTime(b.time),
        );
        return timeA - timeB;
      });

    const disabled = reminders
      .filter(r => !r.enabled)
      .sort((a, b) => {
        const timeA = parseTime(
          typeof a.time === 'string' ? a.time : formatTime(a.time),
        );
        const timeB = parseTime(
          typeof b.time === 'string' ? b.time : formatTime(b.time),
        );
        return timeA - timeB;
      });

    return [...enabled, ...disabled];
  };

  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
      return date;
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
        <View style={styles.heroSection}>
          <View style={styles.heroImage}>
            <View
              style={[
                styles.heroImagePlaceholder,
                { backgroundColor: `${planColor}20` },
              ]}
            >
              <Text style={styles.heroImageText}>{planIcon}</Text>
            </View>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>
              {isEditMode
                ? '编辑计划'
                : templateData
                ? templateData.category
                : '开始新的旅程'}
            </Text>
            <Text style={styles.heroTitle}>{planName || '自定义计划'}</Text>
            {templateData && !isEditMode && (
              <Text style={styles.heroDescription}>
                {templateData.description}
              </Text>
            )}
          </View>
        </View>

        {templateData && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="flag" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>计划目标</Text>
            </View>
            <View style={styles.goalsList}>
              {templateData.goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>基础信息</Text>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>计划名称</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={planName}
                  onChangeText={setPlanName}
                  placeholderTextColor={Colors.outline}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>打卡周期</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={planDays}
                  onChangeText={setPlanDays}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.outline}
                />
                <Text style={styles.inputSuffix}>天</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>打卡方式</Text>
          </View>

          <View style={styles.methodGrid}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 0 && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod(0)}
            >
              <MaterialIcons
                name="verified"
                size={24}
                color={
                  checkInMethod === 0
                    ? Colors.onPrimary
                    : Colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 0 && styles.methodTextActive,
                ]}
              >
                盖章打卡
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 1 && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod(1)}
            >
              <MaterialIcons
                name="show-chart"
                size={24}
                color={
                  checkInMethod === 1
                    ? Colors.onPrimary
                    : Colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 1 && styles.methodTextActive,
                ]}
              >
                数值记录
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 2 && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod(2)}
            >
              <MaterialIcons
                name="edit-note"
                size={24}
                color={
                  checkInMethod === 2
                    ? Colors.onPrimary
                    : Colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 2 && styles.methodTextActive,
                ]}
              >
                文字日记
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="notifications"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>提醒设置</Text>
            <TouchableOpacity
              style={[
                styles.addButton,
                reminders.length >= 5 && styles.addButtonDisabled,
              ]}
              onPress={handleAddReminder}
              disabled={reminders.length >= 5}
            >
              <MaterialIcons
                name="add"
                size={16}
                color={
                  reminders.length >= 5
                    ? Colors.outlineVariant
                    : Colors.tertiary
                }
              />
              <Text
                style={[
                  styles.addButtonText,
                  reminders.length >= 5 && styles.addButtonTextDisabled,
                ]}
              >
                添加 ({reminders.length}/5)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remindersList}>
            {getSortedReminders().map(reminder => (
              <Card key={reminder.id} style={styles.reminderCard}>
                <TouchableOpacity
                  style={styles.reminderLeft}
                  onPress={() => handleEditReminder(reminder)}
                >
                  <MaterialIcons
                    name="alarm"
                    size={20}
                    color={
                      reminder.enabled
                        ? Colors.primary
                        : Colors.onSurfaceVariant
                    }
                  />
                  <Text style={styles.reminderTime}>
                    {formatTime(reminder.time)}
                  </Text>
                  <View
                    style={[
                      styles.reminderBadge,
                      !reminder.enabled && styles.reminderBadgeGray,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reminderBadgeText,
                        !reminder.enabled && styles.reminderBadgeTextGray,
                      ]}
                    >
                      {reminder.label}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                  trackColor={{
                    false: Colors.surfaceContainerHigh,
                    true: Colors.primaryContainer,
                  }}
                  thumbColor={
                    reminder.enabled ? Colors.primary : Colors.outline
                  }
                />
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="emoji-events"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>阶段里程碑</Text>
          </View>

          <View style={styles.milestonesGrid}>
            {_milestones.map((milestone, index) => (
              <Card key={index} style={styles.milestoneCard}>
                <View style={styles.milestoneNumber}>
                  <Text style={styles.milestoneNumberText}>
                    {milestone.times.toString().padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneReward}>
                  奖励：{milestone.description}
                </Text>
                <View style={styles.milestoneActions}>
                  <TouchableOpacity onPress={() => handleEditMilestone(index)}>
                    <Text style={styles.milestoneEdit}>修改奖励</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteMilestone(index)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            <TouchableOpacity
              style={styles.addMilestoneButton}
              onPress={handleAddMilestone}
            >
              <MaterialIcons
                name="add"
                size={20}
                color={Colors.onSurfaceVariant}
              />
              <Text style={styles.addMilestoneText}>添加里程碑阶段</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <TouchableOpacity
              style={styles.timePickerModal}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择提醒时间</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={Colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.customPickerContainer}>
                <View style={styles.pickerRow}>
                  <ScrollView
                    style={styles.pickerColumn}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerItem,
                          selectedHour === hour && styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedHour === hour &&
                              styles.pickerItemTextSelected,
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.pickerSeparator}>:</Text>

                  <ScrollView
                    style={styles.pickerColumn}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedMinute === minute &&
                              styles.pickerItemTextSelected,
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleConfirmTime}
                >
                  <Text style={styles.modalConfirmText}>确定</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {showMilestoneDrawer && (
        <Modal
          visible={showMilestoneDrawer}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMilestoneDrawer(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMilestoneDrawer(false)}
          >
            <TouchableOpacity
              style={styles.timePickerModal}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMilestoneIndex !== null ? '编辑里程碑' : '添加里程碑'}
                </Text>
                <TouchableOpacity onPress={() => setShowMilestoneDrawer(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={Colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>天数</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneDay}
                      onChangeText={setMilestoneDay}
                      placeholder="输入天数"
                      placeholderTextColor={Colors.onSurfaceVariant}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.inputSuffix}>天</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>里程碑名称</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneTitle}
                      onChangeText={setMilestoneTitle}
                      placeholder="例如：小有所成"
                      placeholderTextColor={Colors.onSurfaceVariant}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>奖励内容</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneReward}
                      onChangeText={setMilestoneReward}
                      placeholder="例如：奖励一顿丰盛早餐"
                      placeholderTextColor={Colors.onSurfaceVariant}
                      multiline
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowMilestoneDrawer(false)}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleSaveMilestone}
                >
                  <Text style={styles.modalConfirmText}>保存</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {showMilestoneDrawer && (
        <Modal
          visible={showMilestoneDrawer}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMilestoneDrawer(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMilestoneDrawer(false)}
          >
            <TouchableOpacity
              style={styles.timePickerModal}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMilestoneIndex !== null ? '编辑里程碑' : '添加里程碑'}
                </Text>
                <TouchableOpacity onPress={() => setShowMilestoneDrawer(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={Colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>天数</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneDay}
                      onChangeText={setMilestoneDay}
                      placeholder="输入天数"
                      placeholderTextColor={Colors.onSurfaceVariant}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.inputSuffix}>天</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>里程碑名称</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneTitle}
                      onChangeText={setMilestoneTitle}
                      placeholder="例如：小有所成"
                      placeholderTextColor={Colors.onSurfaceVariant}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>奖励内容</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={milestoneReward}
                      onChangeText={setMilestoneReward}
                      placeholder="例如：奖励一顿丰盛早餐"
                      placeholderTextColor={Colors.onSurfaceVariant}
                      multiline
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowMilestoneDrawer(false)}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleSaveMilestone}
                >
                  <Text style={styles.modalConfirmText}>保存</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      <View style={styles.bottomBar}>
        <Button
          title={isCreating ? '创建中...' : '完成'}
          onPress={handleComplete}
          variant="primary"
          size="large"
          style={styles.completeButton}
          disabled={isCreating}
        />
        {isCreating && (
          <ActivityIndicator
            style={styles.loadingIndicator}
            color={Colors.primary}
            size="small"
          />
        )}
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
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroImage: {
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  heroImagePlaceholder: {
    flex: 1,
    backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageText: {
    fontSize: 48,
  },
  heroContent: {},
  heroLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  heroDescription: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  goalsList: {
    gap: Spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  goalText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.tertiaryContainer}20`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  addButtonDisabled: {
    backgroundColor: `${Colors.outlineVariant}10`,
  },
  addButtonTextDisabled: {
    color: Colors.outlineVariant,
  },
  inputGrid: {
    gap: Spacing.md,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.md,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    padding: 0,
  },
  inputSuffix: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  methodGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodButton: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodIcon: {
    fontSize: 28,
    color: Colors.onSurfaceVariant,
  },
  methodText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  methodTextActive: {
    color: Colors.onPrimary,
  },
  remindersList: {
    gap: Spacing.sm,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reminderIcon: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.md,
  },
  reminderTime: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  reminderBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  reminderBadgeGray: {
    backgroundColor: Colors.surfaceContainerHighEST,
  },
  reminderBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSecondaryContainer,
  },
  reminderBadgeTextGray: {
    color: Colors.onSurfaceVariant,
  },
  reminderToggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    padding: 2,
  },
  toggleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.onSecondary,
    alignSelf: 'flex-end',
  },
  toggleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.outline,
    alignSelf: 'flex-start',
  },
  milestonesGrid: {
    gap: Spacing.sm,
  },
  milestoneCard: {
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.outlineVariant}30`,
  },
  milestoneNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  milestoneNumberSecondary: {
    backgroundColor: Colors.secondaryContainer,
  },
  milestoneNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onPrimaryContainer,
  },
  milestoneNumberTextSecondary: {
    color: Colors.onSecondaryContainer,
  },
  milestoneTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  milestoneReward: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  milestoneEdit: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.outlineVariant}20`,
    borderRadius: BorderRadius.lg,
  },
  addMilestoneIcon: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },
  addMilestoneText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  bottomBar: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  completeButton: {
    paddingVertical: Spacing.sm,
  },
  loadingIndicator: {
    position: 'absolute',
    right: Spacing.xl,
    top: '50%',
    marginTop: -8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
  pickerContainer: {
    paddingVertical: Spacing.lg,
    minHeight: 200,
  },
  customPickerContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  pickerColumn: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primaryContainer,
  },
  pickerItemText: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  pickerSeparator: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  drawerContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
});

export default CreatePlanScreen;
