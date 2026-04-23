/**
 * 触发浏览器文件下载
 * @param data - 可以是 Blob, File, 或者下载链接 URL
 * @param fileName - 文件名
 */
export const triggerDownload = (data: Blob | string, fileName: string = 'file'): void => {
    const isBlob = data instanceof Blob;
    const url = isBlob ? URL.createObjectURL(data) : data;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);

    // 使用 setTimeout 确保在事件循环的下一个宏任务中触发，
    // 释放当前主线程资源，提高浏览器下载响应成功率
    setTimeout(() => {
        link.click();

        // 延迟清理，给浏览器留出初始化下载任务的时间
        setTimeout(() => {
            document.body.removeChild(link);
            if (isBlob) URL.revokeObjectURL(url);
        }, 150);
    }, 0);
};
