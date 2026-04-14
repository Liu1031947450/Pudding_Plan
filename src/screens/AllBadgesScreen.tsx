import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Card } from '../components';
import { badgesApi } from '../api';
import type { Badge } from '../types/domain';

const AllBadgesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    badgesApi.getAll().then(res => {
      if (res.success && res.data) setBadges(res.data);
      setLoading(false);
    });
  }, []);

  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  const renderBadge = (badge: Badge) => (
    <Card
      key={badge.id}
      style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: badge.unlocked
              ? badge.color
              : Colors.surfaceVariant,
          },
        ]}
      >
        <MaterialIcons
          name={badge.icon}
          size={32}
          color={badge.unlocked ? Colors.white : Colors.outlineVariant}
        />
        {!badge.unlocked && (
          <View style={styles.lockOverlay}>
            <MaterialIcons
              name="lock"
              size={14}
              color={Colors.outlineVariant}
            />
          </View>
        )}
      </View>
      <Text style={[styles.badgeTitle, !badge.unlocked && styles.lockedText]}>
        {badge.title}
      </Text>
      <Text
        style={[styles.badgeDesc, !badge.unlocked && styles.lockedText]}
        numberOfLines={2}
      >
        {badge.description}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="全部勋章"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {unlocked.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="emoji-events"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  已解锁 ({unlocked.length})
                </Text>
              </View>
              <View style={styles.grid}>{unlocked.map(renderBadge)}</View>
            </>
          )}
          {locked.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="lock"
                  size={18}
                  color={Colors.outlineVariant}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: Colors.outlineVariant },
                  ]}
                >
                  未解锁 ({locked.length})
                </Text>
              </View>
              <View style={styles.grid}>{locked.map(renderBadge)}</View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.md, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { width: '47%', alignItems: 'center', padding: Spacing.md },
  badgeCardLocked: { opacity: 0.6 },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  badgeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: { color: Colors.outlineVariant },
});

export default AllBadgesScreen;
