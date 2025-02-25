// 初始化DOM元素
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const statusInfo = document.getElementById('statusInfo');
const qrcodeBox = document.getElementById('qrcodeBox');
const qrcodeImage = document.getElementById('qrcodeImage');

// 文件拖放功能
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#2196F3';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// 文件选择功能
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// 处理文件上传
async function handleFile(file) {
    statusInfo.className = 'status-info info';
    statusInfo.textContent = '文件上传中...';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // 显示二维码
            qrcodeImage.src = result.qrCode;
            qrcodeBox.classList.remove('hidden');
            statusInfo.className = 'status-info success';
            statusInfo.textContent = `上传成功：${result.filename}`;
            
            // 保存文件URL到二维码图片元素
            qrcodeImage.dataset.url = result.fileUrl;
        } else {
            showError(result.error || '上传失败');
        }
    } catch (err) {
        showError('网络连接错误');
    }
}

// 复制文件链接功能
function copyFileUrl() {
    const url = qrcodeImage.dataset.url;
    navigator.clipboard.writeText(url)
        .then(() => alert('链接已复制到剪贴板'))
        .catch(() => alert('复制失败，请手动复制链接'));
}

// 显示错误信息
function showError(message) {
    statusInfo.className = 'status-info error';
    statusInfo.textContent = message;
    qrcodeBox.classList.add('hidden');
}
