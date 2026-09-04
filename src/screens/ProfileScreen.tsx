import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../components/common/AppText';
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
  Toast,
} from '../components';
import { authApi, badgesApi, feedbackApi } from '../api';
import { useAuth } from '../contexts';
import { FeedbackSheet } from '../features/settings';
import type { Badge } from '../types/domain';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState({
    streakDays: 0,
    totalCheckIns: 0,
    totalBadges: 0,
    healingPlans: 0,
    socialStats: {
      moments: 0,
      likes: 0,
      collects: 0,
      friends: 0,
    },
  });

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoadError('');
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
          socialStats: d.socialStats || prev.socialStats,
        }));
      }
      if (!badgesResponse.success || !statsResponse.success) {
        setLoadError(
          badgesResponse.error || statsResponse.error || '个人数据加载失败',
        );
      }
    } catch {
      setLoadError('个人数据加载失败，请稍后重试');
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
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Avatar
                uri={user?.avatar || undefined}
                name={user?.username}
                size="xlarge"
              />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || '未登录'}</Text>
            <Text style={styles.userBio}>
              {user?.bio || '用布丁装点生活的每一天'}
            </Text>
            <View style={styles.goalTags}>
              {(user?.goalTags || []).map(tag => (
                <Text key={tag} style={styles.goalTag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>

          {!!loadError && (
            <TouchableOpacity onPress={fetchProfileData}>
              <Text style={styles.loadError}>{loadError}，点击重试</Text>
            </TouchableOpacity>
          )}

          <View style={styles.socialStatsRow}>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatNumber}>
                {stats.socialStats.moments}
              </Text>
              <Text style={styles.socialStatLabel}>动态</Text>
            </View>
            <View style={styles.socialStatDivider} />
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatNumber}>
                {stats.socialStats.friends}
              </Text>
              <Text style={styles.socialStatLabel}>关注</Text>
            </View>
            <View style={styles.socialStatDivider} />
            <TouchableOpacity
              style={styles.socialStatItem}
              onPress={() => navigation.navigate('MyCollections' as never)}
            >
              <Text style={styles.socialStatNumber}>
                {stats.socialStats.collects}
              </Text>
              <Text style={styles.socialStatLabel}>收藏</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Card style={styles.statsCardLarge}>
            <View style={styles.statsCardHeader}>
              <MaterialIcons
                name="calendar-today"
                size={24}
                color={Colors.primary}
              />
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
                  <MaterialIcons
                    name="workspace-premium"
                    size={16}
                    color={Colors.onPrimaryContainer}
                  />
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>
                    {stats.totalCheckIns}
                  </Text>
                  <Text style={styles.statsSmallLabel}>累计盖章</Text>
                </View>
              </View>
            </Card>
            <Card style={styles.statsCardSmall}>
              <View style={styles.statsCardRow}>
                <View
                  style={[
                    styles.statsIconWrapper,
                    { backgroundColor: Colors.secondaryContainer },
                  ]}
                >
                  <MaterialIcons
                    name="spa"
                    size={16}
                    color={Colors.onSecondaryContainer}
                  />
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>
                    {stats.healingPlans}
                  </Text>
                  <Text style={styles.statsSmallLabel}>治愈计划</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>勋章墙</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Badges' as never)}
            >
              <Text style={styles.viewAllText}>全部</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : badges.length > 0 ? (
              <>
                {badges
                  .filter(b => b.unlocked)
                  .map(badge => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <View
                        style={[
                          styles.badgeIcon,
                          {
                            backgroundColor: badge.color,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={badge.icon}
                          size={28}
                          color={Colors.white}
                        />
                      </View>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                    </View>
                  ))}
                {badges
                  .filter(b => !b.unlocked)
                  .map(badge => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <View
                        style={[
                          styles.badgeIcon,
                          {
                            backgroundColor: Colors.surfaceVariant,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={badge.icon}
                          size={28}
                          color={Colors.outlineVariant}
                        />
                        <View style={styles.lockOverlay}>
                          <MaterialIcons
                            name="lock"
                            size={10}
                            color={Colors.outlineVariant}
                          />
                        </View>
                      </View>
                      <Text style={[styles.badgeTitle, styles.lockedText]}>
                        {badge.title}
                      </Text>
                    </View>
                  ))}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无徽章</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CheckInRecords' as never)}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${Colors.primary}10` },
                  ]}
                >
                  <MaterialIcons
                    name="event-available"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.menuText}>打卡记录</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={Colors.outlineVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyCollections' as never)}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${Colors.secondary}10` },
                  ]}
                >
                  <MaterialIcons
                    name="favorite"
                    size={20}
                    color={Colors.secondary}
                  />
                </View>
                <Text style={styles.menuText}>我的收藏</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.menuBadgeText}>
                  {stats.socialStats.collects}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={Colors.outlineVariant}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setFeedbackVisible(true)}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${Colors.tertiary}10` },
                  ]}
                >
                  <MaterialIcons
                    name="help-outline"
                    size={20}
                    color={Colors.tertiary}
                  />
                </View>
                <Text style={styles.menuText}>帮助与反馈</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={Colors.outlineVariant}
              />
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
          onSubmit={async (category, content, contact) => {
            const response = await feedbackApi.submit(
              category,
              content,
              contact,
            );
            if (!response.success) {
              setToastMessage(response.error || '反馈提交失败');
              return;
            }
            setFeedbackVisible(false);
            setToastMessage('反馈已提交，感谢你的支持');
          }}
        />
      </BottomDrawer>

      <Toast
        visible={!!toastMessage}
        message={toastMessage}
        onHide={() => setToastMessage('')}
      />

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
    marginTop: 4,
  },
  goalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  goalTag: {
    color: Colors.onPrimaryContainer,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    fontSize: FontSize.xs,
  },
  loadError: {
    color: Colors.error,
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
  },
  socialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    width: '100%',
  },
  socialStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  socialStatNumber: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  socialStatLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  socialStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.3,
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
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
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
    textAlign: 'center',
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
