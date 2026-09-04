require('dotenv').config();
const { Client } = require('pg');

const database = process.env.DB_NAME || 'pudding_plan_demo';

async function main() {
  if (database !== 'pudding_plan_demo') {
    throw new Error(
      `安全保护：demo:reset 仅允许操作 pudding_plan_demo，当前为 ${database}`,
    );
  }
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: 'postgres',
  });
  await client.connect();
  try {
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [database],
    );
    await client.query('DROP DATABASE IF EXISTS "pudding_plan_demo"');
    await client.query('CREATE DATABASE "pudding_plan_demo"');
    console.log('演示数据库 pudding_plan_demo 已安全重建');
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
