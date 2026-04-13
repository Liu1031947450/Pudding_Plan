import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { Avatar } from '../../../components/common/Avatar';
import type { Circle } from '../../../types/domain';
import { Chip } from '../../../components/common/Chip';

interface CircleWaterfallItemProps {
  circle: Circle;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CircleWaterfallItem: React.FC<CircleWaterfallItemProps> = ({
  circle,
  onPress,
  style,
}) => {
  if (circle.type === 'topic') {
    return (
      <Card
        style={[styles.topicCard, { backgroundColor: circle.backgroundColor || '#DEF9CE' }, style]}
        onPress={onPress}
      >
        <View style={styles.topicHeader}>
          <View style={styles.topicTagContainer}>
            <Text style={styles.topicTagText}>{circle.topicTag || '精选话题'}</Text>
          </View>
        </View>
        <Text style={styles.topicTitle} numberOfLines={4}>
          {circle.title}
        </Text>
        <Text style={styles.topicDescription}>{circle.description}</Text>
        <View style={styles.topicFooter}>
          <View style={styles.avatarStack}>
            {circle.participantsAvatars?.slice(0, 3).map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={[styles.miniAvatar, { marginLeft: index > 0 ? -10 : 0 }]}
              />
            ))}
          </View>
        </View>
      </Card>
    );
  }

  // Determine random height for image if not provided, or use a consistent set based on index
  // For mock purpose, we'll just use the natural image or a container with flex
  return (
    <Card style={[styles.card, style]} onPress={onPress}>
      {circle.imageUri && (
        <Image
          source={{ uri: circle.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {circle.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {circle.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.author}>
            {circle.authorAvatarUri && (
              <Image source={{ uri: circle.authorAvatarUri }} style={styles.authorAvatar} />
            )}
            <Text style={styles.authorName}>{circle.authorName}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  image: {
    width: '100%',
    height: 180, // Default height, can be varied in parent
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
  },
  authorName: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  // Topic Card Styles
  topicCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  topicHeader: {
    marginBottom: Spacing.md,
  },
  topicTagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicTagText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#2D4B2D',
  },
  topicTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#2D4B2D',
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  topicDescription: {
    fontSize: FontSize.xs,
    color: '#4A6B4A',
    marginBottom: Spacing.lg,
  },
  topicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEF9CE',
  },
});
