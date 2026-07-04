/**
 * Token 持久化存储
 *
 * 支持三种存储方式：memory / localStorage / sessionStorage
 *
 * @module oauth2/TokenStorage
 */

import type { OAuth2TokenEntry } from './types';

const STORAGE_KEY = 'qimenjs_oauth2_token';

/**
 * Token 存储接口
 */
export interface ITokenStorage {
    get(): OAuth2TokenEntry | null;
    set(entry: OAuth2TokenEntry): void;
    clear(): void;
}

/**
 * 内存存储（默认）
 */
export class MemoryTokenStorage implements ITokenStorage {
    private entry: OAuth2TokenEntry | null = null;

    get(): OAuth2TokenEntry | null {
        return this.entry;
    }

    set(entry: OAuth2TokenEntry): void {
        this.entry = { ...entry };
    }

    clear(): void {
        this.entry = null;
    }
}

/**
 * localStorage 存储
 */
export class LocalStorageTokenStorage implements ITokenStorage {
    get(): OAuth2TokenEntry | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as OAuth2TokenEntry;
        } catch {
            return null;
        }
    }

    set(entry: OAuth2TokenEntry): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    }

    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * sessionStorage 存储
 */
export class SessionStorageTokenStorage implements ITokenStorage {
    get(): OAuth2TokenEntry | null {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as OAuth2TokenEntry;
        } catch {
            return null;
        }
    }

    set(entry: OAuth2TokenEntry): void {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    }

    clear(): void {
        sessionStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * 创建 Token 存储
 */
export function createTokenStorage(type?: 'memory' | 'localStorage' | 'sessionStorage'): ITokenStorage {
    switch (type) {
        case 'localStorage':
            return new LocalStorageTokenStorage();
        case 'sessionStorage':
            return new SessionStorageTokenStorage();
        default:
            return new MemoryTokenStorage();
    }
}
