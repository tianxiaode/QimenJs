/**
 * 一键启动所有服务
 * 
 * 启动顺序：auth-server → abp-api → spring-api → client
 */
const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const processes = [];

/**
 * 检查端口是否被占用
 */
function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(true));
        server.once('listening', () => { server.close(); resolve(false); });
        server.listen(port);
    });
}

/**
 * 等待端口可用
 */
async function waitForPort(port, maxWait = 5000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
        if (!(await isPortInUse(port))) return true;
        await new Promise(r => setTimeout(r, 500));
    }
    return false;
}

function startService(name, cwd, command, args = []) {
    console.log(`[start] 启动 ${name}...`);
    const proc = spawn(command, args, {
        cwd: path.resolve(ROOT, cwd),
        stdio: 'pipe',
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach((line) => {
            if (line) console.log(`[${name}] ${line}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach((line) => {
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

    // 检查端口占用
    const ports = [3000, 3001, 3002, 5173];
    for (const port of ports) {
        if (await isPortInUse(port)) {
            console.error(`[error] 端口 ${port} 已被占用，请先停止占用进程`);
            console.error(`  可运行: npm run stop`);
            process.exit(1);
        }
    }

    // 1. 启动 auth-server
    startService('auth-server', 'servers/auth-server', 'node', [path.resolve(ROOT, 'servers/auth-server/index.js')]);
    await sleep(1000);

    // 2. 启动 abp-api
    startService('abp-api', 'servers/abp-api', 'node', [path.resolve(ROOT, 'servers/abp-api/index.js')]);
    await sleep(500);

    // 3. 启动 spring-api
    startService('spring-api', 'servers/spring-api', 'node', [path.resolve(ROOT, 'servers/spring-api/index.js')]);
    await sleep(500);

    // 4. 启动前端
    console.log('[start] 启动前端开发服务器...');
    if (process.platform === 'win32') {
        // Windows: 用 cmd.exe 执行 vite.cmd
        const vitePath = path.resolve(ROOT, 'node_modules/.bin/vite.cmd');
        startService('client', 'client', 'cmd.exe', ['/c', vitePath]);
    } else {
        const vitePath = path.resolve(ROOT, 'node_modules/.bin/vite');
        startService('client', 'client', vitePath, []);
    }

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
            proc.kill();
        });
        setTimeout(() => process.exit(0), 1000);
    });
}

main().catch(console.error);
