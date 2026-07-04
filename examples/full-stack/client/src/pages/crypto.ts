/**
 * 加密工具页 - @orbitjs/crypto
 */
import { CryptoManager, base64Encode, base64Decode, md5, sha1, sha256, sha512, xxhash64 } from '@orbitjs/crypto';
import { renderPageContent } from '../layout';

const crypto = CryptoManager.getInstance();

export function renderCrypto(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>加密工具</h2>
            <p>@orbitjs/crypto — AES/RSA/Hash 加解密 + 编码转换</p>
        </div>

        <div class="section">
            <div class="section-title">哈希计算</div>
            <div class="card">
                <div class="form-group">
                    <label>输入文本</label>
                    <input id="crypto-input" class="input" value="Hello OrbitJS" placeholder="输入文本">
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
                    <input id="crypto-compare-input" class="input" value="Hello OrbitJS" placeholder="输入文本">
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
                    <input id="crypto-b64-input" class="input" value="OrbitJS Enterprise Framework" placeholder="输入文本">
                </div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__b64Encode()">编码</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__b64Decode()">解码</button>
                </div>
                <div id="crypto-b64-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">AES 加解密</div>
            <div class="card">
                <div class="form-group">
                    <label>明文</label>
                    <input id="crypto-aes-input" class="input" value="Sensitive Data 123" placeholder="输入明文">
                </div>
                <div class="form-group">
                    <label>密钥</label>
                    <input id="crypto-aes-key" class="input" value="my-secret-key-123" placeholder="输入密钥">
                </div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-primary btn-sm" onclick="window.__aesEncrypt()">加密</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__aesDecrypt()">解密</button>
                </div>
                <div id="crypto-aes-result" class="text-sm"></div>
            </div>
        </div>
    `);
}

(window as any).__hash = async (algorithm: string) => {
    const input = (document.getElementById('crypto-input') as HTMLInputElement).value;
    try {
        let result: string;
        if (algorithm === 'xxhash64') {
            result = xxhash64(input);
        } else {
            result = await crypto.hash(input, algorithm);
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

(window as any).__aesEncrypt = async () => {
    const input = (document.getElementById('crypto-aes-input') as HTMLInputElement).value;
    const key = (document.getElementById('crypto-aes-key') as HTMLInputElement).value;
    try {
        const encrypted = await crypto.encrypt(input, key);
        document.getElementById('crypto-aes-result')!.innerHTML = `
            <div class="mb-1"><span class="badge badge-success">加密成功</span></div>
            <code style="word-break:break-all;color:#A1A1AA;">${encrypted}</code>
        `;
    } catch (e: any) {
        document.getElementById('crypto-aes-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__aesDecrypt = async () => {
    const input = (document.getElementById('crypto-aes-input') as HTMLInputElement).value;
    const key = (document.getElementById('crypto-aes-key') as HTMLInputElement).value;
    try {
        const decrypted = await crypto.decrypt(input, key);
        document.getElementById('crypto-aes-result')!.innerHTML = `
            <div class="mb-1"><span class="badge badge-success">解密成功</span></div>
            <code style="word-break:break-all;color:#A1A1AA;">${decrypted}</code>
        `;
    } catch (e: any) {
        document.getElementById('crypto-aes-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};
