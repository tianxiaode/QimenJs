/**
 * 一键启动所有服务
 * 
 * 启动顺序：auth-server → abp-api → spring-api → client
 */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const processes = [];

function startService(name, cwd, command, args = []) {
    console.log(`[start] 启动 ${name}...`);
    const proc = spawn(command, args, {
        cwd: path.resolve(ROOT, cwd),
        shell: true,
        stdio: 'pipe',
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach((line: string) => {
            if (line) console.log(`[${name}] ${line}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach((line: string) => {
            if (line) console.error(`[${name}] ${line}`);
        });
    });

    proc.on('close', (code) => {
        console.log(`[${name}] 进程退出，code=${code}`);
    });

    processes.push({ name, proc });
    return proc;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('=== OrbitJS 全栈示例启动 ===\n');

    // 1. 启动 auth-server
    startService('auth-server', 'servers/auth-server', 'node', ['index.js']);
    await sleep(1000);

    // 2. 启动 abp-api
    startService('abp-api', 'servers/abp-api', 'node', ['index.js']);
    await sleep(500);

    // 3. 启动 spring-api
    startService('spring-api', 'servers/spring-api', 'node', ['index.js']);
    await sleep(500);

    // 4. 启动前端
    console.log('[start] 启动前端开发服务器...');
    startService('client', 'client', 'npx', ['vite']);

    console.log('\n=== 所有服务已启动 ===');
    console.log('  auth-server:  http://localhost:3000');
    console.log('  abp-api:      http://localhost:3001');
    console.log('  spring-api:   http://localhost:3002');
    console.log('  client:       http://localhost:5173');
    console.log('\n按 Ctrl+C 停止所有服务\n');

    // 优雅退出
    process.on('SIGINT', () => {
        console.log('\n[stop] 正在停止所有服务...');
        processes.forEach(({ name, proc }) => {
            console.log(`[stop] 停止 ${name}...`);
            proc.kill('SIGTERM');
        });
        setTimeout(() => process.exit(0), 1000);
    });
}

main().catch(console.error);
