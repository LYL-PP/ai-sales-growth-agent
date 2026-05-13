# AI Sales Growth Agent

> **AI 驱动的销售运营工作台（AI Growth Agent OS）**  
> 不是聊天机器人，是 AI 销售副驾驶。

![Status](https://img.shields.io/badge/status-MVP-green) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

##  产品定位

B2B 销售团队面临的核心矛盾：**线索多、跟进难、转化低**。

Growth Agent 解决的不是"如何聊天"，而是"AI 能不能帮销售判断：*该跟谁、说什么、什么时候说、要不要转人工*"。

它定位为 **AI 副驾驶（Co-pilot）**，而非 chatbot——销售仍然是决策者，AI 提供实时情报和策略建议。

---

##  核心功能

### 1.   Dashboard 运营总览

实时监控 AI 接管销售流程的全局指标：

- 今日新增用户 / 高意向客户 / AI 处理率 / 人工接管率
- 转化漏斗（线索 → 咨询 → 意向确认 → 签约）
- AI 主动推送的销售建议（流失预警、签约机会、竞品对比提醒）

### 2.  AI 销售分析（核心页面）

选定一个客户对话，AI 实时输出 6 层分析：

| 分析维度 | 输出内容 | AI 能力 |
|---------|---------|--------|
| 意图识别 | 价格异议 / 犹豫 / 高意向 / 观望 / 需求不明确 | 分类 |
| 阶段判断 | 初步咨询 → 对比 → 即将成交 → 流失风险 | 判断 |
| 风险评估 | 低 / 中 / 高 / 极高 + 风险因子 | 预测 |
| 策略建议 | 下一步行动清单（如"发送行业案例""安排客户分享会"） | 推理 |
| 推荐回复 | AI 生成的销售话术，一键复制 | 生成 |
| 接管决策 | 是否建议人工介入 + 理由 | 决策 |

### 3.  用户 360° 画像

CRM + AI 深度融合的单用户视图：

- 成交概率（环形图） + 风险等级
- 自动标签系统（意图 / 行为 / 人口属性 / 风险 / 价值）
- 行为时间线（点击、咨询、表单、电话）
- AI 用户洞察总结
- 结构化跟进策略（动作、渠道、时机）

---

##  AI 工作流设计

```
用户对话 → DeepSeek API（Prompt Engineering） → 结构化 JSON → 前端渲染
                ↓
        6 个分析维度并行输出
        （意图 / 阶段 / 风险 / 策略 / 回复 / 接管）
```

- 无需微调、无需向量库、无需 Agent 框架
- 单次 API 调用完成全部分析，延迟约 1-2 秒
- Prompt Engineering 实现决策链：分类 → 判断 → 推理 → 生成

---

##  产品设计理念

| 原则 | 实践 |
|------|------|
| **AI 副驾驶，非自动驾驶** | AI 做分析建议，销售做最终决策 |
| **先诊断，再开方** | 每个建议都有 reasoning（为什么这么判断） |
| **信息密度优先** | 一屏展示 6 维分析，不浪费面试官时间 |
| **B 端产品感** | 对标 Linear / Vercel / Retool 设计语言 |

---

## ️ 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| UI | TailwindCSS + shadcn/ui |
| AI | DeepSeek API (兼容 OpenAI SDK) |
| 状态 | React useState / useMemo（MVP 无状态管理库） |
| 数据 | 全 Mock 数据（模拟真实 B2B 销售场景） |

---

##  快速启动

```bash
# 1. 克隆
git clone https://github.com/LYL-PP/ai-sales-growth-agent.git
cd ai-sales-growth-agent

# 2. 安装依赖
npm install

# 3. 配置 API Key
echo "DEEPSEEK_API_KEY=sk-your-key-here" > .env.local

# 4. 启动
npm run dev
```

浏览器打开 `http://localhost:3000`：
- `/` — Dashboard
- `/analysis` — AI 销售分析（核心）
- `/profile/u1` — 用户画像

>  未配置 API Key 时，分析页会展示友好错误提示，不影响其他页面的 UI 演示。

---

##  项目结构

```
app/
├── page.tsx                  # Dashboard
├── analysis/page.tsx         # AI 销售分析（核心）
├── profile/[id]/page.tsx     # 用户画像
├── api/analyze/route.ts      # DeepSeek API 调用
└── layout.tsx                # 深色主题 + 侧边栏

components/
├── layout/sidebar.tsx        # 导航 + AI 处理率指示
└── ui/                       # shadcn/ui 组件

lib/
├── mock/index.ts             # 5 个用户 + 完整对话 + 画像
└── openai/client.ts          # DeepSeek SDK 封装

types/index.ts                # 全局类型定义
```

---

##  面试展示建议

1. **先讲产品定位**（30s）："这是 AI 销售副驾驶，不是 chatbot"
2. **演示分析页**（90s）：选陈建国（价格异议+流失风险），点 AI 分析，逐个解读 6 个维度
3. **切 Dashboard**（30s）：展示 AI 处理的全局指标和主动建议
4. **点用户画像**（30s）：展示 CRM+AI 融合的单用户视图
5. **总结产品逻辑**（30s）："所有分析来自 Prompt Engineering，成本极低，可规模化"

---

##  后续迭代方向（非 MVP）

- [ ] 多 Agent 协作（分析 Agent + 策略 Agent + 内容 Agent）
- [ ] 真实数据库 + 用户系统
- [ ] 销售策略 A/B 测试
- [ ] 通话录音自动分析
- [ ] 企业微信 / 飞书集成

---

**Built for AI PM Portfolio · 2026**
