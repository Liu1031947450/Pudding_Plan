import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from '../../../constants/theme';

export interface LocationDrawerContentProps {
  location: string;
  onSelectLocation: (location: string) => void;
  allLocations: any[];
  locationSearch: string;
  onLocationSearchChange: (text: string) => void;
  nearbyLocations: any[];
  isLocating: boolean;
  onFetchRealLocation: () => void;
  onCloseDrawer: () => void;
}

export const LocationDrawerContent: React.FC<LocationDrawerContentProps> = ({
  location,
  onSelectLocation,
  allLocations,
  locationSearch,
  onLocationSearchChange,
  nearbyLocations,
  isLocating,
  onFetchRealLocation,
  onCloseDrawer,
}) => {
  const filteredLocations = allLocations.filter(
    item =>
      (item.name && item.name.includes(locationSearch)) ||
      (item.sub && item.sub.includes(locationSearch)),
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
          onChangeText={onLocationSearchChange}
        />
      </View>

      {/* Special Actions */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          onSelectLocation('');
          onCloseDrawer();
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
        onPress={onFetchRealLocation}
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
                  onSelectLocation(loc.name);
                  onCloseDrawer();
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
                onSelectLocation(loc.name);
                onCloseDrawer();
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
                <MaterialIcons name="check" size={20} color={Colors.primary} />
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
};

export interface TopicDrawerContentProps {
  topic: string;
  onSelectTopic: (topic: string) => void;
  allTopics: string[];
  topicSearch: string;
  onTopicSearchChange: (text: string) => void;
  onCloseDrawer: () => void;
}

export const TopicDrawerContent: React.FC<TopicDrawerContentProps> = ({
  topic,
  onSelectTopic,
  allTopics,
  topicSearch,
  onTopicSearchChange,
  onCloseDrawer,
}) => {
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
          onChangeText={onTopicSearchChange}
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
              onSelectTopic(`#${topicSearch}`);
              onTopicSearchChange('');
              onCloseDrawer();
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
            onSelectTopic('');
            onTopicSearchChange('');
            onCloseDrawer();
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
              onSelectTopic(`#${t}`);
              onTopicSearchChange('');
              onCloseDrawer();
            }}
          >
            <View style={styles.drawerItemLeft}>
              <MaterialIcons
                name="label"
                size={20}
                color={
                  topic === `#${t}` ? Colors.primary : Colors.onSurfaceVariant
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
              <MaterialIcons name="check" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export interface VisibilityDrawerContentProps {
  visibility: string;
  onSelectVisibility: (visibility: string) => void;
  onCloseDrawer: () => void;
}

export const VisibilityDrawerContent: React.FC<
  VisibilityDrawerContentProps
> = ({ visibility, onSelectVisibility, onCloseDrawer }) => {
  const options = ['公开', '仅好友', '私密'];
  return (
    <View style={styles.drawerList}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={styles.drawerItem}
          onPress={() => {
            onSelectVisibility(opt);
            onCloseDrawer();
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
};

const styles = StyleSheet.create({
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
});
