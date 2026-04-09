import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card } from '../components';

type RootStackParamList = {
  CreatePlan: { templateId?: string } | undefined;
};

interface Template {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  color: string;
  category: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    title: '晨间瑜伽与冥想',
    subtitle: '开启活力一天',
    duration: '21天',
    icon: '🧘',
    color: Colors.primaryContainer,
    category: '身心健康',
  },
  {
    id: '2',
    title: '早起挑战',
    subtitle: '养成早睡早起习惯',
    duration: '30天',
    icon: '☀️',
    color: Colors.secondaryContainer,
    category: '生活习惯',
  },
  {
    id: '3',
    title: '阅读计划',
    subtitle: '每天阅读30分钟',
    duration: '60天',
    icon: '📚',
    color: Colors.tertiaryContainer,
    category: '学习成长',
  },
  {
    id: '4',
    title: '健身减脂',
    subtitle: '科学运动塑形',
    duration: '90天',
    icon: '💪',
    color: Colors.primaryContainer,
    category: '身心健康',
  },
  {
    id: '5',
    title: '戒糖挑战',
    subtitle: '远离高糖食物',
    duration: '21天',
    icon: '🍎',
    color: Colors.secondaryContainer,
    category: '生活习惯',
  },
  {
    id: '6',
    title: '学习新技能',
    subtitle: '每天练习1小时',
    duration: '100天',
    icon: '🎯',
    color: Colors.tertiaryContainer,
    category: '学习成长',
  },
];

const TemplateSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTemplateSelect = (templateId: string) => {
    navigation.navigate('CreatePlan', { templateId });
  };

  const handleCustomPlan = () => {
    navigation.navigate('CreatePlan');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="选择模板" showBackButton onBackPress={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>从模板开始</Text>
          <Text style={styles.headerSubtitle}>
            选择一个适合你的计划模板，或从零开始定制
          </Text>
        </View>

        <View style={styles.templatesGrid}>
          {mockTemplates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplateSelect(template.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.cardInner}>
                <View
                  style={[
                    styles.templateIcon,
                    { backgroundColor: template.color },
                  ]}
                >
                  <Text style={styles.templateIconText}>{template.icon}</Text>
                </View>
                <View style={styles.templateContent}>
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {template.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.templateSubtitle}>
                    {template.subtitle}
                  </Text>
                  <View style={styles.templateFooter}>
                    <MaterialIcons
                      name="schedule"
                      size={16}
                      color={Colors.onSurfaceVariant}
                    />
                    <Text style={styles.templateDuration}>
                      {template.duration}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.customButton}
          onPress={handleCustomPlan}
          activeOpacity={0.7}
        >
          <Card style={styles.customCard}>
            <View style={styles.customIconWrapper}>
              <MaterialIcons
                name="add-circle"
                size={32}
                color={Colors.primary}
              />
            </View>
            <View style={styles.customContent}>
              <Text style={styles.customTitle}>自定义计划</Text>
              <Text style={styles.customSubtitle}>
                从零开始，完全按你的想法定制
              </Text>
            </View>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={Colors.primary}
            />
          </Card>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: Spacing.xl,
  },
  headerSection: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  templatesGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  templateCard: {
    width: '100%',
  },
  cardInner: {
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'center',
  },
  templateIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  templateIconText: {
    fontSize: 32,
  },
  templateContent: {
    flex: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  templateTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  templateSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  templateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateDuration: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  customButton: {
    marginTop: Spacing.md,
  },
  customCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: `${Colors.primaryContainer}10`,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.primary}30`,
  },
  customIconWrapper: {
    marginRight: Spacing.md,
  },
  customContent: {
    flex: 1,
  },
  customTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  customSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
});

export default TemplateSelectionScreen;
