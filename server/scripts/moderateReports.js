require('dotenv').config();
const { Op } = require('sequelize');
const sequelize = require('../src/config/database');
const {
  CircleMoment,
  Comment,
  ContentReport,
  Notification,
  User,
} = require('../src/models');
const { deleteUploadedFiles } = require('../src/utils/files');

const usage = () => {
  console.log(
    '用法: npm run moderate -- list | reject <reportId> | delete <reportId>',
  );
};

async function list() {
  const reports = await ContentReport.findAll({
    include: [
      {
        model: User,
        as: 'reporter',
        attributes: ['userId', 'username', 'phone'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  console.table(
    reports.map(report => ({
      id: report.id,
      status: report.status,
      reporter: report.reporter?.username,
      target: `${report.targetType}:${report.targetId}`,
      reason: report.reason,
      detail: report.detail || '',
      createdAt: report.createdAt.toISOString(),
    })),
  );
}

async function reject(reportId) {
  const report = await ContentReport.findByPk(reportId);
  if (!report) throw new Error('举报记录不存在');
  await report.update({ status: 'rejected' });
  console.log(`举报 ${report.id} 已驳回`);
}

async function removeContent(reportId) {
  const report = await ContentReport.findByPk(reportId);
  if (!report) throw new Error('举报记录不存在');
  if (report.targetType === 'moment') {
    const moment = await CircleMoment.findByPk(report.targetId);
    if (moment) {
      const images = [...(moment.images || []), moment.imageUri].filter(
        Boolean,
      );
      const commentIds = (
        await Comment.findAll({
          where: { momentId: moment.id },
          attributes: ['id'],
        })
      ).map(comment => comment.id);
      await sequelize.transaction(async transaction => {
        await ContentReport.update(
          { status: 'actioned' },
          {
            where: {
              [Op.or]: [
                { targetType: 'moment', targetId: moment.id },
                ...(commentIds.length
                  ? [
                      {
                        targetType: 'comment',
                        targetId: { [Op.in]: commentIds },
                      },
                    ]
                  : []),
              ],
            },
            transaction,
          },
        );
        await Notification.destroy({
          where: { targetType: 'moment', targetId: moment.id },
          transaction,
        });
        await moment.destroy({ transaction });
      });
      await deleteUploadedFiles(images);
    }
  } else {
    const comment = await Comment.findByPk(report.targetId);
    if (comment) {
      const momentId = comment.momentId;
      const comments = await Comment.findAll({
        where: { momentId },
        attributes: ['id', 'parentId'],
      });
      const removedIds = new Set([comment.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of comments) {
          if (
            item.parentId &&
            removedIds.has(item.parentId) &&
            !removedIds.has(item.id)
          ) {
            removedIds.add(item.id);
            changed = true;
          }
        }
      }
      await sequelize.transaction(async transaction => {
        await comment.destroy({ transaction });
        await ContentReport.update(
          { status: 'actioned' },
          {
            where: {
              targetType: 'comment',
              targetId: { [Op.in]: [...removedIds] },
            },
            transaction,
          },
        );
        const moment = await CircleMoment.findByPk(momentId, { transaction });
        if (moment) {
          await moment.update(
            {
              commentsCount: await Comment.count({
                where: { momentId },
                transaction,
              }),
            },
            { transaction },
          );
        }
      });
    }
  }
  if (report.status !== 'actioned') await report.update({ status: 'actioned' });
  console.log(`举报 ${report.id} 对应内容已删除`);
}

async function main() {
  if (sequelize.getDatabaseName() !== 'pudding_plan_demo') {
    throw new Error('安全保护：内容治理脚本仅允许操作 pudding_plan_demo');
  }
  const [action, reportId] = process.argv.slice(2);
  if (!['list', 'reject', 'delete'].includes(action)) {
    usage();
    process.exitCode = 1;
    return;
  }
  await sequelize.authenticate();
  if (action === 'list') await list();
  if (action === 'reject') await reject(reportId);
  if (action === 'delete') await removeContent(reportId);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
