import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card, Button } from '../components';

const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('晨间瑜伽与冥想');
  const [planDays, setPlanDays] = useState('21');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    navigation.goBack();
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
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroImageText}>🧘</Text>
            </View>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>开始新的旅程</Text>
            <Text style={styles.heroTitle}>晨间瑜伽与冥想</Text>
          </View>
        </View>

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
              style={[styles.methodButton, styles.methodButtonActive]}
            >
              <MaterialIcons name="verified" size={24} color={Colors.primary} />
              <Text style={[styles.methodText, styles.methodTextActive]}>
                盖章打卡
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodButton}>
              <MaterialIcons name="show-chart" size={24} color={Colors.onSurfaceVariant} />
              <Text style={styles.methodText}>数值记录</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodButton}>
              <MaterialIcons name="edit-note" size={24} color={Colors.onSurfaceVariant} />
              <Text style={styles.methodText}>文字日记</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <MaterialIcons name="notifications" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>提醒设置</Text>
            <TouchableOpacity style={styles.addButton}>
              <MaterialIcons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remindersList}>
            <Card style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <MaterialIcons name="alarm" size={20} color={Colors.primary} />
                <Text style={styles.reminderTime}>07:30</Text>
                <View style={styles.reminderBadge}>
                  <Text style={styles.reminderBadgeText}>每日</Text>
                </View>
              </View>
              <View style={styles.reminderToggle}>
                <View style={styles.toggleActive} />
              </View>
            </Card>

            <Card style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <MaterialIcons name="alarm" size={20} color={Colors.onSurfaceVariant} />
                <Text style={styles.reminderTime}>22:00</Text>
                <View style={[styles.reminderBadge, styles.reminderBadgeGray]}>
                  <Text style={styles.reminderBadgeTextGray}>复盘</Text>
                </View>
              </View>
              <View style={styles.reminderToggle}>
                <View style={styles.toggleInactive} />
              </View>
            </Card>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
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
    backgroundColor: `${Colors.tertiaryContainer}20`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
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
    marginRight: Spacing.sm,
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
});

export default CreatePlanScreen;
