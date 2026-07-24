/**
 * TemplatesPage - 模板展示页
 *
 * 展示不同页面模板布局（admin、marketing 等）。
 * 目前为框架占位，参考 admin 模板模式实现。
 */

import { Component } from '@qimenjs/component-core';

const TEMPLATE_LIST = [
    { id: 'admin', name: 'Admin 后台', desc: '经典后台管理布局：侧边栏 + 顶栏 + 内容区' },
    { id: 'marketing', name: '营销落地页', desc: '面向营销场景的单页面布局' },
    { id: 'dashboard', name: '数据看板', desc: '信息密度高的数据展示布局' },
];

export let TemplatesPage = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-templates-page',
        children: [
            {
                name: 'content',
                cls: 'q-templates-page__content',
            },
        ],
    },
    body: {
        type: 'TemplatesPage',

        onAfterInit(): void {
            this._buildContent();
        },

        _buildContent(): void {
            const content = this.nodeMap.content.el;
            content.style.padding = '24px';
            content.style.overflow = 'auto';

            const header = document.createElement('div');
            header.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:24px;';
            header.innerHTML = `
                <h2 style="font-size:20px;font-weight:600;">模板</h2>
                <p style="color:var(--q-demo-text-secondary);">选择以下模板预览不同的页面布局方案。</p>
            `;
            content.appendChild(header);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;';

            for (const tpl of TEMPLATE_LIST) {
                const card = this._createTemplateCard(tpl);
                grid.appendChild(card);
            }

            content.appendChild(grid);
        },

        _createTemplateCard(tpl: typeof TEMPLATE_LIST[0]): HTMLElement {
            const card = document.createElement('div');
            card.style.cssText = [
                'border:1px solid var(--q-demo-border)',
                'border-radius:8px',
                'background:#fff',
                'overflow:hidden',
                'cursor:pointer',
                'transition:box-shadow 0.2s',
                'display:flex',
                'flex-direction:column',
            ].join(';');

            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = 'none';
            });
            card.addEventListener('click', () => {
                this._previewTemplate(tpl.id);
            });

            const preview = document.createElement('div');
            preview.style.cssText = [
                'height:160px',
                'background:linear-gradient(135deg,#f0f0f0 0%,#e8e8e8 100%)',
                'position:relative',
                'overflow:hidden',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'border-bottom:1px solid var(--q-demo-border)',
            ].join(';');

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-layer-group';
            icon.style.cssText = 'font-size:36px;color:var(--q-demo-text-secondary);';
            preview.appendChild(icon);

            card.appendChild(preview);

            const info = document.createElement('div');
            info.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:4px;';

            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-size:14px;font-weight:600;';
            nameEl.textContent = tpl.name;
            info.appendChild(nameEl);

            const descEl = document.createElement('div');
            descEl.style.cssText = 'font-size:12px;color:var(--q-demo-text-secondary);';
            descEl.textContent = tpl.desc;
            info.appendChild(descEl);

            card.appendChild(info);

            return card;
        },

        _previewTemplate(id: string): void {
            const content = this.nodeMap.content.el;
            content.innerHTML = '';

            const backBtn = document.createElement('button');
            backBtn.style.cssText = [
                'padding:6px 12px',
                'border:1px solid var(--q-demo-border)',
                'border-radius:4px',
                'background:#fff',
                'cursor:pointer',
                'font-size:13px',
                'margin-bottom:16px',
                'display:inline-flex',
                'align-items:center',
                'gap:4px',
            ].join(';');
            backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> 返回';
            backBtn.addEventListener('click', () => {
                this._buildContent();
            });
            content.appendChild(backBtn);

            if (id === 'admin') {
                content.appendChild(this._buildAdminPreview());
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'padding:48px;text-align:center;color:var(--q-demo-text-secondary);border:1px dashed var(--q-demo-border);border-radius:8px;';
                placeholder.textContent = `${id} 模板预览 — 待实现`;
                content.appendChild(placeholder);
            }
        },

        _buildAdminPreview(): HTMLElement {
            const admin = document.createElement('div');
            admin.style.cssText = [
                'display:flex',
                'border:1px solid var(--q-demo-border)',
                'border-radius:8px',
                'overflow:hidden',
                'background:#fff',
                'min-height:400px',
            ].join(';');

            const sidebar = document.createElement('div');
            sidebar.style.cssText = [
                'width:200px',
                'background:#1f1f1f',
                'color:#fff',
                'padding:16px',
                'display:flex',
                'flex-direction:column',
                'gap:8px',
                'flex-shrink:0',
            ].join(';');

            const sidebarTitle = document.createElement('div');
            sidebarTitle.style.cssText = 'font-size:14px;font-weight:600;margin-bottom:16px;';
            sidebarTitle.textContent = 'Admin 导航';
            sidebar.appendChild(sidebarTitle);

            const navItems = ['仪表盘', '用户管理', '订单管理', '数据统计', '系统设置'];
            for (let i = 0; i < navItems.length; i++) {
                const item = document.createElement('div');
                item.style.cssText = [
                    'padding:8px 12px',
                    'border-radius:4px',
                    'font-size:13px',
                    'cursor:pointer',
                    i === 0 ? 'background:var(--q-colors-primary, #1890ff)' : '',
                ].join(';');
                item.textContent = navItems[i];
                sidebar.appendChild(item);
            }

            admin.appendChild(sidebar);

            const main = document.createElement('div');
            main.style.cssText = 'flex:1;display:flex;flex-direction:column;';

            const topbar = document.createElement('div');
            topbar.style.cssText = [
                'height:48px',
                'border-bottom:1px solid var(--q-demo-border)',
                'padding:0 16px',
                'display:flex',
                'align-items:center',
                'justify-content:space-between',
            ].join(';');
            topbar.innerHTML = '<span style="font-size:14px;font-weight:600;">仪表盘</span><span style="font-size:12px;color:var(--q-demo-text-secondary);">管理员</span>';
            main.appendChild(topbar);

            const body = document.createElement('div');
            body.style.cssText = 'padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;';

            for (let i = 0; i < 6; i++) {
                const card = document.createElement('div');
                card.style.cssText = [
                    'padding:16px',
                    'border:1px solid var(--q-demo-border)',
                    'border-radius:6px',
                    'background:#fafafa',
                    'min-height:80px',
                ].join(';');
                card.innerHTML = `<div style="font-size:11px;color:var(--q-demo-text-secondary);">指标 ${i + 1}</div><div style="font-size:20px;font-weight:600;margin-top:4px;">¥${(Math.random() * 10000).toFixed(0)}</div>`;
                body.appendChild(card);
            }

            main.appendChild(body);
            admin.appendChild(main);

            return admin;
        },
    },
});

export type TemplatesPage = InstanceType<typeof TemplatesPage>;