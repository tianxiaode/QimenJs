/**
 * TokenService 单元测试
 */

import { TokenService } from '@/auth';

describe('TokenService', () => {
    let tokenService: TokenService;
    
    beforeEach(() => {
        tokenService = TokenService.getInstance();
        tokenService.clearAll();
    });
    
    describe('setToken and getToken', () => {
        it('should set and get token', async () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() + 3600000,
            });
            
            const token = await tokenService.getToken('test');
            expect(token).toBe('test-token');
        });
        
        it('should return null for non-existent token', async () => {
            const token = await tokenService.getToken('non-existent');
            expect(token).toBeNull();
        });
        
        it('should return null for expired token', async () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() - 1000, // 已过期
            });
            
            const token = await tokenService.getToken('test');
            expect(token).toBeNull();
        });
    });
    
    describe('auto refresh', () => {
        it('should auto refresh token when needed', async () => {
            const refreshHandler = jest.fn().mockResolvedValue({
                token: 'new-token',
                expires: Date.now() + 3600000,
            });
            
            tokenService.setToken('test', {
                token: 'old-token',
                expires: Date.now() + 30000, // 30秒后过期，小于刷新阈值
            }, {
                refreshThreshold: 60000, // 1分钟
                autoRefresh: true,
            });
            
            tokenService.setRefreshHandler('test', refreshHandler);
            
            const token = await tokenService.getToken('test');
            
            expect(refreshHandler).toHaveBeenCalled();
            expect(token).toBe('new-token');
        });
        
        it('should not auto refresh when disabled', async () => {
            const refreshHandler = jest.fn().mockResolvedValue({
                token: 'new-token',
                expires: Date.now() + 3600000,
            });
            
            tokenService.setToken('test', {
                token: 'old-token',
                expires: Date.now() + 30000,
            }, {
                refreshThreshold: 60000,
                autoRefresh: false,
            });
            
            tokenService.setRefreshHandler('test', refreshHandler);
            
            const token = await tokenService.getToken('test');
            
            expect(refreshHandler).not.toHaveBeenCalled();
            expect(token).toBe('old-token');
        });
    });
    
    describe('isValid', () => {
        it('should return true for valid token', () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() + 3600000,
            });
            
            expect(tokenService.isValid('test')).toBe(true);
        });
        
        it('should return false for expired token', () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() - 1000,
            });
            
            expect(tokenService.isValid('test')).toBe(false);
        });
        
        it('should return false for non-existent token', () => {
            expect(tokenService.isValid('non-existent')).toBe(false);
        });
    });
    
    describe('clearToken', () => {
        it('should clear token', async () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() + 3600000,
            });
            
            tokenService.clearToken('test');
            
            const token = await tokenService.getToken('test');
            expect(token).toBeNull();
        });
    });
    
    describe('getRemainingTime', () => {
        it('should return remaining time', () => {
            const expires = Date.now() + 3600000;
            tokenService.setToken('test', {
                token: 'test-token',
                expires,
            });
            
            const remaining = tokenService.getRemainingTime('test');
            expect(remaining).toBeGreaterThan(3599000);
            expect(remaining).toBeLessThanOrEqual(3600000);
        });
        
        it('should return 0 for expired token', () => {
            tokenService.setToken('test', {
                token: 'test-token',
                expires: Date.now() - 1000,
            });
            
            const remaining = tokenService.getRemainingTime('test');
            expect(remaining).toBe(0);
        });
    });
    
    describe('refreshToken', () => {
        it('should manually refresh token', async () => {
            const refreshHandler = jest.fn().mockResolvedValue({
                token: 'new-token',
                expires: Date.now() + 3600000,
            });
            
            tokenService.setToken('test', {
                token: 'old-token',
                expires: Date.now() + 3600000,
            });
            
            tokenService.setRefreshHandler('test', refreshHandler);
            
            const newData = await tokenService.refreshToken('test');
            
            expect(refreshHandler).toHaveBeenCalled();
            expect(newData?.token).toBe('new-token');
        });
    });
});
