import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { authApi } from '../api/auth';
import { Toast } from '../components';
import { useAuth } from '../contexts';

const DEMO_ACCOUNTS = [
  { label: '自律达人', phone: '13800000001' },
  { label: '阅读伙伴', phone: '13800000002' },
  { label: '运动搭子', phone: '13800000003' },
] as const;

const DEMO_PASSWORD = 'Pudding123';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'error',
  );

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'error',
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const finishLogin = async (
    response: Awaited<ReturnType<typeof authApi.login>>,
  ) => {
    if (!response.success || !response.data) {
      showToast(response.error || '请检查手机号和密码', 'error');
      return false;
    }

    await login(response.data.token, response.data.user);
    showToast('登录成功', 'success');
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 300);
    return true;
  };

  const handleDemoLogin = async (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword(DEMO_PASSWORD);
    setLoading(true);
    try {
      await finishLogin(
        await authApi.login({ phone: demoPhone, password: DEMO_PASSWORD }),
      );
    } catch (error) {
      console.error('Demo login error:', error);
      showToast('演示账号登录失败，请确认演示库已初始化', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号', 'error');
      return;
    }

    if (!password) {
      showToast('请输入密码', 'error');
      return;
    }

    if (!isLogin) {
      if (!name) {
        showToast('请输入用户名', 'error');
        return;
      }
      if (
        password.length < 8 ||
        !/[A-Za-z]/.test(password) ||
        !/\d/.test(password)
      ) {
        showToast('密码至少8位，且必须同时包含字母和数字', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
      }
      if (!acceptedTerms) {
        showToast('请先同意用户协议和隐私政策', 'error');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await finishLogin(await authApi.login({ phone, password }));
      } else {
        const response = await authApi.register({
          username: name,
          phone,
          password,
          confirmPassword,
          acceptedTerms,
        });
        if (response.success) {
          showToast('注册成功，请登录', 'success');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          // 检查是否是手机号已注册的错误
          if (
            response.error?.includes('已注册') ||
            response.error?.includes('已存在')
          ) {
            showToast('该手机号已注册，请直接登录', 'info');
            setIsLogin(true);
            setPassword('');
            setConfirmPassword('');
          } else {
            showToast(response.error || '注册失败，请重试', 'error');
          }
        }
      }
    } catch (error) {
      showToast('网络错误，请稍后重试', 'error');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? '欢迎回来' : '创建账号'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? '登录后继续使用布丁计划'
                : '加入布丁计划，开始你的成长之旅'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>用户名</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={Colors.onSurfaceVariant}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="请输入用户名"
                    placeholderTextColor={Colors.outlineVariant}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>手机号</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={Colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={Colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  placeholderTextColor={Colors.outlineVariant}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>确认密码</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color={Colors.onSurfaceVariant}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="请再次输入密码"
                      placeholderTextColor={Colors.outlineVariant}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAcceptedTerms(value => !value)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={
                      acceptedTerms ? 'check-box' : 'check-box-outline-blank'
                    }
                    size={22}
                    color={acceptedTerms ? Colors.primary : Colors.outline}
                  />
                  <Text style={styles.termsText}>
                    我已阅读并同意《用户协议》和《隐私政策》
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimaryContainer} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? '登录' : '注册'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>一键进入演示</Text>
                <View style={styles.demoButtons}>
                  {DEMO_ACCOUNTS.map(account => (
                    <TouchableOpacity
                      key={account.phone}
                      style={styles.demoButton}
                      onPress={() => handleDemoLogin(account.phone)}
                      disabled={loading}
                    >
                      <Text style={styles.demoButtonLabel}>
                        {account.label}
                      </Text>
                      <Text style={styles.demoButtonPhone}>
                        {account.phone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.demoHint}>统一密码：{DEMO_PASSWORD}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 64,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  submitButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  demoTitle: {
    marginBottom: Spacing.sm,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  demoButtons: {
    gap: Spacing.sm,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceContainerLow,
  },
  demoButtonLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  demoButtonPhone: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  demoHint: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xs,
    color: Colors.outline,
    textAlign: 'center',
  },
});

export default AuthScreen;
