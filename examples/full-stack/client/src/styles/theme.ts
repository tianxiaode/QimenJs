/**
 * OrbitJS 管理模板 - 全局样式
 *
 * Linear Aesthetic 风格：暗色主题、超细边框、玻璃拟态、微光效果
 */

export const CSS = `
/* ===== Reset & Base ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 14px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #050506;
    color: #EDEDEF;
    letter-spacing: -0.01em;
    line-height: 1.5;
    overflow: hidden;
    height: 100vh;
}
a { color: #6366F1; text-decoration: none; }
a:hover { color: #818CF8; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ===== Layout ===== */
.app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
    width: 240px;
    min-width: 240px;
    background: #0A0A0B;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
}
.sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 1px; height: 100%;
    background: linear-gradient(180deg, rgba(99,102,241,0.3), transparent 40%, transparent 60%, rgba(168,85,247,0.2));
}
.sidebar-brand {
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-brand h1 {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #6366F1, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.sidebar-brand span {
    font-size: 11px;
    color: #8A8F98;
    display: block;
    margin-top: 2px;
}
.sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    overflow-y: auto;
}
.nav-group {
    margin-bottom: 8px;
}
.nav-group-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #565B66;
    padding: 8px 12px 4px;
}
.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    color: #A1A1AA;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    border: 1px solid transparent;
}
.nav-item:hover {
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
}
.nav-item.active {
    background: rgba(99,102,241,0.1);
    color: #EDEDEF;
    border-color: rgba(99,102,241,0.2);
}
.nav-item.active::before {
    content: '';
    position: absolute;
    left: -8px; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 16px;
    border-radius: 0 2px 2px 0;
    background: #6366F1;
}
.nav-icon {
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    opacity: 0.7;
}
.nav-item.active .nav-icon { opacity: 1; }
.nav-badge {
    margin-left: auto;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
    background: rgba(99,102,241,0.2);
    color: #818CF8;
}

/* ===== Main Content ===== */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #050506;
}

/* ===== Top Bar ===== */
.topbar {
    height: 52px;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(5,5,6,0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
    z-index: 5;
}
.topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.topbar-breadcrumb {
    font-size: 13px;
    color: #8A8F98;
}
.topbar-breadcrumb span { color: #EDEDEF; }
.topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}
.topbar-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8A8F98;
}
.status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4CAF50;
    box-shadow: 0 0 6px rgba(76,175,80,0.5);
}
.status-dot.offline { background: #f44336; box-shadow: 0 0 6px rgba(244,67,54,0.5); }

/* ===== Page Content ===== */
.page-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}
.page-header {
    margin-bottom: 24px;
}
.page-header h2 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #EDEDEF;
}
.page-header p {
    font-size: 13px;
    color: #8A8F98;
    margin-top: 4px;
}

/* ===== Cards ===== */
.card {
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s ease;
}
.card:hover {
    border-color: rgba(255,255,255,0.1);
}
.card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}
.card:hover::before { opacity: 1; }
.card-title {
    font-size: 13px;
    font-weight: 500;
    color: #8A8F98;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.card-title .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
}

/* ===== Stat Cards ===== */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.stat-card {
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
}
.stat-card .stat-value {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #EDEDEF;
}
.stat-card .stat-label {
    font-size: 12px;
    color: #8A8F98;
    margin-top: 2px;
}
.stat-card .stat-change {
    font-size: 11px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}
.stat-change.up { color: #4CAF50; }
.stat-change.down { color: #f44336; }

/* ===== Tables ===== */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.data-table thead th {
    text-align: left;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #565B66;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.data-table tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #A1A1AA;
}
.data-table tbody tr:hover {
    background: rgba(255,255,255,0.02);
}
.data-table tbody tr:hover td { color: #EDEDEF; }

/* ===== Badges ===== */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.01em;
}
.badge-success { background: rgba(76,175,80,0.15); color: #66BB6A; }
.badge-warning { background: rgba(255,152,0,0.15); color: #FFA726; }
.badge-danger  { background: rgba(244,67,54,0.15); color: #EF5350; }
.badge-info    { background: rgba(33,150,243,0.15); color: #42A5F5; }
.badge-purple  { background: rgba(168,85,247,0.15); color: #BA68C8; }
.badge-muted   { background: rgba(255,255,255,0.06); color: #8A8F98; }

/* ===== Buttons ===== */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    outline: none;
    font-family: inherit;
}
.btn-primary {
    background: #6366F1;
    color: #fff;
    box-shadow: 0 0 12px rgba(99,102,241,0.3);
}
.btn-primary:hover {
    background: #4F46E5;
    box-shadow: 0 0 20px rgba(99,102,241,0.4);
}
.btn-ghost {
    background: transparent;
    color: #A1A1AA;
    border-color: rgba(255,255,255,0.1);
}
.btn-ghost:hover {
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
    border-color: rgba(255,255,255,0.15);
}
.btn-danger {
    background: rgba(244,67,54,0.15);
    color: #EF5350;
    border-color: rgba(244,67,54,0.2);
}
.btn-danger:hover {
    background: rgba(244,67,54,0.25);
}
.btn-sm { padding: 4px 10px; font-size: 11px; }

/* ===== Inputs ===== */
.input {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease;
    width: 100%;
}
.input:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
}
.input::placeholder { color: #565B66; }

/* ===== Grid ===== */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* ===== Section ===== */
.section { margin-bottom: 24px; }
.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #EDEDEF;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.section-title::before {
    content: '';
    width: 3px; height: 14px;
    border-radius: 2px;
    background: linear-gradient(180deg, #6366F1, #A855F7);
}

/* ===== Pagination ===== */
.pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 12px;
    color: #8A8F98;
}
.pagination .page-info {
    padding: 0 8px;
}

/* ===== Tree ===== */
.tree-node {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #A1A1AA;
    transition: all 0.1s ease;
}
.tree-node:hover { background: rgba(255,255,255,0.04); color: #EDEDEF; }
.tree-toggle { font-size: 10px; color: #565B66; width: 14px; text-align: center; }
.tree-leaf { width: 14px; }

/* ===== Loading ===== */
.loading-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    height: 16px;
    margin: 4px 0;
}
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ===== Error ===== */
.error-msg {
    padding: 10px 14px;
    background: rgba(244,67,54,0.1);
    border: 1px solid rgba(244,67,54,0.2);
    border-radius: 6px;
    color: #EF5350;
    font-size: 13px;
}

/* ===== Login Page ===== */
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #050506;
    position: relative;
    overflow: hidden;
}
.login-page::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.06) 0%, transparent 50%);
}
.login-card {
    width: 380px;
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 32px;
    position: relative;
    z-index: 1;
}
.login-card h2 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
}
.login-card .subtitle {
    font-size: 13px;
    color: #8A8F98;
    margin-bottom: 24px;
}
.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #8A8F98;
    margin-bottom: 6px;
}
.login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: #565B66;
    font-size: 11px;
}
.login-divider::before, .login-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
}
.login-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11px;
    color: #565B66;
}

/* ===== Flex helpers ===== */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.text-sm { font-size: 12px; }
.text-muted { color: #8A8F98; }
.text-xs { font-size: 11px; }
.w-full { width: 100%; }
`;
