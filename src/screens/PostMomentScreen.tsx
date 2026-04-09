import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, Chip } from '../components';

const PostMomentScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="发布动态"
        showBackButton
        onBackPress={handleClose}
        rightIcon="send"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日打卡成就</Text>
          <View style={styles.chipsContainer}>
            <Chip
              label="饮水达标"
              icon="local-drink"
              variant="secondary"
              size="small"
            />
            <Chip
              label="冥想 45min"
              icon="self-improvement"
              variant="tertiary"
              size="small"
            />
            <Chip label="早起" icon="wb-sunny" variant="surface" size="small" />
            <TouchableOpacity style={styles.addChip}>
              <Text style={styles.addChipIcon}>{'\uE145'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="今日心语：分享这一刻的宁静..."
              placeholderTextColor={Colors.outlineVariant}
              multiline
              numberOfLines={8}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>记录瞬间 (可选)</Text>
          <View style={styles.imagesGrid}>
            <TouchableOpacity style={styles.addImageButton}>
              <Text style={styles.addImageIcon}>{'\uE412'}</Text>
            </TouchableOpacity>
            <View style={styles.imagePlaceholder} />
            <View style={styles.imagePlaceholder} />
          </View>
        </View>

        <View style={styles.tagsSection}>
          <TouchableOpacity style={styles.tagButton}>
            <Text style={styles.tagIcon}>{'\uE574'}</Text>
            <Text style={styles.tagText}>所有人可见</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tagButton}>
            <Text style={styles.tagIcon}>{'\uE8F4'}</Text>
            <Text style={styles.tagText}>添加话题</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tagButton}>
            <Text style={styles.tagIcon}>{'\uE8F5'}</Text>
            <Text style={styles.tagText}>添加地点</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingIcon}>{'\uE2C6'}</Text>
      </TouchableOpacity>

      <View style={styles.decorations}>
        <View style={styles.decorBlob1} />
        <View style={styles.decorBlob2} />
      </View>
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
    paddingTop: 80,
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  addChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChipIcon: {
    fontSize: 16,
    color: Colors.outline,
  },
  inputCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 180,
  },
  input: {
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    lineHeight: 28,
    textAlignVertical: 'top',
    minHeight: 160,
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addImageButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${Colors.outlineVariant}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 32,
    color: Colors.onSurfaceVariant,
  },
  imagePlaceholder: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: `${Colors.surfaceContainerLow}50`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}10`,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}10`,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tagIcon: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.xs,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingIcon: {
    fontSize: 24,
    color: Colors.onPrimary,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorBlob1: {
    position: 'absolute',
    top: '20%',
    left: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${Colors.primaryContainer}10`,
  },
  decorBlob2: {
    position: 'absolute',
    bottom: '10%',
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${Colors.secondaryContainer}20`,
  },
});

export default PostMomentScreen;
