/**
 * 工具函数页 - @qimenjs/utils
 */
import * as utils from '@qimenjs/utils';
import { renderPageContent } from '../layout';

export function renderUtils(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>工具函数</h2>
            <p>@qimenjs/utils — 10 个子模块：string / array / object / date / number / color / geometry / units / time / cookie</p>
        </div>

        <div class="section">
            <div class="section-title">字符串操作 (utils.string)</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>capitalize / camelCase</div>
                    <div class="form-group">
                        <input id="u-str-input" class="input" value="hello world" placeholder="输入字符串">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsString()">执行</button>
                    <div id="u-str-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>getId / generateTraceId</div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsId()">生成 ID</button>
                    <div id="u-id-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">数组操作 (utils.array)</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>removeDuplicates / chunk / groupBy</div>
                    <div class="form-group">
                        <input id="u-arr-input" class="input" value="1,2,3,2,4,3,5" placeholder="逗号分隔数字">
                    </div>
                    <div class="form-group">
                        <label>chunk 大小</label>
                        <input id="u-arr-chunk" class="input" type="number" value="3">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsArray()">执行</button>
                    <div id="u-arr-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#FF9800;"></span>sortBy / orderBy</div>
                    <div class="form-group">
                        <input id="u-sort-input" class="input" value='[{"name":"C","age":30},{"name":"A","age":20},{"name":"B","age":25}]' placeholder="JSON 数组">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsSort()">按 age 排序</button>
                    <div id="u-sort-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">对象操作 (utils.object)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#EF5350;"></span>clone / deepMerge / getNestedValue</div>
                <div class="form-group">
                    <input id="u-obj-path" class="input" value="user.address.city" placeholder="嵌套路径">
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__utilsObject()">执行</button>
                <div id="u-obj-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">日期操作 (utils.date)</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>formatDate</div>
                    <div class="form-group">
                        <input id="u-date-input" class="input" type="date" value="2000-06-15">
                    </div>
                    <div class="form-group">
                        <input id="u-date-fmt" class="input" value="YYYY年MM月DD日" placeholder="格式字符串">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsDate()">格式化</button>
                    <div id="u-date-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>calculateAge</div>
                    <div class="form-group">
                        <input id="u-age-input" class="input" type="date" value="1990-01-01" placeholder="出生日期">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__utilsAge()">计算年龄</button>
                    <div id="u-age-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">颜色操作 (utils.color)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>hexToRgb / rgbToHex / generateColorShades</div>
                <div class="form-group">
                    <input id="u-color-input" class="input" value="#6366F1" placeholder="十六进制颜色">
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__utilsColor()">转换</button>
                <div id="u-color-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">单位转换 (utils.units)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>pxToRem / degToRad</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>px 值</label>
                        <input id="u-px-input" class="input" type="number" value="16">
                    </div>
                    <div class="form-group">
                        <label>根字号</label>
                        <input id="u-px-root" class="input" type="number" value="16">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__utilsUnits()">转换</button>
                <div id="u-units-result" class="mt-3 text-sm"></div>
            </div>
        </div>
    `);
}

(window as any).__utilsString = () => {
    const input = (document.getElementById('u-str-input') as HTMLInputElement).value;
    const el = document.getElementById('u-str-result');
    if (!el) return;
    const results = {
        capitalize: utils.string.capitalize(input),
        camelCase: utils.string.camelCase(input),
        uncapitalize: utils.string.uncapitalize(input),
        camelCaseToDash: utils.string.camelCaseToDash(utils.string.camelCase(input)),
        trim: utils.string.trim(input),
    };
    el.innerHTML = Object.entries(results).map(([k, v]) =>
        `<div><span class="badge badge-info">${k}</span> <code style="color:#A855F7;">${v}</code></div>`
    ).join('');
};

(window as any).__utilsId = () => {
    const el = document.getElementById('u-id-result');
    if (!el) return;
    const id1 = utils.string.getId('user');
    const id2 = utils.string.getId();
    const traceId = utils.string.generateTraceId();
    el.innerHTML = `
        <div><span class="badge badge-info">getId('user')</span> <code style="color:#A855F7;">${id1}</code></div>
        <div><span class="badge badge-info">getId()</span> <code style="color:#A855F7;">${id2}</code></div>
        <div><span class="badge badge-info">generateTraceId()</span> <code style="color:#A855F7;">${traceId}</code></div>
    `;
};

(window as any).__utilsArray = () => {
    const input = (document.getElementById('u-arr-input') as HTMLInputElement).value;
    const chunkSize = Number((document.getElementById('u-arr-chunk') as HTMLInputElement).value) || 3;
    const el = document.getElementById('u-arr-result');
    if (!el) return;
    const arr = input.split(',').map(Number).filter(n => !isNaN(n));
    const unique = utils.array.removeDuplicates(arr);
    const chunks = utils.array.chunk(arr, chunkSize);
    el.innerHTML = `
        <div><span class="badge badge-info">原始</span> <code style="color:#A855F7;">[${arr}]</code></div>
        <div><span class="badge badge-success">removeDuplicates</span> <code style="color:#A855F7;">[${unique}]</code></div>
        <div><span class="badge badge-purple">chunk(${chunkSize})</span> <code style="color:#A855F7;">${JSON.stringify(chunks)}</code></div>
    `;
};

(window as any).__utilsSort = () => {
    const el = document.getElementById('u-sort-result');
    if (!el) return;
    try {
        const input = (document.getElementById('u-sort-input') as HTMLInputElement).value;
        const arr = JSON.parse(input);
        const sorted = utils.array.sortBy(arr, 'age', 'asc');
        el.innerHTML = `<div><span class="badge badge-success">sortBy('age','asc')</span> <code style="color:#A855F7;">${JSON.stringify(sorted)}</code></div>`;
    } catch (e) {
        el.innerHTML = `<span class="badge badge-danger">JSON 解析失败</span>`;
    }
};

(window as any).__utilsObject = () => {
    const path = (document.getElementById('u-obj-path') as HTMLInputElement).value;
    const el = document.getElementById('u-obj-result');
    if (!el) return;
    const obj = { user: { name: 'Alice', address: { city: 'Beijing', zip: '100000' } }, age: 30 };
    const original = utils.object.clone(obj);
    const nested = utils.object.getNestedValue(obj, path);
    const merged = utils.object.deepMerge({ a: 1 }, { b: 2, a: 3 });
    el.innerHTML = `
        <div><span class="badge badge-info">原始对象</span> <code style="color:#A855F7;">${JSON.stringify(obj)}</code></div>
        <div><span class="badge badge-success">clone</span> <code style="color:#A855F7;">${JSON.stringify(original)}</code></div>
        <div><span class="badge badge-purple">getNestedValue('${path}')</span> <code style="color:#A855F7;">${JSON.stringify(nested)}</code></div>
        <div><span class="badge badge-warning">deepMerge</span> <code style="color:#A855F7;">${JSON.stringify(merged)}</code></div>
    `;
};

(window as any).__utilsDate = () => {
    const input = (document.getElementById('u-date-input') as HTMLInputElement).value;
    const fmt = (document.getElementById('u-date-fmt') as HTMLInputElement).value;
    const el = document.getElementById('u-date-result');
    if (!el) return;
    const formatted = utils.date.formatDate(new Date(input), fmt);
    el.innerHTML = `<div><span class="badge badge-success">formatDate</span> <code style="color:#A855F7;">${formatted}</code></div>`;
};

(window as any).__utilsAge = () => {
    const input = (document.getElementById('u-age-input') as HTMLInputElement).value;
    const el = document.getElementById('u-age-result');
    if (!el) return;
    const age = utils.date.calculateAge(input);
    el.innerHTML = `<div><span class="badge badge-success">calculateAge</span> <code style="color:#A855F7;">${age} 岁</code></div>`;
};

(window as any).__utilsColor = () => {
    const input = (document.getElementById('u-color-input') as HTMLInputElement).value;
    const el = document.getElementById('u-color-result');
    if (!el) return;
    const rgb = utils.color.hexToRgb(input);
    const hex = utils.color.rgbToHex(rgb[0], rgb[1], rgb[2]);
    const shades = utils.color.generateColorShades(input);
    el.innerHTML = `
        <div><span class="badge badge-info">hexToRgb</span> <code style="color:#A855F7;">rgb(${rgb.join(', ')})</code></div>
        <div><span class="badge badge-success">rgbToHex</span> <code style="color:#A855F7;">${hex}</code></div>
        <div class="mt-2"><span class="badge badge-purple">generateColorShades</span></div>
        <div class="flex gap-1 mt-1">${Object.entries(shades).map(([k, v]) =>
            `<div style="background:${v};width:40px;height:24px;border-radius:4px;" title="${k}: ${v}"></div>`
        ).join('')}</div>
    `;
};

(window as any).__utilsUnits = () => {
    const px = Number((document.getElementById('u-px-input') as HTMLInputElement).value);
    const root = Number((document.getElementById('u-px-root') as HTMLInputElement).value);
    const el = document.getElementById('u-units-result');
    if (!el) return;
    const rem = utils.units.pxToRem(px, root);
    const pxBack = utils.units.remToPx(rem, root);
    const deg = 180;
    const rad = utils.units.degToRad(deg);
    el.innerHTML = `
        <div><span class="badge badge-info">pxToRem(${px}, ${root})</span> <code style="color:#A855F7;">${rem.toFixed(4)}rem</code></div>
        <div><span class="badge badge-success">remToPx(${rem.toFixed(4)}, ${root})</span> <code style="color:#A855F7;">${pxBack.toFixed(2)}px</code></div>
        <div><span class="badge badge-purple">degToRad(${deg})</span> <code style="color:#A855F7;">${rad.toFixed(4)}rad</code></div>
    `;
};
