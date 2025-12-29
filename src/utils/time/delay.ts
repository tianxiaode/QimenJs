export function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, Math.max(0, ms));
    });
}
