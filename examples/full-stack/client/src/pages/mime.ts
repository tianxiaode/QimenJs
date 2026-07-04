/**
 * MIME 类型页 - @qimenjs/mime
 */
import { MimeTypeRegistrar, IMAGE_MIMES, DOCUMENT_MIMES, AUDIO_MIMES, VIDEO_MIMES, ARCHIVE_MIMES, WEB_MIMES, FONT_MIMES } from '@qimenjs/mime';
import { renderPageContent } from '../layout';

export function renderMime(): void {
    const categories = [
        { name: '图片', data: IMAGE_MIMES, color: '#6366F1' },
        { name: '文档', data: DOCUMENT_MIMES, color: '#A855F7' },
        { name: '音频', data: AUDIO_MIMES, color: '#4CAF50' },
        { name: '视频', data: VIDEO_MIMES, color: '#EF5350' },
        { name: '压缩包', data: ARCHIVE_MIMES, color: '#FF9800' },
        { name: 'Web/代码', data: WEB_MIMES, color: '#00BCD4' },
        { name: '字体', data: FONT_MIMES, color: '#9C27B0' },
    ];

    renderPageContent(`
        <div class="page-header">
            <h2>MIME 类型</h2>
            <p>@qimenjs/mime — MimeTypeRegistrar 扩展名/MIME 映射查询</p>
        </div>

        <div class="section">
            <div class="section-title">交互式查询</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>扩展名 → MIME</div>
                    <div class="form-group">
                        <input id="mime-ext" class="input" value="jpg" placeholder="输入扩展名 (如 jpg, pdf, mp4)">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__queryMimeByExt()">查询</button>
                    <div id="mime-ext-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>MIME → 扩展名</div>
                    <div class="form-group">
                        <input id="mime-type" class="input" value="image/jpeg" placeholder="输入 MIME 类型">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__queryMimeByType()">查询</button>
                    <div id="mime-type-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">自定义注册</div>
            <div class="card">
                <div class="grid-2">
                    <div class="form-group">
                        <label>扩展名</label>
                        <input id="mime-custom-ext" class="input" value="custom" placeholder="扩展名">
                    </div>
                    <div class="form-group">
                        <label>MIME 类型</label>
                        <input id="mime-custom-type" class="input" value="application/custom" placeholder="MIME 类型">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__registerCustomMime()">注册</button>
                <div id="mime-custom-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">预定义 MIME 分类</div>
            ${categories.map(cat => `
                <div class="card mb-3">
                    <div class="card-title"><span class="dot" style="background:${cat.color};"></span>${cat.name}</div>
                    <div class="grid-3">
                        ${Object.entries(cat.data).map(([ext, mime]) =>
                            `<div class="text-xs" style="padding:4px 8px;"><code style="color:${cat.color};">.${ext}</code> → <span class="text-muted">${mime}</span></div>`
                        ).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `);
}

(window as any).__queryMimeByExt = () => {
    const ext = (document.getElementById('mime-ext') as HTMLInputElement).value.replace(/^\./, '');
    const el = document.getElementById('mime-ext-result');
    if (!el) return;
    try {
        const registrar = MimeTypeRegistrar.getInstance();
        const mimes = registrar.get(ext);
        el.innerHTML = mimes.length > 0
            ? mimes.map((m: string) => `<div><span class="badge badge-success">${m}</span></div>`).join('')
            : '<span class="badge badge-warning">未找到</span>';
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">查询失败: ${err}</span>`;
    }
};

(window as any).__queryMimeByType = () => {
    const mime = (document.getElementById('mime-type') as HTMLInputElement).value;
    const el = document.getElementById('mime-type-result');
    if (!el) return;
    try {
        const registrar = MimeTypeRegistrar.getInstance();
        const ext = registrar.getByMime(mime);
        el.innerHTML = ext
            ? `<span class="badge badge-success">.${ext}</span>`
            : '<span class="badge badge-warning">未找到</span>';
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">查询失败: ${err}</span>`;
    }
};

(window as any).__registerCustomMime = () => {
    const ext = (document.getElementById('mime-custom-ext') as HTMLInputElement).value;
    const type = (document.getElementById('mime-custom-type') as HTMLInputElement).value;
    const el = document.getElementById('mime-custom-result');
    if (!el || !ext || !type) return;
    try {
        const registrar = MimeTypeRegistrar.getInstance();
        registrar.register(ext, type);
        el.innerHTML = `<span class="badge badge-success">注册成功: .${ext} → ${type}</span>`;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">注册失败: ${err}</span>`;
    }
};
