import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts';
import type { Badge } from '../types/domain';

const BadgesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await badgesApi.getAll();
      if (response.success && response.data) {
        setBadges(response.data);
      }
    } catch (error) {
      console.error('获取勋章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const filteredBadges = badges.filter(badge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unlocked') return badge.unlocked;
    if (activeTab === 'locked') return !badge.unlocked;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="我的勋章"
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              全部
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unlocked' && styles.activeTab]}
            onPress={() => setActiveTab('unlocked')}
          >
            <Text style={[styles.tabText, activeTab === 'unlocked' && styles.activeTabText]}>
              已获得
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'locked' && styles.activeTab]}
            onPress={() => setActiveTab('locked')}
          >
            <Text style={[styles.tabText, activeTab === 'locked' && styles.activeTabText]}>
              未获得
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : filteredBadges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {filteredBadges.map(badge => (
              <Card key={badge.id} style={styles.badgeCard}>
                <View style={styles.badgeContent}>
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
                      name={badge.icon as any}
                      size={40}
                      color={Colors.onSurface}
                      style={[{ opacity: badge.unlocked ? 1 : 0.4 }]}
                    />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  {!badge.unlocked && (
                    <Text style={styles.lockedHint}>继续努力，解锁此勋章！</Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="emoji-events"
              size={64}
              color={Colors.outlineVariant}
            />
            <Text style={styles.emptyText}>暂无勋章</Text>
            <Text style={styles.emptySubtext}>完成更多任务，获得更多勋章</Text>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  activeTab: {
    backgroundColor: Colors.primaryContainer,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  activeTabText: {
    color: Colors.onPrimaryContainer,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  badgeContent: {
    alignItems: 'center',
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  badgeTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  badgeDescription: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  lockedHint: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
});

export default BadgesScreen;