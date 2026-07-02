/**
 * 停止所有服务
 */
const { exec } = require('child_process');

function stop() {
    console.log('[stop] 正在停止所有服务...');

    // Windows
    if (process.platform === 'win32') {
        exec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq orbitjs*" 2>nul', (err) => {
            if (!err) console.log('[stop] 已停止 Node.js 进程');
        });
    } else {
        // Unix
        exec('pkill -f "servers/(auth-server|abp-api|spring-api)" 2>/dev/null', (err) => {
            if (!err) console.log('[stop] 已停止后端服务');
        });
    }

    console.log('[stop] 完成');
}

stop();
