import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Button } from '../../../components/common';

interface FeedbackSheetProps {
  onSubmit: (feedback: string, email: string) => void;
}

export const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const feedbackTypes = [
    { label: '功能建议', icon: 'lightbulb' },
    { label: '遇到问题', icon: 'report-problem' },
    { label: '体验优化', icon: 'mood' },
    { label: '其他', icon: 'more-horiz' },
  ];
  const [selectedType, setSelectedType] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>你的声音对我们很重要</Text>
        <Text style={styles.subtitle}>
          无论是建议还是吐槽，我们都会认真倾听，努力让治愈计划变得更好。
        </Text>
      </View>

      <View style={styles.typeGrid}>
        {feedbackTypes.map((type, index) => (
          <TouchableOpacity
            key={type.label}
            style={[
              styles.typeItem,
              selectedType === index && styles.typeItemActive,
            ]}
            onPress={() => setSelectedType(index)}
          >
            <MaterialIcons
              name={type.icon as any}
              size={24}
              color={
                selectedType === index
                  ? Colors.primary
                  : Colors.onSurfaceVariant
              }
            />
            <Text
              style={[
                styles.typeLabel,
                selectedType === index && styles.typeLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>反馈内容</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="请详细描述你的建议或遇到的问题..."
              placeholderTextColor={Colors.outline}
              multiline
              numberOfLines={6}
            />
            <Text style={styles.charCount}>{feedback.length}/500</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>联系方式 (可选)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="邮箱或手机号，方便我们向你反馈进度"
              placeholderTextColor={Colors.outline}
            />
          </View>
        </View>
      </View>

      <Button
        title="提交反馈"
        disabled={feedback.length < 5}
        onPress={() => onSubmit(feedback, email)}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    opacity: 0.8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  typeItemActive: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textAreaWrapper: {
    height: 160,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  textArea: {
    flex: 1,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: FontSize.xs,
    color: Colors.outline,
    marginTop: 4,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
