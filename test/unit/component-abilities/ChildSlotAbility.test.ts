/**
 * ChildSlotAbility 单元测试
 *
 * 覆盖：_replaceChildComponent
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { Component } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { ChildSlotAbility } from '@/component-abilities/render/ChildSlotAbility';

const TPL: ComponentTemplate = {
    tpl: { tag: 'div', name: 'slot:child', content: 'child' },
};

const HostClass = Component.withTemplate(TPL).with([ChildSlotAbility]);

describe('ChildSlotAbility', () => {
    describe('_replaceChildComponent', () => {
        it('替换子组件', () => {
            const host = new HostClass() as any;
            if (!host.nodeMapMgr?.replace) return;
            const mockReplace = jest
                .spyOn(host.nodeMapMgr, 'replace')
                .mockReturnValue({ el: document.createElement('div') });
            const mockGetAll = jest.spyOn(host.nodeMapMgr, 'getAll').mockReturnValue({});

            class NewComp {
                el = document.createElement('span');
            }

            const result = host._replaceChildComponent('child', NewComp, {});
            expect(mockReplace).toHaveBeenCalledWith('child', NewComp, {});
            expect(result).toBeTruthy();
        });

        it('nodeMapMgr.replace 返回 null 时返回 null', () => {
            const host = new HostClass() as any;
            if (!host.nodeMapMgr?.replace) return;
            jest.spyOn(host.nodeMapMgr, 'replace').mockReturnValue(null);
            jest.spyOn(host.nodeMapMgr, 'getAll').mockReturnValue({});

            class NewComp {
                el = document.createElement('span');
            }

            const result = host._replaceChildComponent('child', NewComp);
            expect(result).toBeNull();
        });
    });
});
