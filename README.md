# 文件上传与二维码生成系统

## 功能特性
- 支持上传任意类型文件（音视频、文档、图片等）
- 自动生成文件访问二维码
- 智能文件预览（支持音视频播放、文档在线查看）
- 一键复制文件链接
- 拖放文件上传功能

## 技术栈
- 前端：HTML5/CSS3/JavaScript
- 后端：Node.js/Express
- 二维码生成：qrcode库
- 文件存储：本地文件系统

## 开发日志
### 2025-02-25 
- 初始化项目结构
- 实现基础文件上传功能
- 添加二维码生成接口
- 完成前端拖放上传功能
- 添加文件类型识别模块

### 2025-02-26
- 完善文件预览功能
- 增加Office文档在线预览支持
- 优化移动端显示效果
- 添加系统状态提示功能
- 实现链接复制功能

## 安装运行
```bash
# 安装依赖
npm install express qrcode multer

# 启动服务
node server.js
```

## 项目结构
```
├── server.js         # 后端服务入口
├── public            # 静态资源
│   ├── index.html    # 前端页面
│   ├── css/style.css # 样式文件
│   └── js/app.js     # 前端逻辑
├── uploads           # 文件存储目录
└── README.md         # 项目文档
```

## 维护指南
1. 文件大小限制：修改server.js中的`maxFileSize`值
2. 支持新文件类型：在server.js的mimeTypeMap添加MIME类型
3. 部署生产环境：建议使用Nginx反向代理
