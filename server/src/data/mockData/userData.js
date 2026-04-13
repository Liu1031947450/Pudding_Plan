const mockUsers = [
  {
    id: '1',
    username: 'test',
    phone: '13800138000',
    password: '123456', // 实际应用中应该使用加密密码
    createdAt: new Date().toISOString(),
  },
];

module.exports = { mockUsers };