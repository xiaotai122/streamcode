// 引入所需模块
const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');

// 初始化Express应用
const app = express();
const port = 3000;

// 配置静态文件目录
app.use(express.static('public'));

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 上传文件存储目录
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳+随机数
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 限制文件大小为100MB
});

// 文件路由
// 处理文件上传
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // 生成文件访问URL
    const fileUrl = `http://${req.headers.host}/file/${req.file.filename}`;
    
    // 生成二维码
    const qrCode = await QRCode.toDataURL(fileUrl);
    
    res.json({
      filename: req.file.originalname,
      fileUrl: fileUrl,
      qrCode: qrCode,
      fileType: path.extname(req.file.originalname).toLowerCase()
    });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取文件
app.get('/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  const ext = path.extname(filePath).toLowerCase();
  
  // 根据文件类型设置响应头
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };

  if (fs.existsSync(filePath)) {
    // 设置内容安全策略允许加载外部资源
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.sendFile(filePath);
  } else {
    res.status(404).send('文件不存在');
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
