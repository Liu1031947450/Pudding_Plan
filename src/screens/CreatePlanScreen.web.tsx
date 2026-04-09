import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card, Button, Chip } from '../components';

const CreatePlanScreen: React.FC = () => {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('21天');
  const [selectedFrequency, setSelectedFrequency] = useState('每天');
  const [selectedCategory, setSelectedCategory] = useState('健康');

  const durationOptions = ['7天', '14天', '21天', '30天', '60天', '90天'];
  const frequencyOptions = ['每天', '每周3次', '每周5次', '自定义'];
  const categoryOptions = ['健康', '学习', '工作', '生活', '其他'];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>创建新计划</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>计划名称</Text>
        <Card style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="输入计划名称"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={planName}
            onChangeText={setPlanName}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>计划描述</Text>
        <Card style={[styles.inputCard, styles.textAreaCard]}>
          <TextInput
            style={styles.textArea}
            placeholder="描述你的计划目标和期望"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={planDescription}
            onChangeText={setPlanDescription}
            multiline
            numberOfLines={4}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>计划周期</Text>
        <View style={styles.chipGrid}>
          {durationOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selectedDuration === option}
              onPress={() => setSelectedDuration(option)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>执行频率</Text>
        <View style={styles.chipGrid}>
          {frequencyOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selectedFrequency === option}
              onPress={() => setSelectedFrequency(option)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>计划分类</Text>
        <View style={styles.chipGrid}>
          {categoryOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selectedCategory === option}
              onPress={() => setSelectedCategory(option)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提醒设置</Text>
        <Card style={styles.reminderCard}>
          <View style={styles.reminderItem}>
            <View style={styles.reminderInfo}>
              <View style={styles.reminderIcon}>
                <Text style={styles.reminderIconText}>⏰</Text>
              </View>
              <Text style={styles.reminderText}>每日提醒</Text>
            </View>
            <View style={styles.toggle}>
              <View style={[styles.toggleTrack, styles.toggleTrackOn]}>
                <View style={[styles.toggleThumb, styles.toggleThumbOn]} />
              </View>
            </View>
          </View>
          <View style={styles.reminderItem}>
            <View style={styles.reminderInfo}>
              <View style={styles.reminderIcon}>
                <Text style={styles.reminderIconText}>🌙</Text>
              </View>
              <Text style={styles.reminderText}>睡前提醒</Text>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleTrack}>
                <View style={styles.toggleThumb} />
              </View>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隐私设置</Text>
        <Card style={styles.privacyCard}>
          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <View style={[styles.privacyIcon, { backgroundColor: Colors.primaryContainer }]}>
                <Text style={styles.privacyIconText}>🔒</Text>
              </View>
              <Text style={styles.privacyText}>私密计划</Text>
            </View>
            <View style={styles.radioButton}>
              <View style={[styles.radioOuter, styles.radioOuterSelected]}>
                <View style={styles.radioInner} />
              </View>
            </View>
          </View>
          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <View style={[styles.privacyIcon, { backgroundColor: Colors.secondaryContainer }]}>
                <Text style={styles.privacyIconText}>👥</Text>
              </View>
              <Text style={styles.privacyText}>公开计划</Text>
            </View>
            <View style={styles.radioButton}>
              <View style={styles.radioOuter} />
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="创建计划"
          onPress={() => console.log('Create plan')}
          variant="primary"
          size="large"
          style={styles.createButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    width: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerRight: {
    width: 48,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  inputCard: {
    padding: Spacing.md,
  },
  textAreaCard: {
    padding: Spacing.md,
    minHeight: 120,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  textArea: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  reminderCard: {
    padding: Spacing.md,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  reminderIconText: {
    fontSize: 20,
  },
  reminderText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  toggle: {},
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 2,
  },
  toggleTrackOn: {
    backgroundColor: Colors.primaryContainer,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  toggleThumbOn: {
    transform: [{ translateX: 22 }],
  },
  privacyCard: {
    padding: Spacing.md,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  privacyIconText: {
    fontSize: 20,
  },
  privacyText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  radioButton: {},
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    margin: 2,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  createButton: {
    width: '100%',
  },
});

export default CreatePlanScreen;
