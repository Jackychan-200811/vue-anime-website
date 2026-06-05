const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: 3306,
    multipleStatements: true
  });

  console.log('✅ 已连接 MySQL');

  // 创建数据库
  await connection.query('CREATE DATABASE IF NOT EXISTS anime_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await connection.query('USE anime_db');
  console.log('✅ 数据库 anime_db 已就绪');

  // 读取 SQL 文件
  const sqlPath = path.join(__dirname, '..', 'anime_db1.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // 分割语句
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let count = 0;
  for (const stmt of statements) {
    try {
      await connection.query(stmt);
      count++;
    } catch (err) {
      // 跳过纯注释行或已经存在的数据
      if (!err.message.includes('Duplicate') && !err.message.includes('already exists')) {
        console.warn(`⚠️ 跳过: ${err.message.substring(0, 80)}`);
      }
    }
  }

  // 检查结果
  const [rows] = await connection.query("SHOW TABLES LIKE 'animes%'");
  console.log(`✅ 导入完成！表:`, rows.map(r => Object.values(r)[0]).join(', '));

  const [rimanCount] = await connection.query('SELECT COUNT(*) as total FROM animes');
  const [guomanCount] = await connection.query('SELECT COUNT(*) as total FROM animes_guoman');
  console.log(`📊 日漫: ${rimanCount[0].total} 条, 国漫: ${guomanCount[0].total} 条`);

  await connection.end();
  console.log('✅ 全部完成！');
}

importDb().catch(err => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
