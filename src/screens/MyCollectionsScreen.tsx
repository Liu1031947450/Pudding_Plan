import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBarStyle, Platform, StatusBar } from 'react-native';
import { Colors, Spacing } from '../constants/theme';
import { TopAppBar } from '../components/layout/TopAppBar';
import { CircleWaterfall } from '../features/circle/components/CircleWaterfall';
import { circlesApi } from '../api/circles';
import type { CircleListItem } from '../features/circle/types';

const MyCollectionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [collections, setCollections] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await circlesApi.getAll(); // 后端接口已在内部过滤了收藏状态？
      // 实际上我需要一个专门的获取收藏接口，或者在前端过滤
      // 后端 circles/ 接口目前返回所有动态及其 isCollected 状态
      if (res.success) {
        setCollections(res.data?.filter(item => item.isCollected) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopAppBar
        title="我的收藏"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <CircleWaterfall
          data={collections}
          loading={loading}
          onRefresh={loadCollections}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
});

export default MyCollectionsScreen;
