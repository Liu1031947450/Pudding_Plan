import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { BottomNavBar, TopAppBar, Card, Avatar } from '../components';

interface Buddy {
  id: string;
  name: string;
  goal: string;
  avatarUri?: string;
}

interface Circle {
  id: string;
  title: string;
  members: string;
  type: 'large' | 'small' | 'medium';
  imageUri?: string;
  category?: string;
}

const mockBuddies: Buddy[] = [
  {
    id: '1',
    name: 'Elena R.',
    goal: '目标：晨间瑜伽',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCzHNNTMZyepnzwLaDqIvgso4V35x1bl2_TDeiuDwej1bQKqOI6IUYakhakF_Jmc71ldFcX5WyVt-DLNaDhrDPP2WBGk7w7y1DVcry-meJRs24T0xuR3cd5-zJDS7tw-RQgpWDzifTvotOKXjwGG_12z3E8z8OIbV2Ik62j_1P-ZSSu4Y0QTmz3uoNTcx8ydIjz4EsAN5IAcGZo7wMdMeR0QEUcYVpS303iWx-9_xuehFs70T6196mLsS_cFKecNanVEVKFJC3Zf-6',
  },
  {
    id: '2',
    name: 'Marcus K.',
    goal: '目标：数字排毒',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLHmFkwx_27vL1dDGAI87sjjG_ZBPNZeAGazhUc78yBFn6QsytuyOYOLkKVVJBSzcfVFw6Azbc1y9EYYGw5zS2YENRpGlCb68a1HbCujAcmJ273s-GaVYhKvn69hPYJ_3ouEhyxbfxPDs3qnkn2zIZPjJ4txEc6mlLwgU30kCqo_KzbF2NHnXRrSm85_BfH1Y8Nwk6mm6nFivSxVC1uithNi8OqSrD0Myr5HnRYL0OoOe_wf59dTI7E_wXm3nRWRieefXIKCSG7SUJ',
  },
];

const mockCircles: Circle[] = [
  {
    id: '1',
    title: '晨读小组',
    members: '1.2k 位成员正在安静共读',
    type: 'large',
    category: '热门',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7e1EPbLFG18ZXQnqUlFa8dlguceJHlALBrnE12J49MYJcPB-bghS8lMTYRJY_retjM1ZUQDR_QAbiO1z241ph2TDLqQXPRgFjve2dYUXd_4HOO8ynn7Zoz3pgZlMNfP7-0lhcKvV5RHzS6bxFFqvQQUPt3M67_jzwIEtuVurEo92R5BHOS0Q0SD_2h3mcz0GVCSZgpUnk7Ar5qpOOW6eVRzeVBeINW6E5DWKe78MQnVxkbHZTLxs-2tKYtpzd4ELRY0wTOd-Ytad2',
  },
  {
    id: '2',
    title: '静心手工',
    members: '加入',
    type: 'small',
  },
  {
    id: '3',
    title: '深呼吸',
    members: '加入',
    type: 'small',
  },
  {
    id: '4',
    title: '睡前放松',
    members: '在休息前分享感恩时刻',
    type: 'medium',
  },
];

const CirclesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar leftIcon="spa" title="PuddingPlan" rightIcon="notifications" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.26, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>社交净土</Text>
            <Text style={styles.heroSubtitle}>
              在他人陪伴下寻找你的从容节奏。没有压力，只有共在。
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>找个搭子</Text>
              <Text style={styles.sectionSubtitle}>连接志同道合的成长伙伴</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buddiesGrid}>
            {mockBuddies.map((buddy, index) => (
              <Card
                key={buddy.id}
                style={[
                  styles.buddyCard,
                  index === 1 && styles.buddyCardOffset,
                ]}
              >
                <Avatar
                  uri={buddy.avatarUri}
                  name={buddy.name}
                  size="large"
                  style={styles.buddyAvatar}
                />
                <Text style={styles.buddyName}>{buddy.name}</Text>
                <Text style={styles.buddyGoal}>{buddy.goal}</Text>
                <TouchableOpacity
                  style={[
                    styles.buddyButton,
                    index === 0
                      ? styles.buddyButtonPrimary
                      : styles.buddyButtonSecondary,
                  ]}
                >
                  <Text
                    style={[
                      styles.buddyButtonText,
                      index === 0
                        ? styles.buddyButtonTextPrimary
                        : styles.buddyButtonTextSecondary,
                    ]}
                  >
                    {index === 0 ? '打个招呼' : '发个鼓励'}
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>加入圈子</Text>
              <Text style={styles.sectionSubtitle}>静心独处的共享空间</Text>
            </View>
          </View>

          <View style={styles.circlesGrid}>
            <Card
              style={[styles.circleCard, styles.circleCardLarge]}
            >
              <View style={styles.circleImageContainer}>
                <Image
                  source={{ uri: mockCircles[0].imageUri }}
                  style={styles.circleImage}
                  resizeMode="cover"
                />
                <View style={styles.circleImageOverlay} />
                <View style={styles.circleContent}>
                  <View style={styles.circleTag}>
                    <Text style={styles.circleTagText}>
                      {mockCircles[0].category}
                    </Text>
                  </View>
                  <Text style={styles.circleTitleLarge}>
                    {mockCircles[0].title}
                  </Text>
                  <Text style={styles.circleMembers}>{mockCircles[0].members}</Text>
                </View>
              </View>
            </Card>

            <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
              {mockCircles.slice(1, 3).map(circle => (
                <Card
                  key={circle.id}
                  style={[styles.circleCard, styles.circleCardSmall]}
                >
                  <View style={styles.smallCircleContent}>
                    <MaterialIcons
                      name={circle.id === '2' ? 'palette' : 'self-improvement'}
                      size={32}
                      color={Colors.primary}
                    />
                    <Text style={styles.smallCircleTitle}>{circle.title}</Text>
                    <View style={styles.smallCircleArrow}>
                      <Text style={styles.arrowText}>加入</Text>
                      <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            {mockCircles.slice(3).map(circle => (
              <Card
                key={circle.id}
                style={[styles.circleCard, styles.circleCardMedium]}
              >
                <View style={styles.mediumCircleContent}>
                  <View style={styles.mediumCircleAvatars}>
                    <Avatar
                      name="User 1"
                      size="small"
                      style={styles.miniAvatar}
                    />
                    <Avatar
                      name="User 2"
                      size="small"
                      style={styles.miniAvatarOffset}
                    />
                    <View style={[styles.miniAvatar, styles.moreAvatar]}>
                      <Text style={styles.moreAvatarText}>+42</Text>
                    </View>
                  </View>
                  <View style={styles.mediumCircleInfo}>
                    <Text style={styles.mediumCircleTitle}>
                      {circle.title}
                    </Text>
                    <Text style={styles.mediumCircleMembers}>
                      {circle.members}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Card style={styles.encouragementCard}>
            <View style={styles.encouragementHeader}>
              <View style={styles.encouragementIcon}>
                <MaterialIcons name="favorite" size={20} color={Colors.onPrimaryContainer} />
              </View>
              <View>
                <Text style={styles.encouragementTitle}>最近的鼓励</Text>
                <Text style={styles.encouragementSubtitle}>
                  来自圈子的一点阳光
                </Text>
              </View>
            </View>

            <View style={styles.encouragementList}>
              <View style={styles.encouragementItem}>
                <Text style={styles.encouragementText}>
                  <Text style={styles.encouragementBold}>Sarah</Text> 给了你一个
                  温柔提醒
                </Text>
                <Text style={styles.encouragementTime}>2分钟前</Text>
              </View>
              <View style={styles.encouragementItem}>
                <Text style={styles.encouragementText}>
                  <Text style={styles.encouragementBold}>Theo</Text>{' '}
                  为你的"晨起饮水"喝彩
                </Text>
                <Text style={styles.encouragementTime}>1小时前</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <BottomNavBar />
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
    paddingBottom: 140,
  },
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  buddiesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  buddyCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  buddyCardOffset: {
    marginTop: 32,
  },
  buddyAvatar: {
    marginBottom: Spacing.sm,
  },
  buddyName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  buddyGoal: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  buddyButton: {
    width: '100%',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  buddyButtonPrimary: {
    backgroundColor: Colors.primaryContainer,
  },
  buddyButtonSecondary: {
    backgroundColor: Colors.secondaryContainer,
  },
  buddyButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  buddyButtonTextPrimary: {
    color: Colors.onPrimaryContainer,
  },
  buddyButtonTextSecondary: {
    color: Colors.onSecondaryContainer,
  },
  circlesGrid: {
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  circleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  circleCardLarge: {
    width: '100%',
    height: 192,
  },
  circleCardMedium: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  circleCardSmall: {
    width: '48%',
    minWidth: 140,
  },
  circleImageContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  circleImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  circleContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  circleTag: {
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  circleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onTertiaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  circleTitleLarge: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.surfaceContainerLowest,
    marginBottom: 2,
  },
  circleMembers: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  smallCircleContent: {
    padding: Spacing.md,
  },
  smallCircleIcon: {
    fontSize: 24,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  smallCircleTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  smallCircleArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  mediumCircleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
  },
  mediumCircleAvatars: {
    flexDirection: 'row',
  },
  miniAvatar: {
    marginLeft: -8,
  },
  miniAvatarOffset: {
    marginLeft: -8,
  },
  moreAvatar: {
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreAvatarText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  mediumCircleInfo: {},
  mediumCircleTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  mediumCircleMembers: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  encouragementCard: {
    padding: Spacing.md,
    backgroundColor: `${Colors.primaryContainer}10`,
    borderWidth: 1,
    borderColor: `${Colors.primaryContainer}20`,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  encouragementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  encouragementIconText: {
    fontSize: 20,
    color: Colors.onPrimaryContainer,
  },
  encouragementTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  encouragementSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
  },
  encouragementList: {},
  encouragementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}10`,
  },
  encouragementText: {
    fontSize: FontSize.sm,
    color: Colors.onSurface,
    flex: 1,
  },
  encouragementBold: {
    fontWeight: '700',
  },
  encouragementTime: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
});

export default CirclesScreen;
