import { VirtualScrollEntityManager } from './VirtualScrollEntityManager';

function generateMockData(count: number = 10000): any[] {
    const depts = ['技术部', '市场部', '管理层', '财务部', '运营部'];
    const names = ['张', '李', '王', '赵', '孙', '周', '吴', '郑', '钱', '冯',
        '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤'];
    const data: any[] = [];
    for (let i = 1; i <= count; i++) {
        data.push({
            id: i,
            name: `${names[i % names.length]}${i}`,
            age: 20 + (i % 30),
            dept: depts[i % depts.length],
            salary: 8000 + (i % 10) * 2000,
            email: `user${i}@co.com`,
            phone: `1${String(30000000 + i).slice(0, 8)}`,
        });
    }
    return data;
}

export class MockVirtualScrollEntityManager extends VirtualScrollEntityManager {
    static entityType: string = 'mock-virtual-scroll';

    constructor(config?: Record<string, any>) {
        super({ ...config, mockData: generateMockData() });
    }
}

MockVirtualScrollEntityManager.register();
