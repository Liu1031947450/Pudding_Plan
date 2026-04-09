import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card, Avatar } from '../components';

const CirclesScreen: React.FC = () => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PuddingPlan</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>社交净土</Text>
        <Text style={styles.heroSubtitle}>
          在他人陪伴下寻找你的从容节奏。没有压力，只有共在。
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>找个搭子</Text>
            <Text style={styles.sectionSubtitle}>连接志同道合的成长伙伴</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buddiesGrid}>
          <Card style={styles.buddyCard}>
            <Text style={styles.buddyAvatar}>👩</Text>
            <Text style={styles.buddyName}>Elena R.</Text>
            <Text style={styles.buddyGoal}>目标：晨间瑜伽</Text>
            <TouchableOpacity style={styles.buddyButtonPrimary}>
              <Text style={styles.buddyButtonTextPrimary}>打个招呼</Text>
            </TouchableOpacity>
          </Card>

          <Card style={[styles.buddyCard, styles.buddyCardOffset]}>
            <Text style={styles.buddyAvatar}>👨</Text>
            <Text style={styles.buddyName}>Marcus K.</Text>
            <Text style={styles.buddyGoal}>目标：数字排毒</Text>
            <TouchableOpacity style={styles.buddyButtonSecondary}>
              <Text style={styles.buddyButtonTextSecondary}>发个鼓励</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>加入圈子</Text>
            <Text style={styles.sectionSubtitle}>静心独处的共享空间</Text>
          </View>
        </View>

        <View style={styles.circlesGrid}>
          <Card style={[styles.circleCard, styles.circleCardLarge]}>
            <View style={styles.circleContent}>
              <View style={styles.circleTag}>
                <Text style={styles.circleTagText}>热门</Text>
              </View>
              <Text style={styles.circleTitleLarge}>晨读小组</Text>
              <Text style={styles.circleMembers}>1.2k 位成员正在安静共读</Text>
            </View>
          </Card>

          <Card style={styles.circleCardSmall}>
            <Text style={styles.smallCircleIcon}>🧶</Text>
            <Text style={styles.smallCircleTitle}>静心手工</Text>
            <View style={styles.smallCircleArrow}>
              <Text style={styles.arrowText}>加入</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </Card>

          <Card style={styles.circleCardSmall}>
            <Text style={styles.smallCircleIcon}>🧘</Text>
            <Text style={styles.smallCircleTitle}>深呼吸</Text>
            <View style={styles.smallCircleArrow}>
              <Text style={styles.arrowText}>加入</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </Card>
        </View>
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
    paddingBottom: 140,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  buddiesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buddyCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  buddyCardOffset: {
    marginTop: 32,
  },
  buddyAvatar: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  buddyName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  buddyGoal: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  buddyButtonPrimary: {
    width: '100%',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
  },
  buddyButtonSecondary: {
    width: '100%',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    backgroundColor: Colors.secondaryContainer,
  },
  buddyButtonTextPrimary: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  buddyButtonTextSecondary: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSecondaryContainer,
  },
  circlesGrid: {
    gap: Spacing.sm,
  },
  circleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  circleCardLarge: {
    height: 192,
    backgroundColor: '#4a5568',
    justifyContent: 'flex-end',
  },
  circleCardSmall: {
    padding: Spacing.md,
  },
  circleContent: {
    padding: Spacing.md,
  },
  circleTag: {
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  circleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onTertiaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  circleTitleLarge: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.surfaceContainerLowest,
    marginBottom: 2,
  },
  circleMembers: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  smallCircleIcon: {
    fontSize: 24,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  smallCircleTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  smallCircleArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
});

export default CirclesScreen;
