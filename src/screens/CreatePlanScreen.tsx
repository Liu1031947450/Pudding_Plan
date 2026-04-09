import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card, Button } from '../components';
import { getTemplateById, TemplateDetail } from '../data/templateData';

type CreatePlanRouteProp = RouteProp<{ CreatePlan: { templateId?: string } }, 'CreatePlan'>;

interface Reminder {
  id: string;
  time: Date;
  label: string;
  enabled: boolean;
}

const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CreatePlanRouteProp>();
  const templateId = route.params?.templateId;

  // 获取模板数据
  const templateData: TemplateDetail | undefined = templateId ? getTemplateById(templateId) : undefined;

  const [planName, setPlanName] = useState(templateData?.title || '');
  const [planDays, setPlanDays] = useState(templateData?.duration.toString() || '');
  const planIcon = templateData?.icon || '✨';
  const planColor = templateData?.color || Colors.primaryContainer;

  const [checkInMethod, setCheckInMethod] = useState<'stamp' | 'number' | 'diary'>('stamp');
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', time: new Date(2024, 0, 1, 7, 30), label: '每日', enabled: true },
    { id: '2', time: new Date(2024, 0, 1, 22, 0), label: '复盘', enabled: false },
  ]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    navigation.goBack();
  };

  const handleAddReminder = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleConfirmTime = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      time: selectedTime,
      label: '每日',
      enabled: true,
    };
    setReminders([...reminders, newReminder]);
    setShowTimePicker(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="定制我的计划"
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
            <View style={[styles.heroImagePlaceholder, { backgroundColor: `${planColor}20` }]}>
              <Text style={styles.heroImageText}>{planIcon}</Text>
            </View>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>
              {templateData ? templateData.category : '开始新的旅程'}
            </Text>
            <Text style={styles.heroTitle}>
              {planName || '自定义计划'}
            </Text>
            {templateData && (
              <Text style={styles.heroDescription}>{templateData.description}</Text>
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
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
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
            <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>打卡方式</Text>
          </View>

          <View style={styles.methodGrid}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 'stamp' && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod('stamp')}
            >
              <MaterialIcons
                name="verified"
                size={24}
                color={checkInMethod === 'stamp' ? Colors.onPrimary : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 'stamp' && styles.methodTextActive,
                ]}
              >
                盖章打卡
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 'number' && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod('number')}
            >
              <MaterialIcons
                name="show-chart"
                size={24}
                color={checkInMethod === 'number' ? Colors.onPrimary : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 'number' && styles.methodTextActive,
                ]}
              >
                数值记录
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 'diary' && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod('diary')}
            >
              <MaterialIcons
                name="edit-note"
                size={24}
                color={checkInMethod === 'diary' ? Colors.onPrimary : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 'diary' && styles.methodTextActive,
                ]}
              >
                文字日记
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="notifications" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>提醒设置</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
              <MaterialIcons name="add" size={16} color={Colors.tertiary} />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remindersList}>
            {reminders.map(reminder => (
              <Card key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderLeft}>
                  <MaterialIcons
                    name="alarm"
                    size={20}
                    color={reminder.enabled ? Colors.primary : Colors.onSurfaceVariant}
                  />
                  <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
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
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                  trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primaryContainer }}
                  thumbColor={reminder.enabled ? Colors.primary : Colors.outline}
                />
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="emoji-events" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>阶段里程碑</Text>
          </View>

          <View style={styles.milestonesGrid}>
            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneNumber}>
                <Text style={styles.milestoneNumberText}>07</Text>
              </View>
              <Text style={styles.milestoneTitle}>小有所成</Text>
              <Text style={styles.milestoneReward}>奖励：奖励一顿丰盛早餐</Text>
              <TouchableOpacity>
                <Text style={styles.milestoneEdit}>修改奖励</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.milestoneCard}>
              <View
                style={[
                  styles.milestoneNumber,
                  styles.milestoneNumberSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.milestoneNumberText,
                    styles.milestoneNumberTextSecondary,
                  ]}
                >
                  21
                </Text>
              </View>
              <Text style={styles.milestoneTitle}>完美收官</Text>
              <Text style={styles.milestoneReward}>奖励：购买一套新瑜伽服</Text>
              <TouchableOpacity>
                <Text style={styles.milestoneEdit}>修改奖励</Text>
              </TouchableOpacity>
            </Card>

            <TouchableOpacity style={styles.addMilestoneButton}>
              <MaterialIcons name="add" size={20} color={Colors.onSurfaceVariant} />
              <Text style={styles.addMilestoneText}>添加里程碑阶段</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择提醒时间</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <MaterialIcons name="close" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  locale="zh-CN"
                />
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

      <View style={styles.bottomBar}>
        <Button
          title="完成"
          onPress={handleComplete}
          variant="primary"
          size="large"
          style={styles.completeButton}
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
    paddingBottom: 120,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: 40,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  completeButton: {
    width: '100%',
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
});

export default CreatePlanScreen;
