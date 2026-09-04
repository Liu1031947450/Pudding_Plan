const { Notification, User } = require('../models');
const { getIO, connectedUsers } = require('../utils/socketManager');

const toPayload = notification => ({
  id: String(notification.id),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  time: '刚刚',
  read: notification.read,
  targetType: notification.targetType || null,
  targetId: notification.targetId ? String(notification.targetId) : null,
});

const createNotification = async ({
  userId,
  senderId = null,
  type,
  title,
  message,
  targetType = null,
  targetId = null,
}) => {
  if (senderId && userId === senderId) return null;
  const notification = await Notification.create({
    userId,
    senderId,
    type,
    title,
    message,
    targetType,
    targetId,
    read: false,
  });
  const recipient = await User.findByPk(userId, { attributes: ['userId'] });
  const socketId = recipient ? connectedUsers.get(recipient.userId) : null;
  const io = getIO();
  if (socketId && io)
    io.to(socketId).emit('new_notification', toPayload(notification));
  return notification;
};

module.exports = { createNotification };
