# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-04

### Added

- 27 个子包的初始实现，覆盖基础层到应用层
- 实体管理框架：Manager + Ability 架构，支持 CRUD、分页、搜索、排序
- 数据处理器管道：ABP / Spring Data 开箱即用的参数转换
- HTTP 客户端：拦截器、重试、缓存、请求上下文
- OAuth2 认证：授权码、密码、客户端凭证三种模式
- 国际化：i18n 预编译 + loadScript 动态加载语言包
- 事件系统：EventBus + EventScope + DOM 事件适配
- 数据管道：可组合的处理器链
- 能力组合：AbilityDefinition 动态组合能力
- Schema 定义：字段 + 验证规则
- 验证引擎：规则 + 链式验证
- 任务调度：队列 + 优先级
- 缓存管理：LRU + TTL
- 注册表：领域隔离的注册中心
- 运行时环境检测
- 哈希与编解码：MD5/SHA/XXHash/Base64
- 异步工具：重试、并发控制、超时
- MIME 类型解析
- 设计模式工具
- 全栈 Demo 示例（OAuth2 + ABP + Spring + 27 个功能演示页面）
- GitHub Actions 自动部署到 GitHub Pages
- GitHub Codespaces 一键启动完整演示环境
- API 文档（TypeDoc 生成）
- 最佳实践文档（i18n、composable、schema、http、data-processor）

### Note

- 本版本为初始开发版本（0.x.x），API 可能在后续版本中发生变化
- UI 组件层尚未实现，计划在后续版本中添加
