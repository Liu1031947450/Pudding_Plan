import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AppText as Text } from '../../../components/common/AppText';
import { Colors, Spacing, FontSize } from '../../../constants/theme';

interface LegalDocSheetProps {
  title: string;
}

export const LegalDocSheet: React.FC<LegalDocSheetProps> = ({ title }) => {
  const content =
    title === '隐私政策'
      ? [
          [
            '适用范围',
            '布丁计划 1.0.0 是本地全栈演示产品。账号、计划、习惯、打卡、互动和设置数据保存在你配置的本地 PostgreSQL 数据库中，上传图片保存在本地服务端磁盘。',
          ],
          [
            '我们处理的数据',
            '为提供功能，应用会处理手机号、昵称、头像、目标标签、计划与习惯、打卡日记、社区动态与评论、关注与搭子关系、举报和通知记录。定位仅在你主动授权并选择获取位置时使用，也可以完全改为手工输入。',
          ],
          [
            '图片、定位与通知',
            '头像和动态图片会上传到本地服务；删除动态、清除数据或注销账号时会同步清理对应文件。移动端系统提醒需获得通知权限，Web 演示端不会伪造系统通知。',
          ],
          [
            '社区与内容治理',
            '动态可设置为公开、仅搭子或仅自己。举报后相关内容会立即对举报者隐藏；拉黑后双方内容互相不可见，并解除关注与搭子关系。',
          ],
          [
            '你的权利',
            '你可以修改资料和密码、删除自己的动态与评论、清除业务数据，或在设置中彻底注销账号。注销会永久删除账号及其关联数据，无法恢复。',
          ],
          [
            '联系与更新',
            '如有隐私问题，请联系 lhy1031947450@163.com。政策更新会在应用内文档中标明日期。',
          ],
        ]
      : [
          [
            '服务说明',
            '布丁计划提供计划、习惯、打卡、日历、社区、关注和成长搭子等本地演示功能。AI、会员、支付、小组件和公开线上服务不属于 1.0.0 已交付能力。',
          ],
          [
            '账号责任',
            '请使用本人可管理的手机号注册，并妥善保管密码。不得冒用他人身份、攻击服务、绕过权限或上传违法及侵权内容。',
          ],
          [
            '内容规则',
            '你对发布的动态、评论和图片负责。不得发布垃圾信息、骚扰、不适宜或侵犯他人权益的内容；被举报内容可通过维护脚本审查、驳回或删除。',
          ],
          [
            '数据与权限',
            '应用只按你选择的可见性展示社区内容，并在关注、搭子、收藏、通知等入口执行同一权限规则。定位、相册和通知权限均可拒绝，相关功能会相应不可用。',
          ],
          [
            '删除与终止',
            '你可以删除自己的内容、清除业务数据或彻底注销账号。为保护其他用户和数据一致性，违规内容可能被删除，拉黑后双方无法继续互动。',
          ],
          [
            '免责声明与联系',
            '本项目用于本地演示，不承诺云端高可用、第三方审核、Android 真机或应用商店适配。问题与建议请发送至 lhy1031947450@163.com。',
          ],
        ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.lastUpdate}>最后更新：2026年9月4日</Text>
      <View style={styles.divider} />
      {content.map(([heading, paragraph]) => (
        <View key={heading} style={styles.section}>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.text}>{paragraph}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  lastUpdate: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: `${Colors.outlineVariant}20`,
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    textAlign: 'justify',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  heading: {
    color: Colors.onSurface,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
});
