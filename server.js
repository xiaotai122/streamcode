const express = require('express');
const multer = require('multer');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = 3001;

// 文件上传配置（带自动创建目录功能）
const createUploadsDir = () => {
  const uploadDir = 'uploads/'
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    createUploadsDir()
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 限制上传文件大小100MB
  }
})

// 静态文件服务
app.use(express.static('public'));
app.use('/download', express.static('uploads'));

// 文件上传路由
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, error: '未选择文件' });
        }

        // 生成二维码
        const qrCode = qr.imageSync(`http://${req.headers.host}/download/${file.filename}`, { type: 'png' });
        const qrCodeBase64 = qrCode.toString('base64');

        res.json({
            success: true,
            filename: file.filename,
            qrCode: `data:image/png;base64,${qrCodeBase64}`
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 文件预览路由
app.get('/preview/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    const mimeType = mime.lookup(filePath);

        // 处理文本文件预览
    if (mimeType === 'text/plain') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return res.status(404).send('文件未找到');
            res.send(`<pre>${data}</pre>`);
        });
    } 
    // 处理Office文档预览（使用微软在线查看器）
    else if (mimeType.startsWith('application/vnd.openxmlformats') || 
             mimeType.startsWith('application/msword') || 
             mimeType.startsWith('application/vnd.ms-excel')) {
        const encodedUrl = encodeURIComponent(`http://${req.headers.host}/download/${req.params.filename}`);
        res.send(`
            <iframe 
                src="https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}" 
                style="width:100%;height:100vh;" 
                frameborder="0"
            ></iframe>
        `);
    }
    // 其他文件直接显示下载
    // 处理媒体文件
    else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
        res.send(`
            <video controls style="max-width:100%">
                <source src="/download/${req.params.filename}" type="${mimeType}">
                您的浏览器不支持媒体播放
            </video>
        `);
    }
    // 其他文件直接下载
    else {
        res.sendFile(filePath);
    }
});

// 启动服务器
// 配置服务器参数
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

// 获取本机IP地址（兼容Linux系统）
const getLocalIP = () => {
    const interfaces = require('os').networkInterfaces();
    for (const name of ['eth0', 'wlan0', 'enp0s3']) {
        const iface = interfaces[name];
        if (iface) {
            const ipv4 = iface.find(i => i.family === 'IPv4' && !i.internal);
            if (ipv4) return ipv4.address;
        }
    }
    return 'localhost';
};

// 启动服务器
app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log(`本地访问地址: http://localhost:${PORT}`);
    console.log(`网络访问地址: http://${localIP}:${PORT}`);
    console.log(`监听模式: ${HOST === '0.0.0.0' ? '所有网络接口' : '指定接口'}`);
});
