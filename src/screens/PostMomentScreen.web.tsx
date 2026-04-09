import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card, Button } from '../components';

const PostMomentScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPrivacy, setSelectedPrivacy] = useState('公开');

  const privacyOptions = ['公开', '仅圈子', '私密'];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>发布动态</Text>
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>发布</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👩</Text>
          </View>
          <Text style={styles.userName}>林小布</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="分享你的计划进展或心情..."
            placeholderTextColor={Colors.onSurfaceVariant}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>添加图片</Text>
        <View style={styles.imageGrid}>
          <TouchableOpacity style={styles.addImageButton}>
            <Text style={styles.addImageIcon}>+</Text>
            <Text style={styles.addImageText}>添加图片</Text>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Text style={styles.imageIcon}>📷</Text>
              <TouchableOpacity style={styles.removeImageButton}>
                <Text style={styles.removeImageIcon}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关联计划</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.planTag}>
            <View style={styles.planTagIcon}>
              <Text style={styles.planTagIconText}>🧘</Text>
            </View>
            <Text style={styles.planTagText}>21天正念冥想</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.planTag}>
            <View style={styles.planTagIcon}>
              <Text style={styles.planTagIconText}>💪</Text>
            </View>
            <Text style={styles.planTagText}>60天减脂挑战</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隐私设置</Text>
        <View style={styles.privacyGrid}>
          {privacyOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.privacyOption,
                selectedPrivacy === option && styles.privacyOptionSelected,
              ]}
              onPress={() => setSelectedPrivacy(option)}
            >
              <Text
                style={[
                  styles.privacyOptionText,
                  selectedPrivacy === option && styles.privacyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>发布小贴士</Text>
            <Text style={styles.tipsText}>
              分享真实的进展和感受，与朋友们一起成长
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    width: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  postButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  postButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  inputCard: {
    padding: Spacing.md,
    minHeight: 120,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 32,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  addImageText: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageIcon: {
    fontSize: 48,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageIcon: {
    fontSize: 16,
    color: Colors.surface,
  },
  planTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  planTagIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  planTagIconText: {
    fontSize: 12,
  },
  planTagText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  privacyGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  privacyOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceContainerLow,
  },
  privacyOptionSelected: {
    backgroundColor: Colors.primaryContainer,
  },
  privacyOptionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  privacyOptionTextSelected: {
    color: Colors.onPrimaryContainer,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.tertiaryContainer,
  },
  tipsIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.onTertiaryContainer,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: FontSize.xs,
    color: Colors.onTertiaryContainer,
  },
});

export default PostMomentScreen;
