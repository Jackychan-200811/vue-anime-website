const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();

// ==================== 配置 ====================
const PORT = 3000;
const config = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'anime_db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  imagePaths: {
    riman: 'C:\\Users\\123\\Desktop\\项目\\vue-porject\\anime-backend\\public\\RIMAN',
    guoman: 'C:\\Users\\123\\Desktop\\项目\\vue-porject\\anime-backend\\public\\GUOMAN'
  },
  apiTypes: ['riman', 'guoman']
};

// 图片类型对应的表名和路由前缀
const typeConfig = {
  riman: { table: 'animes', route: '/api/animes', imageType: 'riman' },
  guoman: { table: 'animes_guoman', route: '/api/guoman', imageType: 'guoman' }
};

// MySQL 连接池
const pool = mysql.createPool(config.mysql);

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==================== 辅助函数 ====================
function extractFileName(filePath, type = 'riman') {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  
  let fileName = filePath;
  if (fileName.includes('/')) fileName = fileName.split('/').pop();
  if (fileName.includes('\\')) fileName = fileName.split('\\').pop();
  
  return `http://localhost:3000/images/${type === 'guoman' ? 'guoman' : 'riman'}/${encodeURIComponent(fileName)}`;
}

function processCoverImage(value) {
  if (!value) return null;
  let fileName = value;
  if (fileName.includes('/')) fileName = fileName.split('/').pop();
  if (fileName.includes('\\')) fileName = fileName.split('\\').pop();
  return fileName;
}

function parseJSONFields(data, fields = ['tags', 'castList', 'staffList', 'episodes', 'reviews']) {
  fields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch(e) {
        data[field] = [];
      }
    } else if (!data[field]) {
      data[field] = [];
    }
  });
  return data;
}

// ==================== 静态文件托管 ====================
function findImagePath(type) {
  const defaultPath = path.join(__dirname, 'public', type === 'riman' ? 'RIMAN' : 'GUOMAN');
  const customPath = config.imagePaths[type === 'riman' ? 'riman' : 'guoman'];
  
  const possiblePaths = [customPath, defaultPath, path.join(process.cwd(), 'public', type === 'riman' ? 'RIMAN' : 'GUOMAN')];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const imageFiles = fs.readdirSync(p).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      if (imageFiles.length > 0) {
        console.log(`✅ 找到${type === 'riman' ? '日漫' : '国漫'}图片目录: ${p} (${imageFiles.length}个文件)`);
        return p;
      }
    }
  }
  
  if (!fs.existsSync(defaultPath)) fs.mkdirSync(defaultPath, { recursive: true });
  console.log(`⚠️ 使用默认${type === 'riman' ? '日漫' : '国漫'}图片目录: ${defaultPath}`);
  return defaultPath;
}

const rimanImagePath = findImagePath('riman');
const guomanImagePath = findImagePath('guoman');

app.use('/images/riman', express.static(rimanImagePath));
app.use('/images/guoman', express.static(guomanImagePath));

console.log(`🖼️ 日漫图片服务: http://localhost:${PORT}/images/riman/文件名.jpg`);
console.log(`🖼️ 国漫图片服务: http://localhost:${PORT}/images/guoman/文件名.jpg`);

// ==================== 调试接口 ====================
app.get('/api/check-images', (req, res) => {
  const getImages = (path) => fs.existsSync(path) 
    ? fs.readdirSync(path).filter(f => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f))
    : [];
  
  res.json({
    success: true,
    riman: { path: rimanImagePath, images: getImages(rimanImagePath), total: getImages(rimanImagePath).length },
    guoman: { path: guomanImagePath, images: getImages(guomanImagePath), total: getImages(guomanImagePath).length }
  });
});

// ==================== 数据库连接测试 ====================
async function testDatabaseConnection() {
  try {
    console.log('\n🔌 正在测试数据库连接...');
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功！');
    
    for (const [type, { table }] of Object.entries(typeConfig)) {
      const [exists] = await connection.query(`SHOW TABLES LIKE ?`, [table]);
      if (exists.length) {
        const [count] = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
        console.log(`✅ 数据表 "${table}" 存在，共 ${count[0].total} 条记录`);
      } else {
        console.warn(`⚠️ 警告: "${table}" 表不存在！`);
      }
    }
    
    connection.release();
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
  }
}

// ==================== 通用 CRUD 操作生成器 ====================
function createCRUDRoutes(type) {
  const { table, route, imageType } = typeConfig[type];
  const typeName = type === 'riman' ? '日漫' : '国漫';
  
  // 获取列表
  app.get(route, async (req, res) => {
    console.log(`📋 获取所有${typeName}列表`);
    const { page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    try {
      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
      const [rows] = await pool.query(
        `SELECT id, title, titleJp, coverImage, score, tags, startDate, status FROM ${table} LIMIT ? OFFSET ?`,
        [parseInt(limit), offset]
      );
      
      const processedRows = rows.map(row => ({
        ...row,
        coverImage: row.coverImage ? extractFileName(row.coverImage, imageType) : null,
        tags: row.tags && typeof row.tags === 'string' ? (() => { try { return JSON.parse(row.tags); } catch(e) { return []; } })() : (row.tags || [])
      }));
      
      console.log(`✅ 成功获取 ${rows.length} 条${typeName}记录 (总数: ${countResult[0].total})`);
      res.json({ data: processedRows, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) } });
    } catch (err) {
      console.error(`❌ 获取${typeName}列表失败:`, err.message);
      res.status(500).json({ error: '获取列表失败', message: err.message });
    }
  });
  
  // 获取详情
  app.get(`${route}/:id`, async (req, res) => {
    const id = req.params.id;
    console.log(`🎯 请求${typeName}ID: ${id}`);
    
    if (isNaN(id)) return res.status(400).json({ error: '无效的ID格式' });
    
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: `${typeName}不存在` });
      
      const data = rows[0];
      if (data.coverImage) data.coverImage = extractFileName(data.coverImage, imageType);
      parseJSONFields(data);
      
      console.log(`✅ 成功获取${typeName}: ${data.title}`);
      res.json(data);
    } catch (err) {
      console.error(`❌ 查询出错:`, err.message);
      res.status(500).json({ error: '服务器内部错误', message: err.message });
    }
  });
  
  // 创建
  app.post(route, async (req, res) => {
    console.log(`📝 收到创建${typeName}请求:`, req.body);
    const { title, coverImage, futitleJp, titleJp, titleEn, tags, score, reviewCount, reviewLink, playCount, followCount, danmakuCount, startDate, status, language, playLink, synopsis, castList, staffList, episodeMoreLink, episodes, reviews } = req.body;
    
    if (!title) return res.status(400).json({ error: '标题是必需的' });
    
    try {
      const processedCoverImage = processCoverImage(coverImage);
      const [result] = await pool.query(
        `INSERT INTO ${table} (coverImage, title, futitleJp, titleJp, titleEn, tags, score, reviewCount, reviewLink, playCount, followCount, danmakuCount, startDate, status, language, playLink, synopsis, castList, staffList, episodeMoreLink, episodes, reviews) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [processedCoverImage, title, futitleJp || null, titleJp || null, titleEn || null, tags ? JSON.stringify(tags) : null, score || null, reviewCount || 0, reviewLink || null, playCount || null, followCount || null, danmakuCount || null, startDate || null, status || null, language || null, playLink || null, synopsis || null, castList ? JSON.stringify(castList) : null, staffList ? JSON.stringify(staffList) : null, episodeMoreLink || null, episodes ? JSON.stringify(episodes) : null, reviews ? JSON.stringify(reviews) : null]
      );
      
      console.log(`✅ 成功创建${typeName}，ID: ${result.insertId}`);
      const [newItem] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      if (newItem[0].coverImage) newItem[0].coverImage = extractFileName(newItem[0].coverImage, imageType);
      res.status(201).json(newItem[0]);
    } catch (err) {
      console.error(`❌ 创建${typeName}失败:`, err.message);
      res.status(500).json({ error: '创建失败', message: err.message });
    }
  });
  
  // 更新
  app.put(`${route}/:id`, async (req, res) => {
    const id = req.params.id;
    console.log(`✏️ 更新${typeName}ID: ${id}`);
    
    if (isNaN(id)) return res.status(400).json({ error: '无效的ID格式' });
    
    const allowedFields = ['coverImage', 'title', 'futitleJp', 'titleJp', 'titleEn', 'tags', 'score', 'reviewCount', 'reviewLink', 'playCount', 'followCount', 'danmakuCount', 'startDate', 'status', 'language', 'playLink', 'synopsis', 'castList', 'staffList', 'episodeMoreLink', 'episodes', 'reviews'];
    const jsonFields = ['tags', 'castList', 'staffList', 'episodes', 'reviews'];
    
    const fields = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        let value = req.body[field];
        if (field === 'coverImage') value = processCoverImage(value);
        fields.push(`${field} = ?`);
        values.push(jsonFields.includes(field) ? JSON.stringify(value) : value);
      }
    }
    
    if (fields.length === 0) return res.status(400).json({ error: '没有要更新的字段' });
    values.push(id);
    
    try {
      const [result] = await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`, values);
      if (result.affectedRows === 0) return res.status(404).json({ error: `${typeName}不存在` });
      
      console.log(`✅ 成功更新${typeName}ID: ${id}`);
      const [updated] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (updated[0].coverImage) updated[0].coverImage = extractFileName(updated[0].coverImage, imageType);
      res.json(updated[0]);
    } catch (err) {
      console.error(`❌ 更新${typeName}失败:`, err.message);
      res.status(500).json({ error: '更新失败', message: err.message });
    }
  });
  
  // 删除
  app.delete(`${route}/:id`, async (req, res) => {
    const id = req.params.id;
    console.log(`🗑️ 删除${typeName}ID: ${id}`);
    
    if (isNaN(id)) return res.status(400).json({ error: '无效的ID格式' });
    
    try {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: `${typeName}不存在` });
      
      console.log(`✅ 成功删除${typeName}ID: ${id}`);
      res.json({ message: '删除成功', id });
    } catch (err) {
      console.error(`❌ 删除${typeName}失败:`, err.message);
      res.status(500).json({ error: '删除失败', message: err.message });
    }
  });
  
  // 搜索
  app.get(`${route}/search/:keyword`, async (req, res) => {
    const keyword = req.params.keyword;
    console.log(`🔍 搜索${typeName}: ${keyword}`);
    
    try {
      const [rows] = await pool.query(
        `SELECT id, title, titleJp, coverImage, score FROM ${table} WHERE title LIKE ? OR titleJp LIKE ? OR titleEn LIKE ?`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
      
      const processedRows = rows.map(row => ({
        ...row,
        coverImage: row.coverImage ? extractFileName(row.coverImage, imageType) : null
      }));
      
      console.log(`✅ 找到 ${rows.length} 条相关${typeName}记录`);
      res.json(processedRows);
    } catch (err) {
      console.error(`❌ 搜索${typeName}失败:`, err.message);
      res.status(500).json({ error: '搜索失败', message: err.message });
    }
  });
}

// ==================== 注册路由 ====================
createCRUDRoutes('riman');
createCRUDRoutes('guoman');

// 日漫特有接口（按标签筛选、获取热门）
app.get('/api/animes/tag/:tag', async (req, res) => {
  const tag = req.params.tag;
  console.log(`🏷️ 按标签筛选日漫: ${tag}`);
  
  try {
    const [rows] = await pool.query('SELECT id, title, coverImage, score, tags FROM animes WHERE JSON_CONTAINS(tags, ?)', [JSON.stringify(tag)]);
    const processedRows = rows.map(row => ({ ...row, coverImage: row.coverImage ? extractFileName(row.coverImage, 'riman') : null }));
    console.log(`✅ 找到 ${rows.length} 条包含标签 "${tag}" 的日漫记录`);
    res.json(processedRows);
  } catch (err) {
    console.error('❌ 标签筛选失败:', err.message);
    res.status(500).json({ error: '筛选失败', message: err.message });
  }
});

app.get('/api/animes/popular', async (req, res) => {
  const { limit = 10 } = req.query;
  console.log(`🔥 获取热门日漫 TOP ${limit}`);
  
  try {
    const [rows] = await pool.query('SELECT id, title, coverImage, score, reviewCount FROM animes ORDER BY score DESC LIMIT ?', [parseInt(limit)]);
    const processedRows = rows.map(row => ({ ...row, coverImage: row.coverImage ? extractFileName(row.coverImage, 'riman') : null }));
    console.log(`✅ 获取 ${rows.length} 条热门日漫`);
    res.json(processedRows);
  } catch (err) {
    console.error('❌ 获取热门日漫失败:', err.message);
    res.status(500).json({ error: '获取失败', message: err.message });
  }
});

// ==================== 调试路由 ====================
app.get('/api/debug/routes', (req, res) => {
  res.json({
    message: '可用路由列表',
    routes: [
      '日漫接口: GET /api/animes, GET /api/animes/:id, POST /api/animes, PUT /api/animes/:id, DELETE /api/animes/:id, GET /api/animes/search/:keyword, GET /api/animes/tag/:tag, GET /api/animes/popular',
      '国漫接口: GET /api/guoman, GET /api/guoman/:id, POST /api/guoman, PUT /api/guoman/:id, DELETE /api/guoman/:id, GET /api/guoman/search/:keyword',
      '其他: GET /api/check-images, GET /api/debug/routes'
    ]
  });
});

// ==================== 404 和错误处理 ====================
app.use((req, res) => {
  console.warn(`⚠️ 404 - 未找到路由: ${req.method} ${req.url}`);
  res.status(404).json({ error: '接口不存在', path: req.url });
});

app.use((err, req, res, next) => {
  console.error('💥 全局错误捕获:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// ==================== 启动服务 ====================
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 后端服务已启动：http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log(`\n🖼️ 日漫图片: http://localhost:${PORT}/images/riman/文件名.jpg`);
  console.log(`🖼️ 国漫图片: http://localhost:${PORT}/images/guoman/文件名.jpg`);
  console.log('\n' + '='.repeat(60));
  
  await testDatabaseConnection();
  console.log('\n' + '='.repeat(60));
  console.log('✅ 服务启动完成，等待请求...');
  console.log('='.repeat(60) + '\n');
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔚 正在关闭服务...');
  await pool.end();
  console.log('✅ 数据库连接已关闭');
  process.exit(0);
});