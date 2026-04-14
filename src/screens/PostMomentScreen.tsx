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
import * as Location from 'expo-location';

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

  // Location specific states
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  // Topic specific states
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
        const uploadRes = await circlesApi.uploadImage(uri);
        if (uploadRes.success) {
          uploadedImageUrls.push(uploadRes.data!);
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

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const fetchRealLocation = async () => {
    setIsLocating(true);
    try {
      // 1. 检查定位服务是否开启
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        showToast('定位服务未开启，请在系统设置中打开', 'error');
        setIsLocating(false);
        return;
      }

      // 2. 检查并请求权限
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast('请授予位置权限以查看附近地点', 'error');
        setIsLocating(false);
        return;
      }

      // 3. 优先尝试快速获取上一次的已知位置（瞬间响应）
      let locResult = await Location.getLastKnownPositionAsync({});

      if (!locResult) {
        // 4. 如果没有缓存位置，再发起真实的 GPS 搜索，并增加超时控制
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 8000),
        );

        locResult = (await Promise.race([
          locationPromise,
          timeoutPromise,
        ])) as Location.LocationObject;
      }

      if (locResult) {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: locResult.coords.latitude,
          longitude: locResult.coords.longitude,
        });

        if (address) {
          const city = address.city || address.region || '';
          const district = address.district || '';

          // 根据真实城市动态生成“附近”地点推荐
          const spots = [
            {
              name: `${city} · ${district} (当前位置)`,
              sub: `${address.street || ''}${address.name || ''}`,
              id: 'current',
            },
            {
              name: `${district}中心广场`,
              sub: `${address.street || ''}108号`,
              id: 'p1',
            },
            { name: `${city}市民公园`, sub: '近绿化路', id: 'p2' },
            { name: `${district}创意园区`, sub: '文化路22号', id: 'p3' },
            { name: `星巴克 (${district}店)`, sub: '近地铁站', id: 'p4' },
            { name: `${city}图书馆`, sub: '文渊北路', id: 'p5' },
          ];

          setNearbyLocations(spots);

          // 如果逆地理编码非常完整，直接更新当前位置（可选，这里保持不自动关闭）
          const addrText = `${city}${district}${address.street || ''}`;
          if (addrText) setLocation(addrText);
        }
      }
    } catch (error: any) {
      console.error('获取定位出错:', error);
      if (error.message === 'TIMEOUT') {
        showToast('获取位置超时，请重试', 'error');
      } else {
        showToast('获取位置失败，请检查设置', 'error');
      }
    } finally {
      setIsLocating(false);
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
        const newUris = result.assets.map(asset => asset.uri);
        // 这里可以结合 api 上传，目前我们将本地 uri 加入列表进行预览
        setImages([...images, ...newUris]);
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
      const filteredLocations = allLocations.filter(
        item =>
          item.name.includes(locationSearch) ||
          item.sub.includes(locationSearch),
      );

      return (
        <View style={styles.drawerList}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <MaterialIcons
              name="search"
              size={20}
              color={Colors.onSurfaceVariant}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索地点..."
              placeholderTextColor={Colors.outlineVariant}
              value={locationSearch}
              onChangeText={setLocationSearch}
            />
          </View>

          {/* Special Actions */}
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              setLocation('');
              setDrawerVisible(false);
            }}
          >
            <View style={styles.drawerItemLeft}>
              <MaterialIcons
                name="location-off"
                size={20}
                color={Colors.error}
                style={styles.drawerItemIcon}
              />
              <Text style={[styles.drawerItemText, { color: Colors.error }]}>
                不显示地点
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={fetchRealLocation}
            disabled={isLocating}
          >
            <View style={styles.drawerItemLeft}>
              <MaterialIcons
                name="my-location"
                size={20}
                color={Colors.primary}
                style={styles.drawerItemIcon}
              />
              <Text style={[styles.drawerItemText, { color: Colors.primary }]}>
                {isLocating ? '正在精准定位中...' : '定位当前所在位置'}
              </Text>
            </View>
            {isLocating && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </TouchableOpacity>

          {/* Locations List */}
          <ScrollView
            style={styles.locationListScroll}
            contentContainerStyle={styles.locationListContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Nearby Spots Section */}
            {nearbyLocations.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>附近地点推荐</Text>
                {nearbyLocations.map(loc => (
                  <TouchableOpacity
                    key={loc.id}
                    style={styles.drawerItem}
                    onPress={() => {
                      setLocation(loc.name);
                      setDrawerVisible(false);
                    }}
                  >
                    <View style={styles.drawerItemLeft}>
                      <MaterialIcons
                        name="place"
                        size={20}
                        color={Colors.primary}
                        style={styles.drawerItemIcon}
                      />
                      <View>
                        <Text
                          style={[
                            styles.drawerItemText,
                            location === loc.name && {
                              color: Colors.primary,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {loc.name}
                        </Text>
                        <Text style={styles.drawerItemSubText}>{loc.sub}</Text>
                      </View>
                    </View>
                    {location === loc.name && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 地点列表 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                {nearbyLocations.length > 0 ? '更多地点' : '推荐地点'}
              </Text>
              {filteredLocations.map(loc => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.drawerItem}
                  onPress={() => {
                    setLocation(loc.name);
                    setDrawerVisible(false);
                  }}
                >
                  <View style={styles.drawerItemLeft}>
                    <MaterialIcons
                      name="place"
                      size={20}
                      color={Colors.onSurfaceVariant}
                      style={styles.drawerItemIcon}
                    />
                    <View>
                      <Text style={styles.drawerItemText}>{loc.name}</Text>
                      <Text style={styles.drawerItemSubText}>{loc.sub}</Text>
                    </View>
                  </View>
                  {location === loc.name && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {filteredLocations.length === 0 && (
              <Text style={styles.emptySearch}>未找到相关地点</Text>
            )}
          </ScrollView>
        </View>
      );
    }
    if (drawerType === 'topic') {
      const filteredTopics = allTopics.filter(t => t.includes(topicSearch));
      const hasExactMatch = allTopics.some(t => t === topicSearch);

      return (
        <View style={styles.drawerList}>
          {/* Search/Custom Input Bar */}
          <View style={styles.searchBar}>
            <MaterialIcons name="tag" size={20} color={Colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索或输入新话题..."
              placeholderTextColor={Colors.outlineVariant}
              value={topicSearch}
              onChangeText={setTopicSearch}
              autoFocus
            />
          </View>

          <ScrollView
            style={styles.topicListScroll}
            contentContainerStyle={styles.locationListContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Create New Topic Option */}
            {topicSearch.length > 0 && !hasExactMatch && (
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setTopic(`#${topicSearch}`);
                  setTopicSearch('');
                  setDrawerVisible(false);
                }}
              >
                <View style={styles.drawerItemLeft}>
                  <MaterialIcons
                    name="add-circle-outline"
                    size={20}
                    color={Colors.primary}
                    style={styles.drawerItemIcon}
                  />
                  <Text
                    style={[
                      styles.drawerItemText,
                      { color: Colors.primary, fontWeight: '600' },
                    ]}
                  >
                    创建新话题: #{topicSearch}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* "No Topic" Option */}
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setTopic('');
                setTopicSearch('');
                setDrawerVisible(false);
              }}
            >
              <View style={styles.drawerItemLeft}>
                <MaterialIcons
                  name="label-off"
                  size={20}
                  color={Colors.onSurfaceVariant}
                  style={styles.drawerItemIcon}
                />
                <Text style={styles.drawerItemText}>无话题</Text>
              </View>
            </TouchableOpacity>

            {/* List existing topics */}
            {filteredTopics.map(t => (
              <TouchableOpacity
                key={t}
                style={styles.drawerItem}
                onPress={() => {
                  setTopic(`#${t}`);
                  setTopicSearch('');
                  setDrawerVisible(false);
                }}
              >
                <View style={styles.drawerItemLeft}>
                  <MaterialIcons
                    name="label"
                    size={20}
                    color={
                      topic === `#${t}`
                        ? Colors.primary
                        : Colors.onSurfaceVariant
                    }
                    style={styles.drawerItemIcon}
                  />
                  <Text
                    style={[
                      styles.drawerItemText,
                      topic === `#${t}` && {
                        color: Colors.primary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    #{t}
                  </Text>
                </View>
                {topic === `#${t}` && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }
    if (drawerType === 'visibility') {
      const options = ['公开', '仅好友', '私密'];
      return (
        <View style={styles.drawerList}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.drawerItem}
              onPress={() => {
                setVisibility(opt);
                setDrawerVisible(false);
              }}
            >
              <Text style={styles.drawerItemText}>{opt}</Text>
              {visibility === opt && (
                <MaterialIcons name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
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
