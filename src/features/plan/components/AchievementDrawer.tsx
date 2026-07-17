import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import type { Badge } from '../../../types/domain';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface AchievementDrawerProps {
  visible: boolean;
  onClose: () => void;
  badges: Badge[];
  loading?: boolean;
  onBadgePress?: (badge: Badge) => void;
}

export const AchievementDrawer: React.FC<AchievementDrawerProps> = ({
  visible,
  onClose,
  badges,
  loading = false,
  onBadgePress,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>已获成就</Text>
              <Text style={styles.headerSubtitle}>共 {badges.length} 个</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : badges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="emoji-events"
                  size={64}
                  color={Colors.onSurfaceVariant}
                />
                <Text style={styles.emptyText}>暂无成就</Text>
                <Text style={styles.emptySubtext}>完成更多计划解锁成就吧</Text>
              </View>
            ) : (
              <>
                {badges.filter(b => b.unlocked).length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons
                        name="emoji-events"
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.sectionTitle}>
                        已解锁 ({badges.filter(b => b.unlocked).length})
                      </Text>
                    </View>
                    <View style={styles.badgesGrid}>
                      {badges
                        .filter(b => b.unlocked)
                        .map(badge => (
                          <Card
                            key={badge.id}
                            style={styles.badgeCard}
                            onPress={
                              onBadgePress
                                ? () => onBadgePress(badge)
                                : undefined
                            }
                          >
                            <View
                              style={[
                                styles.badgeIcon,
                                { backgroundColor: badge.color },
                              ]}
                            >
                              <MaterialIcons
                                name={badge.icon}
                                size={32}
                                color={Colors.surface}
                              />
                            </View>
                            <Text style={styles.badgeTitle}>{badge.title}</Text>
                            <Text style={styles.badgeDesc}>
                              {badge.description}
                            </Text>
                          </Card>
                        ))}
                    </View>
                  </>
                )}
                {badges.filter(b => !b.unlocked).length > 0 && (
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
                        未解锁 ({badges.filter(b => !b.unlocked).length})
                      </Text>
                    </View>
                    <View style={styles.badgesGrid}>
                      {badges
                        .filter(b => !b.unlocked)
                        .map(badge => (
                          <Card
                            key={badge.id}
                            style={[styles.badgeCard, styles.badgeCardLocked]}
                            onPress={
                              onBadgePress
                                ? () => onBadgePress(badge)
                                : undefined
                            }
                          >
                            <View
                              style={[
                                styles.badgeIcon,
                                { backgroundColor: Colors.surfaceVariant },
                              ]}
                            >
                              <MaterialIcons
                                name={badge.icon}
                                size={32}
                                color={Colors.outlineVariant}
                              />
                              <View style={styles.lockOverlay}>
                                <MaterialIcons
                                  name="lock"
                                  size={14}
                                  color={Colors.outlineVariant}
                                />
                              </View>
                            </View>
                            <Text
                              style={[styles.badgeTitle, styles.lockedText]}
                            >
                              {badge.title}
                            </Text>
                            <Text style={[styles.badgeDesc, styles.lockedText]}>
                              {badge.description}
                            </Text>
                            {badge.target !== undefined &&
                              badge.progress !== undefined && (
                                <View style={styles.progressContainer}>
                                  <View style={styles.progressBarBg}>
                                    <View
                                      style={[
                                        styles.progressBarFill,
                                        { width: `${badge.percentage || 0}%` },
                                      ]}
                                    />
                                  </View>
                                  <Text style={styles.progressText}>
                                    {badge.progress}/{badge.target}
                                  </Text>
                                </View>
                              )}
                          </Card>
                        ))}
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: {
    color: Colors.outlineVariant,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  emptySubtext: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  progressContainer: {
    width: '100%',
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
