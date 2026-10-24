# @604138300-web/openclaw-ai-balance

在 OpenClaw Control 侧边栏显示 AI 提供商的**实时余额**。

## 功能

- 侧边栏新增「AI 余额」页面
- 显示 DeepSeek 等提供商的当前余额（CNY）
- 一键刷新，自动从提供商 API 拉取最新数据
- 自动从 OpenClaw 的认证存储读取 API key，无需额外配置

## 安装

```bash
openclaw plugins install @604138300-web/openclaw-ai-balance
```

然后在 OpenClaw Control 中启用：

**Settings → Labs → Custom plugin UI** 打开开关，刷新面板即可在侧边栏看到「AI 余额」。

## 支持

- DeepSeek（`https://api.deepseek.com/user/balance`）

其他提供商欢迎提 issue。

## 原理

插件注册了一个同源 HTTP 端点 `/plugins/ai-balance/balances`：

1. 从 OpenClaw 的 `auth_profile_store` 读取已配置的 API key
2. 调用提供商的余额 API
3. 返回 JSON 给前端页面

原生 UI 需要 OpenClaw >= 2026.10.6，且启用 Custom plugin UI 实验室功能。

## License

MIT
