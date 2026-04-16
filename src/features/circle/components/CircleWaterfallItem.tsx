import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import { getImageUrl } from '../../../utils';
import type { CircleMoment } from '../types';

interface CircleWaterfallItemProps {
  circle: CircleMoment;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CircleWaterfallItem: React.FC<CircleWaterfallItemProps> = ({
  circle,
  onPress,
  onLongPress,
  style,
}) => {
  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {circle.imageUri && (
        <Image
          source={{ uri: getImageUrl(circle.imageUri) }}
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
              <Image
                source={{ uri: getImageUrl(circle.authorAvatarUri) }}
                style={styles.authorAvatar}
              />
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
    height: 180,
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
});
