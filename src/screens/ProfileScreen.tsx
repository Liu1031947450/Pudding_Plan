import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { BottomNavBar, TopAppBar, Avatar, Card } from '../components';

interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

const mockBadges: Badge[] = [
  { id: '1', title: '早起达人', icon: '\uE813', color: Colors.secondaryContainer, unlocked: true },
  { id: '2', title: '冥想大师', icon: '\uEAF4', color: Colors.tertiaryContainer, unlocked: true },
  { id: '3', title: '书海拾贝', icon: '\uE431', color: Colors.primaryContainer, unlocked: true },
  { id: '4', title: '运动健将', icon: '\uE3E3', color: Colors.surfaceContainer, unlocked: false },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = React.useState('profile');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="\uE8B8"
        onLeftPress={handleSettingsPress}
        rightIcon="\uE5D4"
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
                uri="https://lh3.googleusercontent.com/aida-public/AB6AXuAKIKxyrX9s0nJefVvjBGd8CSyhpbf9-v4EJyrcIkNMFxfgFQvwGfb-MuYUo-s1RtWbMfIJZf3eR0OMoCXhwL9HvS20JQ3p9C0wxr2afcRx7raAEJnh2TysPvjzILk3vrRyYcZAlEJcqrJCLc9i4mkDOJSXA_iRvV4tZK1Y9DPscuYLSxN1_oYrkozPgdrg9A4VzKMRFdNVMCc8hdnTCVhZXQP0zN1OxWtTwZWa1NqK0QWGuuFW-VToLvMZ0wtrbgySHgiRL1-RIFQI"
                size="xlarge"
              />
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>{'\uE885'}</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>林小布</Text>
            <Text style={styles.userBio}>"在自律中遇见更好的自己"</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Card style={styles.statsCardLarge}>
            <View style={styles.statsCardHeader}>
              <Text style={styles.statsIcon}>{'\uE935'}</Text>
              <View style={styles.statsCardContent}>
                <Text style={styles.statsNumber}>128</Text>
                <Text style={styles.statsLabel}>坚持天数</Text>
              </View>
            </View>
          </Card>

          <View style={styles.statsColumn}>
            <Card style={styles.statsCardSmall}>
              <View style={styles.statsCardRow}>
                <View style={styles.statsIconWrapper}>
                  <Text style={styles.statsSmallIcon}>{'\uE8E8'}</Text>
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>452</Text>
                  <Text style={styles.statsSmallLabel}>累计盖章</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.statsCardSmall}>
              <View style={styles.statsCardRow}>
                <View style={[styles.statsIconWrapper, { backgroundColor: Colors.secondaryContainer }]}>
                  <Text style={styles.statsSmallIcon}>{'\uE3E3'}</Text>
                </View>
                <View>
                  <Text style={styles.statsSmallNumber}>12</Text>
                  <Text style={styles.statsSmallLabel}>治愈计划</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>勋章墙</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>全部</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {mockBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: badge.color, opacity: badge.unlocked ? 1 : 0.4 },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeIconText,
                      { opacity: badge.unlocked ? 1 : 0.4 },
                    ]}
                  >
                    {badge.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.badgeTitle,
                    { opacity: badge.unlocked ? 1 : 0.4 },
                  ]}
                >
                  {badge.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.primary}10` }]}>
                  <Text style={styles.menuIconText}>{'\u{E923}'}</Text>
                </View>
                <Text style={styles.menuText}>打卡记录</Text>
              </View>
              <Text style={styles.menuArrow}>{'\uE5E1'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.secondary}10` }]}>
                  <Text style={styles.menuIconText}>{'\uE87E'}</Text>
                </View>
                <Text style={styles.menuText}>我的收藏</Text>
              </View>
              <Text style={styles.menuArrow}>{'\uE5E1'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.tertiary}10` }]}>
                  <Text style={styles.menuIconText}>{'\uE8FD'}</Text>
                </View>
                <Text style={styles.menuText}>帮助与反馈</Text>
              </View>
              <Text style={styles.menuArrow}>{'\uE5E1'}</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
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
    paddingTop: 72,
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
});

export default ProfileScreen;
