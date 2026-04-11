import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Button } from '../../../components/common';

interface PhoneBindSheetProps {
  currentPhone?: string;
  onBind: (phone: string, code: string) => void;
}

export const PhoneBindSheet: React.FC<PhoneBindSheetProps> = ({
  currentPhone,
  onBind,
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (phone.length === 11) {
      setCountdown(60);
    }
  };

  const isFormValid = phone.length === 11 && code.length === 6;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.infoIconWrapper}>
            <MaterialIcons
              name="phonelink-lock"
              size={32}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {currentPhone ? '修改绑定手机' : '绑定手机号'}
          </Text>
          <Text style={styles.subtitle}>
            绑定手机号可用于账号登录及安全认证，保障你的账号安全
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>手机号</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="phone-iphone"
                size={20}
                color={Colors.outline}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="请输入11位手机号"
                keyboardType="phone-pad"
                maxLength={11}
                placeholderTextColor={Colors.outline}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>验证码</Text>
            <View style={styles.row}>
              <View
                style={[
                  styles.inputWrapper,
                  { flex: 1, marginRight: Spacing.sm },
                ]}
              >
                <MaterialIcons
                  name="verified-user"
                  size={20}
                  color={Colors.outline}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="6位验证码"
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor={Colors.outline}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  (countdown > 0 || phone.length !== 11) &&
                    styles.sendCodeDisabled,
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || phone.length !== 11}
              >
                <Text
                  style={[
                    styles.sendCodeText,
                    (countdown > 0 || phone.length !== 11) &&
                      styles.sendCodeTextDisabled,
                  ]}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button
          title="确认绑定"
          disabled={!isFormValid}
          onPress={() => onBind(phone, code)}
          style={styles.actionButton}
        />

        {currentPhone && (
          <Text style={styles.currentHint}>当前绑定: {currentPhone}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  infoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl * 1.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 52,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  sendCodeButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  sendCodeDisabled: {
    backgroundColor: Colors.surfaceContainerHigh,
    opacity: 0.5,
  },
  sendCodeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  sendCodeTextDisabled: {
    color: Colors.outline,
  },
  actionButton: {
    marginTop: Spacing.md,
  },
  currentHint: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.lg,
    opacity: 0.6,
  },
});
