/**
 * 触发浏览器文件下载
 */
export const triggerDownload = (data: Blob | string, fileName: string = 'file'): void => {
    const isBlob = data instanceof Blob;
    const url = isBlob ? URL.createObjectURL(data) : data;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);

    setTimeout(() => {
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            if (isBlob) URL.revokeObjectURL(url);
        }, 150);
    }, 0);
};