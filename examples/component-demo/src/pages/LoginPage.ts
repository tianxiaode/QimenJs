/**
 * LoginPage - 登录页
 *
 * 临时展示页面，具体功能后续实现。
 */

import { Component } from '@qimenjs/component-core';

export let LoginPage = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-login-page',
        children: [
            {
                name: 'card',
                cls: 'q-login-page__card',
            },
        ],
    },
    body: {
        type: 'LoginPage',

        onAfterInit(): void {
            this._buildForm();
        },

        _buildForm(): void {
            const card = this.nodeMap.card.el;

            const title = document.createElement('div');
            title.className = 'q-login-page__title';
            title.textContent = '欢迎登录';
            card.appendChild(title);

            const form = document.createElement('form');
            form.style.cssText = 'display:flex;flex-direction:column;gap:0;';

            const usernameField = this._createField('用户名', 'text', 'username');
            form.appendChild(usernameField);

            const passwordField = this._createField('密码', 'password', 'password');
            form.appendChild(passwordField);

            const loginBtn = document.createElement('button');
            loginBtn.className = 'q-login-page__btn';
            loginBtn.textContent = '登录';
            loginBtn.type = 'submit';
            form.appendChild(loginBtn);

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('登录功能待实现');
            });

            card.appendChild(form);

            const links = document.createElement('div');
            links.style.cssText = 'display:flex;justify-content:space-between;margin-top:16px;font-size:12px;';
            links.innerHTML = `
                <a href="#" style="color:var(--q-demo-accent);text-decoration:none;">忘记密码?</a>
                <a href="#/" style="color:var(--q-demo-accent);text-decoration:none;">返回首页</a>
            `;
            links.querySelectorAll('a')[1].addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '#/';
            });
            card.appendChild(links);
        },

        _createField(label: string, type: string, name: string): HTMLElement {
            const field = document.createElement('div');
            field.className = 'q-login-page__field';

            const labelEl = document.createElement('label');
            labelEl.className = 'q-login-page__label';
            labelEl.textContent = label;
            field.appendChild(labelEl);

            const input = document.createElement('input');
            input.className = 'q-login-page__input';
            input.type = type;
            input.name = name;
            input.placeholder = `请输入${label}`;
            field.appendChild(input);

            return field;
        },
    },
});

export type LoginPage = InstanceType<typeof LoginPage>;