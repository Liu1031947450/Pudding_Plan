import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { BottomNavBar, TopAppBar, Avatar, Card } from '../components';

interface Badge {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  unlocked: boolean;
}

const mockBadges: Badge[] = [
  { id: '1', title: '早起达人', icon: 'wb-sunny', color: Colors.secondaryContainer, unlocked: true },
  { id: '2', title: '冥想大师', icon: 'self-improvement', color: Colors.tertiaryContainer, unlocked: true },
  { id: '3', title: '书海拾贝', icon: 'menu-book', color: Colors.primaryContainer, unlocked: true },
  { id: '4', title: '运动健将', icon: 'fitness-center', color: Colors.surfaceContainer, unlocked: false },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        leftIcon="settings"
        onLeftPress={handleSettingsPress}
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
              <MaterialIcons name="calendar-today" size={24} color={Colors.primary} />
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
                  <MaterialIcons name="workspace-premium" size={16} color={Colors.onPrimaryContainer} />
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
                  <MaterialIcons name="spa" size={16} color={Colors.onSecondaryContainer} />
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
                    {
                      backgroundColor: badge.color,
                      opacity: badge.unlocked ? 1 : 0.4,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={badge.icon}
                    size={28}
                    color={Colors.onSurface}
                    style={[{ opacity: badge.unlocked ? 1 : 0.4 }]}
                  />
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

            <TouchableOpacity style={styles.menuItem}>
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
