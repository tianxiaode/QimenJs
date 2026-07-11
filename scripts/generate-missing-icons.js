/**
 * 批量生成缺失的图标 SVG 文件
 *
 * 按照现有图标的风格（24x24 viewBox, stroke-based, currentColor），
 * 为 CSS 中定义但缺少 SVG 的图标生成占位文件。
 */

const fs = require('fs');
const path = require('path');

const svgDir = path.resolve(__dirname, '../src/icon/svg');

// 已有的图标
const existing = new Set(fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', '')));

// 所有需要生成的图标定义
const icons = {
  // ---- 通用操作 ----
  copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M4 16V4a1 1 0 011-1h12"/></svg>',
  paste: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="14" height="14" rx="1"/><path d="M6 10h14"/><rect x="10" y="3" width="4" height="3" rx="0.5"/></svg>',
  cut: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.6 15.4M20 20L8.6 8.6"/></svg>',
  undo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10h10a5 5 0 015 5v2"/><path d="M3 10l4-4M3 10l4 4"/></svg>',
  redo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10H11a5 5 0 00-5 5v2"/><path d="M21 10l-4-4M21 10l-4 4"/></svg>',
  print: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="14" width="12" height="7" rx="1"/><rect x="6" y="3" width="12" height="4" rx="1"/><path d="M6 7v7M18 7v7"/><rect x="3" y="10" width="18" height="7" rx="1"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
  unlock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
  export: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v12M12 3l4 4M12 3L8 7"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>',

  // ---- 导航操作 ----
  back: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M5 12l5-5M5 12l5 5"/></svg>',
  forward: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M19 12l-5-5M19 12l-5 5"/></svg>',
  up: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19V5M12 5l-5 5M12 5l5 5"/></svg>',
  down: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M12 19l-5-5M12 19l5-5"/></svg>',
  left: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M5 12l5-5M5 12l5 5"/></svg>',
  right: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M19 12l-5-5M19 12l-5 5"/></svg>',
  filter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h18M6 10h12M9 15h6M11 20h2"/></svg>',
  more: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>',
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M9 3v2M15 3v2M3 9h2M3 15h2"/></svg>',
  notification: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/><circle cx="18" cy="4" r="2" fill="currentColor"/></svg>',

  // ---- 状态提示 ----
  success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6" stroke-width="2" stroke-linecap="round"/></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3L2 21h20L12 3z"/><path d="M12 9v4M12 17h.01"/></svg>',
  error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6" stroke-width="2"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>',
  question: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 015.12 1.5c0 1.5-2.12 2-2.12 2"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>',
  'star-empty': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7 7 1-5 6 1 7-6-4-6 4 1-7-5-6 7-1 3-7z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 3 14 3 8.5A4.5 4.5 0 0112 6a4.5 4.5 0 019 2.5C21 14 12 21 12 21z"/></svg>',
  'heart-empty': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 3 14 3 8.5A4.5 4.5 0 0112 6a4.5 4.5 0 019 2.5C21 14 12 21 12 21z"/></svg>',
  flag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22V4"/><path d="M4 4c3-2 6 0 9-2s5 0 7 2c-2 2-4 4-7 2s-6 0-9 2"/></svg>',
  tag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>',

  // ---- 文件文档 ----
  'folder-open': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 19a2 2 0 01-2-2V5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1"/><path d="M2 10h20l-2 9H4l-2-9z"/></svg>',
  'file-open': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
  'file-pdf': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M9 15v-2h1.5a1.5 1.5 0 010 3H9M14 13h2M15 13v3"/></svg>',
  'file-word': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M9 13l1.5 4 1.5-4 1.5 4 1.5-4"/></svg>',
  'file-excel': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M9 13l2 3 2-3M9 19l2-3 2 3"/></svg>',
  'file-image': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><circle cx="10" cy="14" r="2"/><path d="M20 19l-4-4-4 4"/></svg>',
  'file-archive': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><rect x="10" y="12" width="4" height="6" rx="0.5"/><path d="M12 12v-2"/></svg>',
  'file-code': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M9 15l-2-2 2-2M15 11l2 2-2 2"/></svg>',

  // ---- 用户管理 ----
  users: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21 21c0-3-2-5-4.5-5"/></svg>',
  'user-add': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><path d="M17 6v6M14 9h6"/></svg>',
  'user-remove': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><path d="M14 9h6"/></svg>',
  'user-check': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><path d="M16 10l2 2 4-4" stroke-width="2" stroke-linecap="round"/></svg>',
  'user-clock': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.5 3-6 6-6"/><circle cx="17" cy="17" r="4"/><path d="M17 15v2l1.5 1"/></svg>',
  role: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 4-6 7-6s7 2 7 6"/><path d="M12 2l1 2h-2l1-2z" fill="currentColor"/></svg>',
  permission: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/><path d="M12 15v2" stroke-width="2"/></svg>',
  profile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M6 20c0-3 3-5 6-5s6 2 6 5"/></svg>',

  // ---- 日期时间 ----
  clock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  time: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M9 3h6"/></svg>',
  hourglass: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3h14M5 21h14"/><path d="M7 3v4l5 5-5 5v4M17 3v4l-5 5 5 5v4"/></svg>',

  // ---- 通讯消息 ----
  'mail-open': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/><path d="M2 20l7-5M22 20l-7-5"/></svg>',
  comment: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/><path d="M8 9h8M8 12h5"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  inbox: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 12h5l2 3h6l2-3h5"/></svg>',

  // ---- 数据图表 ----
  'chart-line': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 20h18"/><path d="M3 16l5-5 4 4 5-7 4 3"/></svg>',
  'chart-pie': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/></svg>',
  'chart-area': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 20h18"/><path d="M3 20V14l5-4 4 3 5-6 4 4v9"/><path d="M3 14l5-4 4 3 5-6 4 4" fill="currentColor" opacity="0.15"/></svg>',
  table: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',

  // ---- 电商/财务 ----
  cart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/><circle cx="9" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></svg>',
  wallet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="16" y="12" width="4" height="3" rx="1"/><path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2"/></svg>',
  coin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 8v8M10 10h4M10 14h4"/></svg>',
  credit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>',
  order: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
  invoice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 12h2v2H8zM14 12h2v2h-2zM8 16h2v2H8z"/></svg>',

  // ---- 中国风特色 ----
  dragon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8c0-3 3-5 6-5 2 0 3 1 4 2l2-1v3c1 1 2 3 1 5s-3 3-5 3"/><path d="M8 15c-2 1-4 3-3 5h14c0-2-1-4-3-5"/><path d="M10 11h.01M14 9h.01"/><path d="M5 8c1 2 3 3 5 3" stroke-width="1"/></svg>',
  phoenix: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c3 0 6 2 6 5s-2 5-5 6l-1 4"/><path d="M12 3C9 3 6 5 6 8s2 5 5 6"/><path d="M12 18c-2 1-4 3-3 4h6c1-1-1-3-3-4"/><path d="M8 6c1 1 2 1 3 0M13 6c1 1 2 1 3 0"/></svg>',
  lantern: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v3"/><path d="M8 5h8"/><path d="M8 5c-2 2-3 5-3 8s1 5 3 6h8c2-1 3-3 3-6s-1-6-3-8"/><path d="M8 19h8"/><path d="M12 19v3"/><path d="M10 22h4"/></svg>',
  teapot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 10c0-2 2-4 6-4s6 2 6 4v6c0 2-2 4-6 4s-6-2-6-4v-6z"/><path d="M18 12h3a1 1 0 011 1v2a1 1 0 01-1 1h-3"/><path d="M8 6c0-2 1-3 2-4M12 3c0-1 0-2 1-3"/></svg>',
  bamboo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2v20M9 6h6M9 12h5M9 18h4"/><path d="M9 6c-2-1-4 0-5 2M9 12c-2-1-4 0-5 2"/><path d="M15 4c1-1 3-1 4 0M14 10c1-1 3-1 4 0"/></svg>',
  plum: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/></svg>',
  seal: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="14" height="14" rx="1"/><rect x="8" y="8" width="8" height="8" rx="0.5"/><path d="M10 11h4M12 10v4"/></svg>',
  scroll: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4a2 2 0 00-2 2v1a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2"/><path d="M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9"/><path d="M9 13h6M9 16h4"/></svg>',
  abacus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18"/><circle cx="7" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="17" cy="6" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="18" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/><circle cx="17" cy="18" r="1.5" fill="currentColor"/></svg>',
  brush: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2l-8 8-1 4 4-1 8-8"/><path d="M10 14c-2 1-5 3-6 6 3-1 5-4 6-6z"/></svg>',
  ink: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="12" width="12" height="8" rx="1"/><path d="M9 12V8l3-4 3 4v4"/><circle cx="12" cy="16" r="1.5"/></svg>',
  fan: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 12c-3-4-2-8 0-9 2 1 3 5 0 9z"/><path d="M12 12c4-3 8-2 9 0-1 2-5 3-9 0z"/><path d="M12 12c3 4 2 8 0 9-2-1-3-5 0-9z"/><path d="M12 12c-4 3-8 2-9 0 1-2 5-3 9 0z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  temple: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V11l7-7 7 7v10"/><path d="M3 11h18"/><path d="M9 21v-5h6v5"/><path d="M9 16h6"/></svg>',
  greatwall: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20"/><path d="M4 20V14h4v-4h4v4h4v-6h4v12"/><path d="M4 14h4M12 14h4M20 8h-4"/><path d="M6 14v-2M14 14v-2M18 8v-2"/></svg>',
  china: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20"/><path d="M8 4l4-2 4 2"/><path d="M9 6h6"/><path d="M10 6v4l-3 2h10l-3-2V6"/><path d="M8 12l-3 4h14l-3-4"/><path d="M5 16l-2 4h18l-2-4"/></svg>',
  'yin-yang': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 000 9 4.5 4.5 0 010 9"/><circle cx="12" cy="7.5" r="1.5" fill="currentColor"/><circle cx="12" cy="16.5" r="1.5"/></svg>',
};

let generated = 0;
let skipped = 0;

for (const [name, svg] of Object.entries(icons)) {
  if (existing.has(name)) {
    skipped++;
    continue;
  }
  const filePath = path.join(svgDir, `${name}.svg`);
  fs.writeFileSync(filePath, svg + '\n', 'utf-8');
  generated++;
  console.log(`  ✓ ${name}.svg`);
}

console.log(`\n生成 ${generated} 个，跳过 ${skipped} 个（已存在）`);
