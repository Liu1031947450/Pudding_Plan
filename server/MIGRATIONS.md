# 数据库迁移使用说明

## 可用命令

- `npm run db:migrate`：执行所有未执行的迁移
- `npm run db:migrate:undo`：回滚最近一次迁移
- `npm run db:migrate:status`：查看迁移状态

## 当前说明

当前项目已建立最小可用的 Sequelize migration 结构，包括：
- `server/.sequelizerc`
- `server/config/config.js`
- `server/migrations/`
- `server/seeders/`

## 注意事项

- 现阶段项目仍保留启动时的兼容性 schema 修补逻辑，用于兼容已有数据库。
- 新增表结构或字段时，后续应优先新增 migration，而不是继续扩大运行时 schema 修补范围。
- 在生产环境中，应避免依赖运行时自动建表，而应使用 `npm run db:migrate` 明确执行迁移。
