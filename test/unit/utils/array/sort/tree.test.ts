import { toTree, TreeOptions } from '@/utils/array/sort/tree';
import { OrderCondition } from '@/utils/array/sort/sort';

interface TestItem {
    id: number;
    name: string;
    parentId: number | null;
    value?: string;
}

// 定义树节点类型，它应该包含原始项目的所有属性加上 children 属性
type TreeNode<T> = T & { children: TreeNode<T>[] };

describe('toTree', () => {
    const testData: TestItem[] = [
        { id: 1, name: 'Parent 1', parentId: null },
        { id: 2, name: 'Child 1', parentId: 1 },
        { id: 3, name: 'Child 2', parentId: 1 },
        { id: 4, name: 'Grandchild 1', parentId: 2 },
        { id: 5, name: 'Parent 2', parentId: null },
        { id: 6, name: 'Child 3', parentId: 5 },
    ];

    it('should convert flat data to tree structure', () => {
        const result = toTree<TestItem>(testData) as TreeNode<TestItem>[];

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('id', 1);
        expect(result[0]).toHaveProperty('children');
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0]).toHaveProperty('id', 2);
        expect(result[0].children[0]).toHaveProperty('children');
        expect(result[0].children[0].children).toHaveLength(1);
        expect(result[0].children[0].children[0]).toHaveProperty('id', 4);
        expect(result[1]).toHaveProperty('id', 5);
        expect(result[1]).toHaveProperty('children');
        expect(result[1].children).toHaveLength(1);
    });

    it('should handle custom field names', () => {
        interface CustomItem {
            key: number;
            label: string;
            parentKey: number | null;
        }

        // 定义带有自定义子节点字段的类型
        type CustomTreeNode = CustomItem & { subItems: CustomTreeNode[] };

        const customData: CustomItem[] = [
            { key: 1, label: 'Root', parentKey: null },
            { key: 2, label: 'Child', parentKey: 1 },
        ];

        const options: TreeOptions<CustomItem> = {
            idField: 'key',
            parentField: 'parentKey',
            childrenField: 'subItems',
        };

        const result = toTree(customData, options) as CustomTreeNode[];

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('key', 1);
        expect(result[0]).toHaveProperty('subItems');
        expect(result[0].subItems).toHaveLength(1);
        expect(result[0].subItems[0]).toHaveProperty('key', 2);
    });

    it('should sort nodes at each level when sort conditions are provided', () => {
        interface SortableItem {
            id: number;
            name: string;
            parentId: number | null;
            order: number;
        }

        const unsortedData: SortableItem[] = [
            { id: 1, name: 'Parent', parentId: null, order: 2 },
            { id: 2, name: 'Child B', parentId: 1, order: 2 },
            { id: 3, name: 'Child A', parentId: 1, order: 1 },
            { id: 4, name: 'Another Parent', parentId: null, order: 1 },
        ];

        const options: TreeOptions<SortableItem> = {
            orderBy: [{ by: 'order', order: 'asc' }],
        };

        const result = toTree(unsortedData, options) as TreeNode<SortableItem>[];

        // Parents should be sorted by order: Another Parent (id:4) first, then Parent (id:1)
        expect(result[0]).toHaveProperty('id', 4);
        expect(result[1]).toHaveProperty('id', 1);

        // Children under first parent should be sorted by order: Child A first, then Child B
        expect(result[1].children[0]).toHaveProperty('name', 'Child A');
        expect(result[1].children[1]).toHaveProperty('name', 'Child B');
    });

    it('should handle empty array', () => {
        const result = toTree<TestItem>([]);
        expect(result).toEqual([]);
    });

    it('should handle single item', () => {
        const singleItem: TestItem[] = [{ id: 1, name: 'Single', parentId: null }];
        const result = toTree(singleItem);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: 1,
            name: 'Single',
            parentId: null,
            children: [],
        });
    });

    it('should handle items with no children', () => {
        const noChildren: TestItem[] = [
            { id: 1, name: 'Root 1', parentId: null },
            { id: 2, name: 'Root 2', parentId: null },
        ];
        const result = toTree(noChildren);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('children', []);
        expect(result[1]).toHaveProperty('children', []);
    });

    it('should handle items with invalid parent IDs', () => {
        const invalidParentData: TestItem[] = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child', parentId: 999 }, // Non-existent parent
        ];
        const result = toTree(invalidParentData);

        // Item with invalid parent ID should be treated as root
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(2);
    });

    it('should handle null parent field values', () => {
        const nullParentData: TestItem[] = [
            { id: 1, name: 'Root', parentId: null },
            { id: 2, name: 'Child', parentId: null },
        ];
        const result = toTree(nullParentData);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(2);
    });

    it('should handle multi-level nested items with sorting', () => {
        const multiLevelItems = [
            { id: 1, name: 'Parent A', parentId: null },
            { id: 2, name: 'Child A1', parentId: 1 },
            { id: 3, name: 'Child A2', parentId: 1 },
            { id: 4, name: 'Grandchild A1a', parentId: 2 },
            { id: 5, name: 'Grandchild A1b', parentId: 2 },
            { id: 6, name: 'Parent B', parentId: null },
            { id: 7, name: 'Child B1', parentId: 6 },
        ];

        const result = toTree(multiLevelItems, {
            idField: 'id',
            parentField: 'parentId',
            childrenField: 'children',
            orderBy: [{ by: 'name' }] as OrderCondition<any>[],
        });

        // Define a type for our tree nodes to help with typing
        type TreeNode = typeof multiLevelItems[number] & { children?: TreeNode[] };

        // Verify structure
        expect(result).toHaveLength(2);
        expect((result[0] as TreeNode).name).toBe('Parent A');
        expect((result[1] as TreeNode).name).toBe('Parent B');

        // Check first parent's children
        expect((result[0] as TreeNode).children).toBeDefined();
        expect((result[0] as TreeNode).children!).toHaveLength(2);
        expect((result[0] as TreeNode).children![0].name).toBe('Child A1');
        expect((result[0] as TreeNode).children![1].name).toBe('Child A2');

        // Check grandchildren under Child A1
        expect((result[0] as TreeNode).children![0].children).toBeDefined();
        expect((result[0] as TreeNode).children![0].children).toHaveLength(2);
        expect((result[0] as TreeNode).children![0].children![0].name).toBe('Grandchild A1a');
        expect((result[0] as TreeNode).children![0].children![1].name).toBe('Grandchild A1b');
    });

    it('should handle nodes with and without children', () => {
        const itemsWithMixedChildren = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child with no sub-children', parentId: 1 },
            { id: 3, name: 'Child with sub-children', parentId: 1 },
            { id: 4, name: 'Sub-child', parentId: 3 },
            { id: 5, name: 'Another Parent', parentId: null }, // This one has no children
        ];

        const result = toTree(itemsWithMixedChildren, {
            idField: 'id',
            parentField: 'parentId',
            childrenField: 'children',
            orderBy: [{ by: 'name' }] as OrderCondition<any>[],
        });

        // Define a type for our tree nodes to help with typing
        type TreeNode = typeof itemsWithMixedChildren[number] & { children?: TreeNode[] };

        // Root level parents
        expect(result).toHaveLength(2);

        // Find the parent that has no children (id=5, "Another Parent")
        const parentWithoutChildren = result.find((node: any) => node.id === 5);
        expect(parentWithoutChildren).toBeDefined();
        // Node without children should have an empty children array
        expect((parentWithoutChildren as TreeNode).children).toHaveLength(0);

        // Find the parent that has children (id=1, "Parent")
        const parentWithChildren = result.find((node: any) => node.id === 1);
        expect(parentWithChildren).toBeDefined();
        expect((parentWithChildren as TreeNode).children).toBeDefined();
        expect((parentWithChildren as TreeNode).children).toHaveLength(2);
            
        // Find the child that itself has children
        if ((parentWithChildren as TreeNode).children) {
            const childWithSubChildren = (parentWithChildren as TreeNode).children!.find(
                (child: any) => child.name === 'Child with sub-children'
            );
                
            if (childWithSubChildren) {
                // This child should have its own sub-child
                expect(childWithSubChildren.children).toBeDefined();
                expect(childWithSubChildren.children).toHaveLength(1);
                expect(childWithSubChildren.children![0].name).toBe('Sub-child');
            }
        }
    });

    it('should handle nodes with no sort conditions', () => {
        const data: TestItem[] = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child', parentId: 1 },
        ];
        
        const options: TreeOptions<TestItem> = {
            orderBy: [], // Empty sort conditions
        };

        const result = toTree(data, options) as TreeNode<TestItem>[];
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
        expect(result[0]).toHaveProperty('children');
        expect(result[0].children).toHaveLength(1);
    });
    
    it('should keep empty children arrays by default', () => {
        const data: TestItem[] = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child without children', parentId: 1 },
        ];

        const result = toTree(data) as TreeNode<TestItem>[];

        // Without removeEmptyChildren option, empty arrays should be preserved
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('children');
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0]).toHaveProperty('children'); // Should have children property as an empty array
        expect(result[0].children[0].children).toHaveLength(0);
    });

    it('should remove empty children arrays when removeEmptyChildren is true', () => {
        const data: TestItem[] = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child without children', parentId: 1 },
            { id: 3, name: 'Child with children', parentId: 1 },
            { id: 4, name: 'Grandchild', parentId: 3 },
        ];

        const options: TreeOptions<TestItem> = {
            removeEmptyChildren: true,
        };

        const result = toTree(data, options) as TreeNode<TestItem>[];

        // The child without any children (id=2) should not have a children property
        const childWithoutChildren = result[0].children.find((child: any) => child.id === 2);
        expect(childWithoutChildren).toBeDefined();
        expect(childWithoutChildren).not.toHaveProperty('children'); // Should not have the children property at all

        // The child with children (id=3) should still have a children property
        const childWithChildren = result[0].children.find((child: any) => child.id === 3);
        expect(childWithChildren).toBeDefined();
        expect(childWithChildren).toHaveProperty('children');
        expect(childWithChildren!.children).toHaveLength(1);
    });

    it('should preserve children arrays when they have content and removeEmptyChildren is true', () => {
        const data: TestItem[] = [
            { id: 1, name: 'Parent', parentId: null },
            { id: 2, name: 'Child with children', parentId: 1 },
            { id: 3, name: 'Grandchild', parentId: 2 },
        ];

        const options: TreeOptions<TestItem> = {
            removeEmptyChildren: true,
        };

        const result = toTree(data, options) as TreeNode<TestItem>[];

        // Root parent should have children
        expect(result[0]).toHaveProperty('children');
        expect(result[0].children).toHaveLength(1);

        // Child with actual children should still have the children property
        expect(result[0].children[0]).toHaveProperty('children');
        expect(result[0].children[0].children).toHaveLength(1);
    });
});