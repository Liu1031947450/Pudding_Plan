import React from 'react';
import { StyleSheet, TextInput, ScrollView } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Button } from '../../../components/common';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface PasswordSheetProps {
  mode: 'change' | 'delete';
  onSubmit: (data: {
    currentPassword: string;
    newPassword?: string;
    confirmPassword?: string;
  }) => Promise<string | null>;
}

export const PasswordSheet: React.FC<PasswordSheetProps> = ({
  mode,
  onSubmit,
}) => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const changing = mode === 'change';

  const submit = async () => {
    if (!currentPassword || (changing && (!newPassword || !confirmPassword))) {
      setError('请填写完整的密码信息');
      return;
    }
    if (changing && newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setError(
        (await onSubmit({ currentPassword, newPassword, confirmPassword })) ||
          '',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {mode === 'delete' && (
        <Text style={styles.warning}>
          注销后账号、计划、习惯、动态、图片与互动数据将被永久删除，无法恢复。
        </Text>
      )}
      <Text style={styles.label}>当前密码</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="请输入当前密码"
        placeholderTextColor={Colors.outline}
        secureTextEntry
        autoCapitalize="none"
      />
      {changing && (
        <>
          <Text style={styles.label}>新密码</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="至少 8 位，包含字母和数字"
            placeholderTextColor={Colors.outline}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.label}>确认新密码</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="再次输入新密码"
            placeholderTextColor={Colors.outline}
            secureTextEntry
            autoCapitalize="none"
          />
        </>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={changing ? '修改密码' : '永久注销账号'}
        onPress={submit}
        loading={loading}
        disabled={loading}
        style={mode === 'delete' && styles.deleteButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    marginTop: Spacing.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    color: Colors.onSurface,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  warning: {
    color: Colors.error,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    marginTop: Spacing.md,
  },
});
