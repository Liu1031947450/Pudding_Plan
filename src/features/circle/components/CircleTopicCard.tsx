import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { Card } from '../../../components/common/Card';
import type { CircleTopic } from '../types';
import { DEFAULT_TOPIC_BG_COLOR } from '../constants';

interface CircleTopicCardProps {
  circle: CircleTopic;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CircleTopicCard: React.FC<CircleTopicCardProps> = ({
  circle,
  onPress,
  onLongPress,
  style,
}) => {
  return (
    <Card
      style={[
        styles.topicCard,
        { backgroundColor: circle.backgroundColor || DEFAULT_TOPIC_BG_COLOR },
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicTagContainer}>
          <Text style={styles.topicTagText}>
            {circle.topicTag || '精选话题'}
          </Text>
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
              style={[
                styles.miniAvatar,
                index > 0 && styles.miniAvatarWithMargin,
              ]}
            />
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
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
  miniAvatarWithMargin: {
    marginLeft: -10,
  },
});
