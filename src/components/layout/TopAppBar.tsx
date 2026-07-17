import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { NotificationBadge } from '../common/NotificationBadge';

interface TopAppBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightPress?: () => void;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  onLeftPress?: () => void;
  rightIconShake?: boolean;
  notificationCount?: number;
  showNewMessageAnimation?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  rightIconShake = false,
  notificationCount = 0,
  showNewMessageAnimation = false,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (rightIconShake) {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ]),
      );
      shake.start();
      return () => shake.stop();
    } else {
      shakeAnim.setValue(0);
    }
  }, [rightIconShake, shakeAnim]);

  useEffect(() => {
    if (showNewMessageAnimation && !hasNewMessage) {
      setHasNewMessage(true);
      // 新消息动画：缩放效果
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 动画结束后重置状态
        setTimeout(() => {
          setHasNewMessage(false);
        }, 1000);
      });
    }
  }, [showNewMessageAnimation, hasNewMessage, scaleAnim]);

  return (
    <BlurView intensity={20} tint="light" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          )}
          {leftIcon && !showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              activeOpacity={0.7}
            >
              <MaterialIcons name={leftIcon} size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.rightSection}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: shakeAnim.interpolate({
                        inputRange: [-8, 8],
                        outputRange: ['-8deg', '8deg'],
                      }),
                    },
                    {
                      scale: scaleAnim,
                    },
                  ],
                }}
              >
                <MaterialIcons
                  name={rightIcon}
                  size={24}
                  color={Colors.primary}
                />
              </Animated.View>
              {rightIcon === 'notifications' && notificationCount > 0 && (
                <NotificationBadge count={notificationCount} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(250, 249, 248, 0.7)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
