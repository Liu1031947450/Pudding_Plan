import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface PlanFormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PlanFormButton: React.FC<PlanFormButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.wrapper, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator color={Colors.onPrimaryContainer} size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryContainer,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    textAlign: 'center',
  },
});
