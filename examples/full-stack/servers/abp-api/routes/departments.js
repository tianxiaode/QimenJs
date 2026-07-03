/**
 * 模拟 ABP 部门树 API
 *
 * 端点：
 * - GET /api/departments          - 部门列表（支持 parentId 参数实现懒加载）
 * - GET /api/departments/:id      - 部门详情
 * - POST /api/departments         - 创建部门
 * - PUT /api/departments/:id      - 更新部门
 * - DELETE /api/departments/:id   - 删除部门
 *
 * 响应格式：ABP PagedResultDto（列表）或单个对象
 */
const { pagedResult } = require('../middleware/abp-response');

// 模拟部门数据（树形结构）
let departments = [
    { id: 1, name: '总公司', parentId: null, leaf: false, expanded: true, employeeCount: 150 },
    { id: 2, name: '研发部', parentId: 1, leaf: false, expanded: false, employeeCount: 60 },
    { id: 3, name: '市场部', parentId: 1, leaf: false, expanded: false, employeeCount: 30 },
    { id: 4, name: '财务部', parentId: 1, leaf: true, expanded: false, employeeCount: 15 },
    { id: 5, name: '前端组', parentId: 2, leaf: true, expanded: false, employeeCount: 20 },
    { id: 6, name: '后端组', parentId: 2, leaf: true, expanded: false, employeeCount: 25 },
    { id: 7, name: '测试组', parentId: 2, leaf: true, expanded: false, employeeCount: 15 },
    { id: 8, name: '品牌推广', parentId: 3, leaf: true, expanded: false, employeeCount: 15 },
    { id: 9, name: '渠道销售', parentId: 3, leaf: true, expanded: false, employeeCount: 15 },
    { id: 10, name: '人力资源', parentId: 1, leaf: true, expanded: false, employeeCount: 10 },
];

let nextId = 11;

const router = require('express').Router();

// 部门列表（支持懒加载：传 parentId 获取子节点）
router.get('/', (req, res) => {
    const { parentId, skipCount = 0, maxResultCount = 100 } = req.query;
    const skip = parseInt(skipCount);
    const take = parseInt(maxResultCount);

    let filtered;
    if (parentId !== undefined) {
        // 懒加载：返回指定父节点的子节点
        const pid = parentId === 'null' || parentId === '' ? null : parseInt(parentId);
        filtered = departments.filter(d => d.parentId === pid);
    } else {
        // 不传 parentId 时返回全部
        filtered = [...departments];
    }

    const paged = filtered.slice(skip, skip + take);
    res.json(pagedResult(paged, skip, filtered.length));
});

// 部门详情
router.get('/:id', (req, res) => {
    const dept = departments.find(d => d.id === parseInt(req.params.id));
    if (!dept) {
        return res.status(404).json({ error: { code: 404, message: 'Department not found' } });
    }
    res.json(dept);
});

// 创建部门
router.post('/', (req, res) => {
    const { name, parentId, employeeCount = 0 } = req.body;
    if (!name) {
        return res.status(400).json({
            error: {
                code: 400,
                message: 'Validation failed',
                validationErrors: [{ field: 'name', message: 'Department name is required' }],
            },
        });
    }

    const dept = {
        id: nextId++,
        name,
        parentId: parentId || null,
        leaf: true,
        expanded: false,
        employeeCount,
    };

    // 如果父节点存在，标记为非叶节点
    if (dept.parentId) {
        const parent = departments.find(d => d.id === dept.parentId);
        if (parent) {
            parent.leaf = false;
        }
    }

    departments.push(dept);
    res.status(201).json(dept);
});

// 更新部门
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dept = departments.find(d => d.id === id);
    if (!dept) {
        return res.status(404).json({ error: { code: 404, message: 'Department not found' } });
    }

    const { name, parentId, employeeCount } = req.body;
    if (name !== undefined) dept.name = name;
    if (parentId !== undefined) dept.parentId = parentId;
    if (employeeCount !== undefined) dept.employeeCount = employeeCount;

    res.json(dept);
});

// 删除部门
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) {
        return res.status(404).json({ error: { code: 404, message: 'Department not found' } });
    }

    // 级联删除子节点
    const idsToDelete = new Set([id]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const d of departments) {
            if (idsToDelete.has(d.parentId) && !idsToDelete.has(d.id)) {
                idsToDelete.add(d.id);
                changed = true;
            }
        }
    }

    departments = departments.filter(d => !idsToDelete.has(d.id));
    res.json({ success: true });
});

module.exports = router;
