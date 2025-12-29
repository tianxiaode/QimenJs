/**
 * 重复执行指定函数指定次数，每次间隔指定时间
 * 
 * @param times - 重复执行的次数
 * @param interval - 每次执行之间的时间间隔（毫秒）
 * @param fn - 需要重复执行的函数
 * @returns 一个包含cancel方法的对象，用于取消重复执行
 */
export function repeat(times: number, interval: number, fn: () => void): { cancel(): void } {
    let count = 0;
    let active = true;

    const id = setInterval(() => {
        if (!active) return;
        fn();
        count++;
        if (count >= times) {
            clearInterval(id);
            active = false;
        }
    }, interval);

    return {
        /**
         * 取消重复执行
         */
        cancel() {
            if (!active) return;
            active = false;
            clearInterval(id);
        },
    };
}