import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../components/common/AppText';
import { Avatar, Card, Toast, TopAppBar } from '../components';
import { buddiesApi } from '../api';
import type { Buddy, BuddyRelationship } from '../types/domain';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface BuddyData {
  incoming: BuddyRelationship[];
  outgoing: BuddyRelationship[];
  buddies: BuddyRelationship[];
}

const EMPTY_DATA: BuddyData = { incoming: [], outgoing: [], buddies: [] };

const Action = ({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity style={styles.action} onPress={onPress}>
    <Text style={[styles.actionText, danger && styles.dangerText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const BuddyCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [data, setData] = React.useState<BuddyData>(EMPTY_DATA);
  const [recommendations, setRecommendations] = React.useState<Buddy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ visible: false, message: '' });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [requests, recommended] = await Promise.all([
        buddiesApi.getRequests(),
        buddiesApi.getRecommendations(),
      ]);
      if (requests.success) setData(requests.data || EMPTY_DATA);
      if (recommended.success) setRecommendations(recommended.data || []);
      if (!requests.success || !recommended.success) {
        setError(
          requests.error || recommended.error || '搭子信息加载失败，请重试',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (
    action: () => Promise<{
      success: boolean;
      error?: string;
      message?: string;
    }>,
    successMessage: string,
  ) => {
    const response = await action();
    setToast({
      visible: true,
      message: response.success
        ? response.message || successMessage
        : response.error || '操作失败',
    });
    if (response.success) await loadData();
  };

  const renderRelationship = (
    relationship: BuddyRelationship,
    actions: React.ReactNode,
  ) => (
    <Card key={relationship.id} style={styles.card} variant="outlined">
      <View style={styles.personRow}>
        <Avatar
          uri={relationship.user.avatar || undefined}
          name={relationship.user.username}
          size="medium"
        />
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{relationship.user.username}</Text>
          <Text style={styles.personBio} numberOfLines={2}>
            {relationship.user.bio || '一起完成今天的小目标'}
          </Text>
          <Text style={styles.tags}>
            {relationship.user.goalTags.join(' · ')}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>{actions}</View>
    </Card>
  );

  const section = (title: string, content: React.ReactNode, empty: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content || <Text style={styles.emptyText}>{empty}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="搭子中心"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {loading && data === EMPTY_DATA ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error && data === EMPTY_DATA && recommendations.length === 0 ? (
        <View style={styles.loading}>
          <Text style={styles.emptyText}>{error}</Text>
          <Action label="重新加载" onPress={loadData} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
        >
          {!!error && (
            <TouchableOpacity style={styles.errorBanner} onPress={loadData}>
              <Text style={styles.errorText}>{error}，点击重试</Text>
            </TouchableOpacity>
          )}
          {section(
            '为你推荐',
            recommendations.length ? (
              <View style={styles.list}>
                {recommendations.map(buddy => (
                  <Card key={buddy.id} style={styles.card} variant="outlined">
                    <View style={styles.personRow}>
                      <Avatar
                        uri={buddy.avatarUri}
                        name={buddy.name}
                        size="medium"
                      />
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{buddy.name}</Text>
                        <Text style={styles.personBio}>{buddy.goal}</Text>
                        <Text style={styles.tags}>
                          {(buddy.goalTags || []).join(' · ')}
                          {buddy.matchCount
                            ? ` · ${buddy.matchCount} 个共同目标`
                            : ''}
                        </Text>
                      </View>
                      <Action
                        label="申请搭子"
                        onPress={() =>
                          runAction(
                            () => buddiesApi.request(buddy.id),
                            '搭子请求已发送',
                          )
                        }
                      />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null,
            '暂无新的推荐',
          )}

          {section(
            '收到的请求',
            data.incoming.length ? (
              <View style={styles.list}>
                {data.incoming.map(item =>
                  renderRelationship(
                    item,
                    <>
                      <Action
                        label="接受"
                        onPress={() =>
                          runAction(
                            () => buddiesApi.accept(item.id),
                            '已成为搭子',
                          )
                        }
                      />
                      <Action
                        label="拒绝"
                        danger
                        onPress={() =>
                          runAction(
                            () => buddiesApi.reject(item.id),
                            '已拒绝请求',
                          )
                        }
                      />
                    </>,
                  ),
                )}
              </View>
            ) : null,
            '暂无待处理请求',
          )}

          {section(
            '发出的请求',
            data.outgoing.length ? (
              <View style={styles.list}>
                {data.outgoing.map(item =>
                  renderRelationship(
                    item,
                    <Action
                      label="取消请求"
                      danger
                      onPress={() =>
                        runAction(
                          () => buddiesApi.cancel(item.id),
                          '请求已取消',
                        )
                      }
                    />,
                  ),
                )}
              </View>
            ) : null,
            '暂无发出的请求',
          )}

          {section(
            '我的搭子',
            data.buddies.length ? (
              <View style={styles.list}>
                {data.buddies.map(item =>
                  renderRelationship(
                    item,
                    <>
                      <Action
                        label="送鼓励"
                        onPress={() =>
                          runAction(
                            () => buddiesApi.encourage(item.id),
                            '鼓励已送达',
                          )
                        }
                      />
                      <Action
                        label="解除"
                        danger
                        onPress={() =>
                          runAction(
                            () => buddiesApi.remove(item.id),
                            '搭子关系已解除',
                          )
                        }
                      />
                    </>,
                  ),
                )}
              </View>
            ) : null,
            '还没有成长搭子',
          )}
        </ScrollView>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast(value => ({ ...value, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  list: { gap: Spacing.sm },
  card: { padding: Spacing.md },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  personInfo: { flex: 1 },
  personName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  personBio: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  tags: { marginTop: 4, fontSize: FontSize.xs, color: Colors.primary },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  action: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  dangerText: { color: Colors.error },
  emptyText: { color: Colors.onSurfaceVariant, paddingVertical: Spacing.sm },
  errorBanner: {
    backgroundColor: Colors.errorContainer,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.onErrorContainer, textAlign: 'center' },
});

export default BuddyCenterScreen;
