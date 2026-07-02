/**
 * 停止所有服务
 */
const { exec } = require('child_process');

function stop() {
    console.log('[stop] 正在停止所有服务...');

    if (process.platform === 'win32') {
        // Windows: 查找占用端口的进程并终止
        [3000, 3001, 3002, 5173].forEach(port => {
            exec(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`, (err) => {
                if (!err) console.log(`[stop] 已停止端口 ${port} 上的进程`);
            });
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
