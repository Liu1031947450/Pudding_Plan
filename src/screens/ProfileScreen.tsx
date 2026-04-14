import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  BottomNavBar,
  TopAppBar,
  Avatar,
  Card,
  BottomDrawer,
} from '../components';
import { authApi, badgesApi } from '../api';
import { useAuth } from '../contexts';
import { FeedbackSheet } from '../features/settings';
import type { Badge } from '../types/domain';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [stats, setStats] = useState({
    streakDays: 0,
    totalCheckIns: 0,
    totalBadges: 0,
    healingPlans: 0,
  });

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [badgesResponse, statsResponse] = await Promise.all([
        badgesApi.getAll(),
        authApi.getCurrentUserStats(),
      ]);

      if (badgesResponse.success && badgesResponse.data) {
        setBadges(badgesResponse.data);
        setStats(prev => ({
          ...prev,
          totalBadges: badgesResponse.data!.filter(b => b.unlocked).length,
        }));
      }

      if (statsResponse.success && statsResponse.data) {
        const d = statsResponse.data;
        setStats(prev => ({
          ...prev,
          streakDays: d.streakDays,
          totalCheckIns: d.totalCheckIns,
          healingPlans: d.healingPlans,
        }));
      }
    } catch (error) {
      console.error('获取个人中心数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="settings"
        onLeftPress={() => navigation.navigate('Settings' as never)}
        rightIcon="more-vert"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Avatar uri={user?.avatar || undefined} size="xlarge" />
            </View>
            <View style={styles.avatarBadge}>
              <MaterialIcons name="verified" size={16} color={Colors.onSecondary} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || '未登录'}</Text>
            <Text style={styles.userBio}>{user?.bio || '这个人很懒，还没有填写简介'}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Card style={styles.statsCardLarge}>
            <View style={styles.statsCardHeader}>
              <MaterialIcons name="calendar-today" size={24} color={Colors.primary} />
              <View style={styles.statsCardContent}>
                <Text style={styles.statsNumber}>{stats.streakDays}</Text>
                <Text style={styles.statsLabel}>坚持天数</Text>
              </View>
            </View>
          </Card>

          <View style={styles.statsColumn}>
            <Card style={styles.statsCardSmall}>
              <View style={styles.statsCardRow}>
                <View style={styles.statsIconWrapper}>
                  <MaterialIcons name="workspace-premium" size={16} color={Colors.onPrimaryContainer} />
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>{stats.totalCheckIns}</Text>
                  <Text style={styles.statsSmallLabel}>累计盖章</Text>
                </View>
              </View>
            </Card>
            <Card style={styles.statsCardSmall}>
              <View style={styles.statsCardRow}>
                <View style={[styles.statsIconWrapper, { backgroundColor: Colors.secondaryContainer }]}>
                  <MaterialIcons name="spa" size={16} color={Colors.onSecondaryContainer} />
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>{stats.healingPlans}</Text>
                  <Text style={styles.statsSmallLabel}>治愈计划</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>勋章墙</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Badges' as never)}>
              <Text style={styles.viewAllText}>全部</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : badges.length > 0 ? (
              badges.map(badge => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View style={[styles.badgeIcon, { backgroundColor: badge.unlocked ? badge.color : Colors.surfaceVariant }]}>
                    <MaterialIcons
                      name={badge.icon}
                      size={28}
                      color={badge.unlocked ? Colors.white : Colors.outlineVariant}
                    />
                    {!badge.unlocked && (
                      <View style={styles.lockOverlay}>
                        <MaterialIcons name="lock" size={10} color={Colors.outlineVariant} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.badgeTitle, !badge.unlocked && styles.lockedText]}>
                    {badge.title}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无徽章</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CheckInRecords' as never)}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.primary}10` }]}>
                  <MaterialIcons name="event-available" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuText}>打卡记录</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.secondary}10` }]}>
                  <MaterialIcons name="favorite" size={20} color={Colors.secondary} />
                </View>
                <Text style={styles.menuText}>我的收藏</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setFeedbackVisible(true)}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.tertiary}10` }]}>
                  <MaterialIcons name="help-outline" size={20} color={Colors.tertiary} />
                </View>
                <Text style={styles.menuText}>帮助与反馈</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      <BottomDrawer
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        title="意见反馈"
        height="85%"
      >
        <FeedbackSheet
          onSubmit={() => {
            setFeedbackVisible(false);
          }}
        />
      </BottomDrawer>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    paddingBottom: 140,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarBorder: {
    borderRadius: 60,
    padding: 2,
    backgroundColor: Colors.primaryContainer,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
  avatarBadgeText: {
    fontSize: 12,
    color: Colors.onSecondary,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  userBio: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  statsSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statsCardLarge: {
    flex: 1,
    height: 140,
    justifyContent: 'space-between',
  },
  statsCardHeader: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statsIcon: {
    fontSize: 32,
    color: Colors.primary,
  },
  statsCardContent: {},
  statsNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  statsLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  statsCardSmall: {
    flex: 1,
  },
  statsCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statsIconWrapper: {
    backgroundColor: Colors.primaryContainer,
    padding: 8,
    borderRadius: BorderRadius.full,
  },
  statsSmallIcon: {
    fontSize: 16,
    color: Colors.onPrimaryContainer,
  },
  statsSmallNumber: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statsSmallLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  badgesContainer: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    width: 72,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  badgeIconText: {
    fontSize: 28,
  },
  badgeTitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    marginBottom: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIconText: {
    fontSize: 20,
    color: Colors.primary,
  },
  menuText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.outlineVariant,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    textAlign: 'center'
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  lockedText: {
    color: Colors.outlineVariant,
  },
});

export default ProfileScreen;
