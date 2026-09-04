import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const useNativeDriver = Platform.OS !== 'web';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dotAnim1 = useRef(new Animated.Value(0.2)).current;
  const dotAnim2 = useRef(new Animated.Value(0.4)).current;
  const dotAnim3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver,
      }),
    ]).start();

    // Loading dots animation
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim1, {
          toValue: 1,
          duration: 400,
          useNativeDriver,
        }),
        Animated.timing(dotAnim2, {
          toValue: 1,
          duration: 400,
          useNativeDriver,
        }),
        Animated.timing(dotAnim3, {
          toValue: 1,
          duration: 400,
          useNativeDriver,
        }),
        Animated.timing(dotAnim1, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver,
        }),
        Animated.timing(dotAnim2, {
          toValue: 0.4,
          duration: 400,
          useNativeDriver,
        }),
        Animated.timing(dotAnim3, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver,
        }),
      ]),
    );
    dotAnimation.start();

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver,
      }).start();
    }, 3000);
    const finishTimer = setTimeout(onFinish, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
      dotAnimation.stop();
    };
  }, [
    fadeAnim,
    scaleAnim,
    dotAnim1,
    dotAnim2,
    dotAnim3,
    onFinish,
    useNativeDriver,
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          `${Colors.primaryContainer}33`,
          Colors.background,
          `${Colors.secondaryContainer}1A`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.topSpacer} />

        <View style={styles.centerContent}>
          <View style={styles.characterWrapper}>
            <View style={styles.glowBackground} />

            <View style={styles.puddingContainer}>
              <View style={styles.puddingBody}>
                <View style={styles.caramelTop} />

                <View style={styles.face}>
                  <View style={styles.eyes}>
                    <View style={styles.eye} />
                    <View style={styles.eye} />
                  </View>
                  <View style={styles.mouth} />
                </View>
              </View>

              <View style={styles.stampBadge}>
                <MaterialIcons
                  name="verified"
                  size={32}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>

          <View style={styles.brandSection}>
            <Text style={styles.brandTitle}>PuddingPlan</Text>
            <View style={styles.brandUnderline}>
              <View style={styles.underlineLong} />
              <View style={styles.underlineShort} />
            </View>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.tagline}>让成长，像布丁一样轻盈自愈</Text>

          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.decorBlob1} />
      <View style={styles.decorBlob2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 448,
    paddingVertical: 80,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSpacer: {
    height: 4,
  },
  centerContent: {
    alignItems: 'center',
    gap: 40,
  },
  characterWrapper: {
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    backgroundColor: `${Colors.primaryContainer}4D`,
    borderRadius: 9999,
    opacity: 0.3,
  },
  puddingContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  puddingBody: {
    width: 192,
    height: 160,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 96,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 110,
    borderBottomWidth: 8,
    borderBottomColor: `${Colors.primaryDim}1A`,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  caramelTop: {
    position: 'absolute',
    top: 0,
    width: '85%',
    height: 40,
    backgroundColor: '#8b6e0033',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  face: {
    alignItems: 'center',
    gap: 8,
  },
  eyes: {
    flexDirection: 'row',
    gap: 32,
  },
  eye: {
    width: 12,
    height: 12,
    backgroundColor: Colors.onPrimaryContainer,
    borderRadius: 6,
  },
  mouth: {
    width: 24,
    height: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.onPrimaryContainer,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  stampBadge: {
    position: 'absolute',
    bottom: -24,
    right: -16,
    width: 64,
    height: 64,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: Colors.primaryContainer,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  brandUnderline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  underlineLong: {
    width: 32,
    height: 4,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 2,
  },
  underlineShort: {
    width: 8,
    height: 4,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 2,
  },
  bottomContent: {
    alignItems: 'center',
    gap: 24,
  },
  tagline: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    letterSpacing: 3.2,
    opacity: 0.8,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  decorBlob1: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 256,
    height: 256,
    backgroundColor: `${Colors.secondaryContainer}4D`,
    borderRadius: 128,
  },
  decorBlob2: {
    position: 'absolute',
    bottom: '25%',
    right: -40,
    width: 192,
    height: 192,
    backgroundColor: `${Colors.tertiaryContainer}33`,
    borderRadius: 96,
  },
});

export default SplashScreen;
