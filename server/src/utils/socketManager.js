/**
 * WebSocket 管理器 - 提供 io 和 connectedUsers 的全局单例存取
 * 解决 index.js 和 routes 之间的循环依赖问题
 */

let io = null;
const connectedUsers = new Map();

module.exports = {
  setIO: ioInstance => {
    io = ioInstance;
  },
  getIO: () => io,
  connectedUsers,
};
