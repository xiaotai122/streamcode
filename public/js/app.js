// 处理表单提交
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', document.getElementById('fileInput').files[0]);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            // 显示结果区域
            document.getElementById('result').classList.remove('hidden');
            
            // 显示文件名
            document.getElementById('fileName').textContent = data.filename;
            
            // 显示二维码
            const qrImg = document.createElement('img');
            qrImg.src = data.qrCode;
            document.getElementById('qrcode').innerHTML = '';
            document.getElementById('qrcode').appendChild(qrImg);
            
            // 设置下载链接
            document.getElementById('downloadLink').href = `/download/${data.filename}`;
        }
    } catch (err) {
        alert('上传失败: ' + err.message);
    }
});

// 复制链接功能（增强版）
document.getElementById('copyButton').addEventListener('click', async () => {
    const fileName = document.getElementById('fileName').textContent;
    if (!fileName) {
        alert('请先上传文件');
        return;
    }
    
    const link = `${window.location.origin}/download/${encodeURIComponent(fileName)}`;
    
    try {
        // 尝试现代剪贴板API
        await navigator.clipboard.writeText(link);
        showToast('链接已复制到剪贴板', 'success');
    } catch (err) {
        console.error('现代剪贴板API失败:', err);
        // 降级方案：使用execCommand
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const success = document.execCommand('copy');
            if (!success) throw new Error('execCommand失败');
            showToast('链接已复制到剪贴板', 'success');
        } catch (err) {
            console.error('降级复制方案失败:', err);
            showToast('复制失败，请手动复制链接', 'error');
            // 自动选中链接文本方便用户手动复制
            textArea.select();
        } finally {
            document.body.removeChild(textArea);
        }
    }
});

// 显示状态提示
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
