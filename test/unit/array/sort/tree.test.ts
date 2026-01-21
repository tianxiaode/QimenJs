
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
            // Node without children should have an empty children array or undefined
            // If it's defined, it's likely an empty array
            if ((parentWithoutChildren as TreeNode).children !== undefined) {
                expect((parentWithoutChildren as TreeNode).children).toHaveLength(0);
            }

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