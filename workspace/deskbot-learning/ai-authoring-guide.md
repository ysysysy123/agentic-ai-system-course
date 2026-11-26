# Deskbot 交互式课程：AI 教材编写与陪读指南

本指南规范后续任何 AI（Claude Code、Codex、Cursor、Gemini 等）如何为一位**完全零基础学习者**生成交互式 HTML 课程、组织本地模拟实验，并在学习过程中协助完成 5 项求职级 Agent 升级。

---

## 一、两种工作模式（严禁混淆！）

### 模式 A：按阶段分批编写 HTML 教材（Stage-Gated Batch Authoring）
- **核心铁律**：**每次只生成当前指定的那 1 个阶段（5–8 课）的 HTML 课文与配套练习，绝不跨阶段一次性把 38 课全写完！**
- **原因**：本课程是“边学边改”螺旋式课程——学生在 `M01` 会重构 `ToolRegistry` 与 `AgentDialogueBackend`，在 `M02` 会重构记忆检索与 Prompt 组装，在 `M03` 会优化流式首声路由。如果提前把 `M02`–`M05` 写成静态 HTML，后面引用到的源码行号与函数签名会立刻过期失效。
- **执行流程**：先读仓库根 `AGENTS.md` → [HANDOFF.md](HANDOFF.md) → [AUTHORING_STATUS.md](AUTHORING_STATUS.md) → [syllabus.md](syllabus.md) → [source-map.md](source-map.md)。读取当前阶段的最新真实 Deskbot 源码，逐课完成该阶段的 `lessons/Mxx.yy.html` 与 `exercises/Mxx.yy/`，自检无误后更新 `AUTHORING_STATUS.md` 和 `index.html`，**在该阶段末尾停下等待学生学完并落地代码改动**。

### 模式 B：交互式教学陪读与 PR 实战辅导（Tutoring & Pair Upgrade）
- **核心铁律**：教材已生成 ≠ 学生已掌握！陪读时以 [progress.md](progress.md) 的当前课为准，采用苏格拉底式引导：**先让学生读当前课 HTML 并动手跑 `exercises/` → 让学生用自己的话预测/讲回 → 针对卡壳语法即时补微例子 → 在实战改造课（PR-1～PR-5）手把手带着写代码、跑 `pytest`、留前后对比证据 → 验收达标后再更新 `progress.md` 进入下一课**。
- 陪读对话中所有含实质学习内容的问答，同时按根仓库 `AGENTS.md` 规范追加记录到 `questions/YYYY-MM-DD.md`。

---

## 二、零基础讲解与真实源码铁律

1. **首次出现的语法 100% 拆透（Just-in-Time Syntax）**：
   - 查看 [syllabus.md](syllabus.md) 中该课标注的「零基础首讲语法与概念」。无论是 Python 的 `dict.get`、`*` 关键字参数、`@dataclass`、`yield`、`async for`、`re.fullmatch`，还是 SQL 的 `?` 参数化子查询、JS 的 `?.`，第一次出现时必须先给一个 5–10 行、不依赖项目的直观小例子逐词解释，再带入 Deskbot 真实源码。严禁甩出一句“这是 Python 标准惯用法”。
2. **严格区分「白盒精读」与「灰盒走读」**：
   - 对照 [source-map.md](source-map.md) 标注的深度：`白盒` 模块必须讲清输入、状态变化、关键分支、异常与返回；`灰盒` 模块（如 `opus.py`、`transcoder.py`、`pcm-worklet.js`、`ota.py`）重点讲清接口契约、数据格式、配置开关以及“出故障时看哪条日志、跑哪个 `scripts/check_*.py` 定位”，不把零基础学生拖入 C 动态库或前端样式泥潭。
3. **绝对忠于当前真实源码与证据**：
   - 写任何代码走读前，**必须现场读取 `/home/yyy/desktop/ai/Deskbot/server/voice` 中对应的当前源码文件**，核对真实类名、函数名与当前行号（因为前一阶段的实战 PR 可能已经修改了代码！）。
   - 严禁读取、打印或把本机私有 `.env`、真实 API Key 写进任何课件、练习或日志；配置讲解一律使用 `config.example.yaml` 与 `.env.example`。
   - 明确区分四类状态：**① 当前代码已实现且离线测试覆盖**、**② 需开启配置（如 `mcp.enabled=true`）才生效**、**③ 本课即将动手改造的目标方案**、**④ 需真实模型或 ESP32 实机才能最终确认的物理表现**（例如服务端发出首包 `first_audio_ms` ≠ 扬声器实际出声时间；固件收到运动指令 ≠ 底盘已完成物理位移）。
4. **本地模拟优先，实机低风险选做**：
   - 学生手头有 ESP32 实机，但本地日常学习、实验与评测**一律优先使用离线 Fake、纯文本调试 CLI 与电脑浏览器测试桥（`local_test.py` + `run.py`）**。绝不在未经学生明确确认的情况下执行硬件刷机、真实底盘控制或高消耗付费 API 批量调用。

---

## 三、交互式 HTML 课程页面规范（完整 API 见 [HTML_DESIGN_RULES.md](HTML_DESIGN_RULES.md)）

1. **统一设计系统、模板与 CLI 工具链**：
   - 所有课程页（`lessons/Mxx.yy.html`）与目录页（`index.html`）**统一引用 `assets/deskbot-course.css` 与 `assets/deskbot-course.js`**（已全面升级支持浅色暖纸/深色曜石双主题切换、自动目录滚动高亮、离线语法着色、SVG 节点流程图、Agent 消息回放器与双栏聚光灯代码走读；`lessons/M00.01.html` 已升级为标准样板课）。
   - **禁止手敲骨架或凭记忆抄行号**！必须配合内置辅助工具 `scripts/course_tool.py`：
     - 建课：`python3 workspace/deskbot-learning/scripts/course_tool.py new <Mxx.yy>`（基于 `templates/lesson.html` 生成标准 7 板块骨架与 `exercises/<Mxx.yy>/` 目录）。
     - 取码：`python3 workspace/deskbot-learning/scripts/course_tool.py snippet <相对路径> <起行> <止行>`（精确提取真实源码与起始行号，自动转义并屏蔽 `.env`）。
     - 校验：`python3 workspace/deskbot-learning/scripts/course_tool.py check --all`（检查未填占位符、断链、`.code-walk` 行号越界、内联 JS `node --check` 语法与敏感凭证扫描）。
2. **单课 HTML 必备的 7 个板块**：
   - `01 · 问题引入`：一句话收获（`.win`）+ 前置检查（`.prereq`）+ 生活直觉卡片（`.callout.intuition`）。
   - `02 · 零基础语法拆桥`：使用双栏 `.syntax-bridge`（左栏 5 行纯标准库极简例子逐词解释，右栏对应 Deskbot 真实写法）。
   - `03 · 动手推演沙盒`：调用 `DeskCourse.tracePlayer` / `flowGraph` / `playground` / `.dk-stepper` / `.dk-tabs` 构建可点击推演的离线模拟器。
   - `04 · 真实源码聚光灯走读`：使用双栏 `.code-walk`（左侧真实行号代码，右侧 `ol.walk > li[data-lines="..."]` 点击聚光灯高亮）。
   - `05 · 本地动手实验 / PR 任务`：`.terminal-lab` 一键复制运行命令 + 预期输出 + `details.reveal.hint` 分层提示 + `details.reveal.deep` 参考解法（源码存放于 `exercises/Mxx.yy/`）。
   - `06 · 本课浓缩与深圳面试表达`：`.callout.summary` + `.callout.interview`（30 秒面试表达模板）。
   - `07 · 自测与通关讲回验收`：`details.reveal.q` 折叠自测 + `[data-teachback]` 讲回草稿箱（自动按课号隔离存储，支持一键复制发给陪读 AI 验收）。

---

## 四、直接复制给其他 AI 的标准提示词

### 提示词 1：让其他 AI 按阶段生成 HTML 课件（模式 A · 每次生成 1 个阶段）

> **能访问本机仓库时（Claude Code / Codex / Cursor 等本地 Agent）：**
> ```text
> 请接手我的 Deskbot 交互式课程阶段编写任务（模式 A：按阶段分批生成）。
> 先依次阅读：
> 1. 仓库根目录 AGENTS.md（遵守 course/ 与 references/ 只读规则）
> 2. workspace/deskbot-learning/HANDOFF.md 与 AUTHORING_STATUS.md
> 3. workspace/deskbot-learning/syllabus.md、source-map.md、improvement-roadmap.md、ai-authoring-guide.md
> 4. 已有的 workspace/deskbot-learning/lessons/M00.01.html 与 assets/（参考视觉与交互风格，注意不要破坏 M00.01）
>
> 我是完全零基础学习者，日常在本地用模拟/浏览器环境学习，目标是彻底吃透并改进 /home/yyy/desktop/ai/Deskbot/server/voice 用于深圳 Agent 岗求职。
> 请从 AUTHORING_STATUS.md 当前待编写的阶段开始，**只完整生成当前这 1 个阶段内的全部课程（lessons/Mxx.yy.html + exercises/Mxx.yy/ 实验与答案）**，严禁跨阶段把后面所有阶段一次性写完（因为学完本阶段我会修改 Deskbot 源码）。
>
> 每课必须：从零拆解本课首讲语法、提供可离线点击的交互模拟器、现场读取并核对当前最新的 Deskbot 真实源码与行号、提供可验证的离线 Python 小实验、默认折叠的故障练习与验收标准。每完成一课校验 JS/Python 语法与链接，全部完成后更新 index.html 与 AUTHORING_STATUS.md 并在阶段边界停下向我汇报。
> ```

> **无法访问本机仓库时（网页版 AI）：**
> ```text
> 我正在按一套 38 课的螺旋式大纲从零基础学习并改进 Deskbot 语音 Agent 项目。我将上传 syllabus.md、ai-authoring-guide.md 和 M00.01.html 样式参考。
> 请每次只帮我生成我指定的那 1 课（或当前阶段内不依赖未提供源码的基础课）的完整交互式 HTML 与配套 Python 练习。凡涉及真实项目源码走读的课，请先明确列出需要我粘贴给你的 Deskbot 具体文件路径，拿到真实源码前绝不编造代码、函数名或行号。
> ```

### 提示词 2：让 AI 当你的随堂陪读与实战改造导师（模式 B · 逐课学习验收）

> ```text
> 请作为我的 Agent 导师（模式 B：交互式陪读与实战改造），先阅读仓库根 AGENTS.md、workspace/deskbot-learning/syllabus.md、improvement-roadmap.md 和 progress.md。
> 查看 progress.md 中我当前正在学的课号：先带我检查本课核心概念与练习完成情况，用苏格拉底提问检验我是否真正读懂了语法与源码数据流；如果本课是 PR 实战改造课，请按“先复现问题与基线 → 最小代码改动 → 跑 pytest 验证 → 让我用自己的话讲回原理”四步带我实操。验收真正达标后再更新 progress.md，并按 AGENTS.md 规范记录本次问答到 questions/。
> ```
