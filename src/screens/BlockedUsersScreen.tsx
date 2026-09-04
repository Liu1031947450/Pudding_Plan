import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../components/common/AppText';
import { Avatar, Card, Toast, TopAppBar } from '../components';
import { blocksApi } from '../api';
import type { BlockedUser } from '../types/domain';
import { Colors, FontSize, Spacing } from '../constants/theme';

const BlockedUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [items, setItems] = React.useState<BlockedUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await blocksApi.getAll();
      if (response.success) {
        setItems(response.data || []);
      } else {
        const message = response.error || '黑名单加载失败，请重试';
        setError(message);
        setToast({ visible: true, message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const unblock = async (item: BlockedUser) => {
    const response = await blocksApi.unblock(item.user.userId);
    setToast({
      visible: true,
      message: response.success ? '已移出黑名单' : response.error || '操作失败',
      type: response.success ? 'success' : 'error',
    });
    if (response.success) await load();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="黑名单"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            error ? (
              <TouchableOpacity onPress={load}>
                <Text style={styles.empty}>{error}，点击重试</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.empty}>黑名单为空</Text>
            )
          }
          renderItem={({ item }) => (
            <Card style={styles.card} variant="outlined">
              <Avatar
                uri={item.user.avatar || undefined}
                name={item.user.username}
                size="medium"
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.user.username}</Text>
                <Text style={styles.bio}>{item.user.bio || '暂无简介'}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => unblock(item)}
              >
                <Text style={styles.buttonText}>解除拉黑</Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(value => ({ ...value, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  empty: { marginTop: 80, textAlign: 'center', color: Colors.onSurfaceVariant },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.onSurface },
  bio: { marginTop: 2, fontSize: FontSize.xs, color: Colors.onSurfaceVariant },
  button: { paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  buttonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default BlockedUsersScreen;
