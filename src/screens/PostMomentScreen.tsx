import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TopAppBar, BottomDrawer, Toast } from '../components';
import { circlesApi } from '../api/circles';
import * as ImagePicker from 'expo-image-picker';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  LocationDrawerContent,
  TopicDrawerContent,
  VisibilityDrawerContent,
} from '../features/circle/components/PostMomentDrawers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostMomentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Feature states
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('');
  const [visibility, setVisibility] = useState('公开');

  // Drawer Search states
  const [locationSearch, setLocationSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [allTopics, setAllTopics] = useState<string[]>([]);

  // Metadata states
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Drawer states
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<
    'location' | 'topic' | 'visibility' | null
  >(null);

  // Geolocation integration
  const { isLocating, nearbyLocations, fetchRealLocation } = useGeolocation();

  // Toast state
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
  ) => {
    setToastConfig({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [topicsRes, locationsRes] = await Promise.all([
        circlesApi.getTrendingTopics(),
        circlesApi.getNearbyLocations(),
      ]);
      if (topicsRes.success) setAllTopics(topicsRes.data || []);
      if (locationsRes.success) setAllLocations(locationsRes.data || []);
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handlePublish = async () => {
    if (!content.trim() && images.length === 0) {
      showToast('写点什么或发张图吧', 'info');
      return;
    }

    setIsPublishing(true);
    try {
      // 1. 上传所有图片
      const uploadedImageUrls: string[] = [];
      for (const uri of images) {
        if (!uri || !uri.trim()) {
          continue;
        }

        const uploadRes = await circlesApi.uploadImage(uri);
        if (uploadRes.success && uploadRes.data) {
          uploadedImageUrls.push(uploadRes.data);
        } else {
          showToast(uploadRes.error || '图片上传失败', 'error');
          return;
        }
      }

      // 2. 调用接口创建动态
      const postRes = await circlesApi.createMoment({
        title,
        content,
        images: uploadedImageUrls,
        imageUri: uploadedImageUrls[0],
        category: topic.replace('#', ''),
        description: content.substring(0, 30),
        type: 'waterfall',
      });

      if (postRes.success) {
        showToast('发布成功！', 'success');
        // 留出时间让用户看到 Toast
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      } else {
        showToast('发布失败: ' + postRes.error, 'error');
      }
    } catch (error) {
      console.error('发布流程出错:', error);
      showToast('由于网络原因发布失败', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFetchRealLocation = async () => {
    const addrText = await fetchRealLocation(showToast);
    if (addrText) {
      setLocation(addrText);
    }
  };

  const handleChooseImage = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('我们需要相册权限来选择图片', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 9 - images.length,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newUris = result.assets
          .map(asset => asset?.uri)
          .filter(
            (uri): uri is string => typeof uri === 'string' && !!uri.trim(),
          );

        if (newUris.length === 0) {
          showToast('未读取到有效图片，请重试', 'error');
          return;
        }

        setImages(prev => [...prev, ...newUris]);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const openDrawer = (type: 'location' | 'topic' | 'visibility') => {
    setDrawerType(type);
    setDrawerVisible(true);
  };

  const renderDrawerContent = () => {
    if (drawerType === 'location') {
      return (
        <LocationDrawerContent
          location={location}
          onSelectLocation={setLocation}
          allLocations={allLocations}
          locationSearch={locationSearch}
          onLocationSearchChange={setLocationSearch}
          nearbyLocations={nearbyLocations}
          isLocating={isLocating}
          onFetchRealLocation={handleFetchRealLocation}
          onCloseDrawer={() => setDrawerVisible(false)}
        />
      );
    }
    if (drawerType === 'topic') {
      return (
        <TopicDrawerContent
          topic={topic}
          onSelectTopic={setTopic}
          allTopics={allTopics}
          topicSearch={topicSearch}
          onTopicSearchChange={setTopicSearch}
          onCloseDrawer={() => setDrawerVisible(false)}
        />
      );
    }
    if (drawerType === 'visibility') {
      return (
        <VisibilityDrawerContent
          visibility={visibility}
          onSelectVisibility={setVisibility}
          onCloseDrawer={() => setDrawerVisible(false)}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="发布动态"
        showBackButton
        onBackPress={handleClose}
        rightIcon="more-horiz"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.titleInput}
          placeholder="给这刻起个标题吧..."
          placeholderTextColor={Colors.outlineVariant}
          value={title}
          onChangeText={setTitle}
          maxLength={40}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="分享此刻的宁静与美好..."
          placeholderTextColor={Colors.outlineVariant}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.imagesSection}>
          <View style={styles.imagesGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }
                >
                  <MaterialIcons name="cancel" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 9 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleChooseImage}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={32}
                      color={Colors.onSurfaceVariant}
                    />
                    <Text style={styles.addImageText}>添加图片</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => openDrawer('location')}
          >
            <MaterialIcons
              name="place"
              size={20}
              color={Colors.onSurfaceVariant}
            />
            <Text style={styles.optionText}>{location || '添加地点'}</Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={Colors.outlineVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => openDrawer('topic')}
          >
            <MaterialIcons
              name="label"
              size={20}
              color={Colors.onSurfaceVariant}
            />
            <Text style={styles.optionText}>{topic || '选择话题'}</Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={Colors.outlineVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => openDrawer('visibility')}
          >
            <MaterialIcons
              name="public"
              size={20}
              color={Colors.onSurfaceVariant}
            />
            <Text style={styles.optionText}>可见范围</Text>
            <Text style={styles.optionValue}>{visibility}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.publishButton,
            !content && images.length === 0 && styles.publishButtonDisabled,
          ]}
          disabled={!content && images.length === 0}
          onPress={handlePublish}
        >
          <Text style={styles.publishButtonText}>发布动态</Text>
        </TouchableOpacity>
      </View>

      <BottomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={
          drawerType === 'location'
            ? '选择地点'
            : drawerType === 'topic'
            ? '选择话题'
            : '可见范围'
        }
        height={
          drawerType === 'location'
            ? '80%'
            : drawerType === 'topic'
            ? '75%'
            : 'auto'
        }
      >
        <View style={styles.drawerContent}>{renderDrawerContent()}</View>
      </BottomDrawer>

      {/* 全屏发布遮罩 */}
      {isPublishing && (
        <View style={styles.publishingOverlay}>
          <View style={styles.publishingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.publishingText}>正在发布精彩时刻...</Text>
          </View>
        </View>
      )}

      {/* 提示通知 */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 150,
  },
  titleInput: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}15`,
  },
  contentInput: {
    fontSize: 18,
    color: Colors.onSurface,
    minHeight: 150,
    marginTop: Spacing.md,
    lineHeight: 28,
  },
  imagesSection: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs / 2, // 使用负边距抵消子项外边距，实现边缘对齐
  },
  imageWrapper: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.xs * 2 - 4) / 3, // 减去间距并留出 4px 冗余
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    margin: Spacing.xs / 2,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  addImageButton: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.xs * 2 - 4) / 3,
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    margin: Spacing.xs / 2,
  },
  addImageText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  optionsSection: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  optionText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  optionValue: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginRight: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: `${Colors.outlineVariant}10`,
  },
  publishButton: {
    height: 56,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  publishButtonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  drawerContent: {
    flex: 1,
    paddingBottom: 20,
  },
  drawerList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  drawerItemText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  drawerItemSubText: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    opacity: 0.7,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerItemIcon: {
    marginRight: Spacing.md,
  },
  locationListScroll: {
    flex: 1,
  },
  topicListScroll: {
    flex: 1,
  },
  locationListContent: {
    paddingBottom: 100,
  },
  emptySearch: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    paddingVertical: Spacing.xl,
    opacity: 0.6,
  },
  sectionContainer: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  publishingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  publishingCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  publishingText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});

export default PostMomentScreen;
