/**
 * 加密工具页 - @qimenjs/crypto
 */
import { base64Encode, base64Decode, md5, sha1, sha256, sha512, xxhash64 } from '@qimenjs/crypto';
import { renderPageContent } from '../layout';

export function renderCrypto(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>加密工具</h2>
            <p>@qimenjs/crypto — Hash 计算 + Base64 编解码</p>
        </div>

        <div class="section">
            <div class="section-title">哈希计算</div>
            <div class="card">
                <div class="form-group">
                    <label>输入文本</label>
                    <input id="crypto-input" class="input" value="Hello QimenJS" placeholder="输入文本">
                </div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__hash('md5')">MD5</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__hash('sha1')">SHA-1</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__hash('sha256')">SHA-256</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__hash('sha512')">SHA-512</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__hash('xxhash64')">XXH64</button>
                </div>
                <div id="crypto-hash-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">多算法对比</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>同一输入，多种哈希对比</div>
                <div class="form-group">
                    <label>输入文本</label>
                    <input id="crypto-compare-input" class="input" value="Hello QimenJS" placeholder="输入文本">
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__compareHashes()">对比所有算法</button>
                <div id="crypto-compare-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Base64 编解码</div>
            <div class="card">
                <div class="form-group">
                    <label>文本</label>
                    <input id="crypto-b64-input" class="input" value="QimenJS Enterprise Framework" placeholder="输入文本">
                </div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__b64Encode()">编码</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__b64Decode()">解码</button>
                </div>
                <div id="crypto-b64-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">API 一览</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>函数</th><th>说明</th><th>输出长度</th></tr></thead>
                    <tbody>
                        <tr><td><code>md5(input)</code></td><td>MD5 哈希</td><td>32 chars</td></tr>
                        <tr><td><code>sha1(input)</code></td><td>SHA-1 哈希</td><td>40 chars</td></tr>
                        <tr><td><code>sha256(input)</code></td><td>SHA-256 哈希</td><td>64 chars</td></tr>
                        <tr><td><code>sha512(input)</code></td><td>SHA-512 哈希</td><td>128 chars</td></tr>
                        <tr><td><code>xxhash64(input, seed?)</code></td><td>XXH64 非加密哈希</td><td>16 chars</td></tr>
                        <tr><td><code>base64Encode(input)</code></td><td>Base64 编码</td><td>可变</td></tr>
                        <tr><td><code>base64Decode(input)</code></td><td>Base64 解码</td><td>可变</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

(window as any).__hash = (algorithm: string) => {
    const input = (document.getElementById('crypto-input') as HTMLInputElement).value;
    try {
        let result: string;
        switch (algorithm) {
            case 'md5': result = md5(input); break;
            case 'sha1': result = sha1(input); break;
            case 'sha256': result = sha256(input); break;
            case 'sha512': result = sha512(input); break;
            case 'xxhash64': result = xxhash64(input); break;
            default: result = '未知算法';
        }
        document.getElementById('crypto-hash-result')!.innerHTML = `
            <div class="mb-1"><span class="badge badge-info">${algorithm}</span></div>
            <code style="word-break:break-all;color:#A1A1AA;">${result}</code>
        `;
    } catch (e: any) {
        document.getElementById('crypto-hash-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__compareHashes = () => {
    const input = (document.getElementById('crypto-compare-input') as HTMLInputElement).value;
    const el = document.getElementById('crypto-compare-result');
    if (!el) return;
    const algorithms = [
        { name: 'MD5', fn: () => md5(input), len: 32 },
        { name: 'SHA-1', fn: () => sha1(input), len: 40 },
        { name: 'SHA-256', fn: () => sha256(input), len: 64 },
        { name: 'SHA-512', fn: () => sha512(input), len: 128 },
        { name: 'XXH64', fn: () => xxhash64(input, 0), len: 16 },
    ];
    el.innerHTML = algorithms.map(a => {
        const start = performance.now();
        const result = a.fn();
        const duration = (performance.now() - start).toFixed(3);
        return `<div class="mb-2">
            <span class="badge badge-info">${a.name}</span>
            <span class="text-muted text-xs ml-2">${duration}ms | ${a.len} chars</span>
            <div><code style="word-break:break-all;color:#A1A1AA;font-size:11px;">${result}</code></div>
        </div>`;
    }).join('');
};

(window as any).__b64Encode = () => {
    const input = (document.getElementById('crypto-b64-input') as HTMLInputElement).value;
    try {
        const encoded = base64Encode(input);
        document.getElementById('crypto-b64-result')!.innerHTML = `
            <div class="mb-1"><span class="badge badge-success">编码结果 (base64Encode)</span></div>
            <code style="word-break:break-all;color:#A1A1AA;">${encoded}</code>
        `;
    } catch (e: any) {
        document.getElementById('crypto-b64-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__b64Decode = () => {
    const input = (document.getElementById('crypto-b64-input') as HTMLInputElement).value;
    try {
        const decoded = base64Decode(input);
        document.getElementById('crypto-b64-result')!.innerHTML = `
            <div class="mb-1"><span class="badge badge-success">解码结果 (base64Decode)</span></div>
            <code style="word-break:break-all;color:#A1A1AA;">${decoded}</code>
        `;
    } catch (e: any) {
        document.getElementById('crypto-b64-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};
