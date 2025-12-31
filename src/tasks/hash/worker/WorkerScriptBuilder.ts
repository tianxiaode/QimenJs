
export class WorkerScriptBuilder {
    // 这里建议直接把模板内容嵌入或通过构建工具导入
    private readonly template = `
        // --- 注入的算法开始 ---
        const userAlgorithm = {{ALGORITHM_PLACEHOLDER}};
        // --- 注入的算法结束 ---

        self.onmessage = async function(e) {
            const { type, data, chunkId } = e.data;
            
            try {
                if (type === 'update') {
                    // 调用注入的算法
                    const result = await userAlgorithm(data);
                    self.postMessage({ type: 'ack', chunkId, result });
                } else if (type === 'reset') {
                    self.postMessage({ type: 'ack' });
                }
            } catch (error) {
                self.postMessage({ type: 'error', message: error.message });
            }
        };
    `;

    /**
     * 将算法转换成 Worker 可执行的源码
     */
    build(algorithm: ((data: ArrayBuffer) => any) | string): string {
        let fnString = '';

        if (typeof algorithm === 'function') {
            // 如果是函数，直接 toString()
            fnString = algorithm.toString();
        } else {
            // 如果是字符串（比如 'md5'），可以映射到内置的简单实现或 Web Crypto
            fnString = this.getBuiltInAlgorithm(algorithm);
        }

        return this.template.replace('{{ALGORITHM_PLACEHOLDER}}', fnString);
    }

    private getBuiltInAlgorithm(name: string): string {
        // 示例：映射到浏览器原生的 Web Crypto (注意 digest 不支持流式，这只是示例)
        return `async (data) => {
            const hashBuffer = await self.crypto.subtle.digest('${name.toUpperCase()}', data);
            return hashBuffer;
        }`;
    }
}