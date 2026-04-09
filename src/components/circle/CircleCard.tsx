import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import type { Circle } from '../../types/domain';

interface CircleCardProps {
  circle: Circle;
  onPress?: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({
  circle,
  onPress,
}) => {
  if (circle.type === 'large') {
    return (
      <Card style={[styles.circleCard, styles.circleCardLarge]} onPress={onPress}>
        <View style={styles.circleImageContainer}>
          {circle.imageUri && (
            <>
              <Image
                source={{ uri: circle.imageUri }}
                style={styles.circleImage}
                resizeMode="cover"
              />
              <View style={styles.circleImageOverlay} />
            </>
          )}
          <View style={styles.circleContent}>
            {circle.category && (
              <View style={styles.circleTag}>
                <Text style={styles.circleTagText}>{circle.category}</Text>
              </View>
            )}
            <Text style={styles.circleTitleLarge}>{circle.title}</Text>
            <Text style={styles.circleMembers}>{circle.members}</Text>
          </View>
        </View>
      </Card>
    );
  }

  if (circle.type === 'small') {
    return (
      <Card style={[styles.circleCard, styles.circleCardSmall]} onPress={onPress}>
        <View style={styles.smallCircleContent}>
          <MaterialIcons
            name={circle.id === '2' ? 'palette' : 'self-improvement'}
            size={32}
            color={Colors.primary}
          />
          <Text style={styles.smallCircleTitle}>{circle.title}</Text>
          <View style={styles.smallCircleArrow}>
            <Text style={styles.arrowText}>加入</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </View>
      </Card>
    );
  }

  // medium type
  return (
    <Card style={[styles.circleCard, styles.circleCardMedium]} onPress={onPress}>
      <View style={styles.mediumCircleContent}>
        <View style={styles.mediumCircleAvatars}>
          <Avatar name="User 1" size="small" style={styles.miniAvatar} />
          <Avatar name="User 2" size="small" style={styles.miniAvatarOffset} />
          <View style={[styles.miniAvatar, styles.moreAvatar]}>
            <Text style={styles.moreAvatarText}>+42</Text>
          </View>
        </View>
        <View style={styles.mediumCircleInfo}>
          <Text style={styles.mediumCircleTitle}>{circle.title}</Text>
          <Text style={styles.mediumCircleMembers}>{circle.members}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  circleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  circleCardLarge: {
    height: 240,
    marginBottom: Spacing.md,
  },
  circleCardSmall: {
    flex: 1,
    height: 160,
  },
  circleCardMedium: {
    height: 100,
    marginBottom: Spacing.md,
  },
  circleImageContainer: {
    flex: 1,
    position: 'relative',
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  circleImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  circleContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  circleTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  circleTagText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
  },
  circleTitleLarge: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: 4,
  },
  circleMembers: {
    fontSize: FontSize.sm,
    color: Colors.surface,
    opacity: 0.9,
  },
  smallCircleContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  smallCircleTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  smallCircleArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  mediumCircleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  mediumCircleAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  miniAvatarOffset: {
    marginLeft: -8,
  },
  moreAvatar: {
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreAvatarText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
  },
  mediumCircleInfo: {
    flex: 1,
  },
  mediumCircleTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  mediumCircleMembers: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
});
