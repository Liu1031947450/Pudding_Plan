import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card } from '../components';
import { templateService } from '../services/templateService';
import type { TemplateDetail } from '../data/templates';

type RootStackParamList = {
  CreatePlan: { templateId?: string } | undefined;
};

const TemplateSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [templates, setTemplates] = useState<TemplateDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getAllTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTemplateSelect = (templateId: string) => {
    navigation.navigate('CreatePlan', { templateId });
  };

  const handleCustomPlan = () => {
    navigation.navigate('CreatePlan');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopAppBar title="选择模板" showBackButton onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载模板中...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {templates.map(template => (
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
                  <MaterialIcons
                    name={template.icon as any}
                    size={32}
                    color={Colors.primary}
                  />
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
                      {template.duration}天
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
});

export default TemplateSelectionScreen;
