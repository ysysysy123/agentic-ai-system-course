# Deskbot 交互式 HTML 教材制作进度（38 课按阶段滚动版）

核对日期：2026-11-26
执行规则见 [HANDOFF.md](HANDOFF.md)；学生个人掌握记录另见 [progress.md](progress.md)（教材制作状态 ≠ 学生已掌握）。

---

## 当前生产断点

- **课程总规模**：6 个阶段（`M00`–`M05`），共 **38 课**。
- **已完成并校验**：**5 课**（`M00.01`–`M00.05`，即 **Batch 0 全阶段完成 ✓**）；剩余 **33 课**。
- **当前解锁批次**：**Batch 1（`M01.01`–`M01.08`，共 8 课）**。在 `M01.08` 结束（**🛑 Gate 1**）处必须停下等待学生完成学习与 PR-1/PR-2 源码升级，**严禁提前生成 `M02`–`M05`**。
- **下一课任务**：**`M01.01` 类、`dataclass` 与 `Protocol`——读懂 `DialogueBackend` 解耦契约**（运行 `python3 workspace/deskbot-learning/scripts/course_tool.py new M01.01` 创建骨架，并记得把 `M00.05.html` 底部导航中的下一课链接同步更新为 `M01.01.html`）。
- **状态枚举**：`未编写` | `编写中` | `待校验` | `已校验`。

---

## 38 课生产与校验清单

### 阶段 0 · `M00` 零基础破冰与最小够用 Python（Batch 0 · 已全部完成 ✓）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M00.01` | 项目到底解决什么问题 | 全局基石 | 已校验 | [M00.01.html](lessons/M00.01.html) | 2026-11-26：Tufte 模板升级、双场景 SVG 沙盒、源码聚光灯与 `course_tool.py check` 通过 |
| `M00.02` | 文件、目录、终端与你的第一个 Python 程序 | 零基础基石 | 已校验 | [M00.02.html](lessons/M00.02.html) | 2026-11-26：路径解析沙盒、`run.py`/`local_test.py` 走读、`exercises/M00.02/` 实跑通过 |
| `M00.03` | 分支、列表与字典——亲手拼出大模型看懂的消息 | 零基础基石 | 已校验 | [M00.03.html](lessons/M00.03.html) | 2026-11-26：消息组装与浅拷贝沙盒、`state.py`/`_make_messages` 走读、`exercises/M00.03/` 实跑通过 |
| `M00.04` | 循环、函数与异常——写出最小模拟工具调度器 | 零基础基石 | 已校验 | [M00.04.html](lessons/M00.04.html) | 2026-11-26：3 轮有界调度与异常兜底沙盒、`_execute_impl` 走读、`exercises/M00.04/` 实跑通过 |
| `M00.05` | 模块导入、JSON/YAML 配置与你的第一个 `pytest` 单元测试 | 基石+灰盒 | 已校验 | [M00.05.html](lessons/M00.05.html) | 2026-11-26：4 层配置优先级实验台、`__main__.py`/`environment.py` 走读、`pytest` 4 用例实跑全绿 |

### 阶段 1 · `M01` 纯文本直入 Agent 大脑：工具契约、循环与自愈（Batch 1 · 结束后触发 🛑 Gate 1）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M01.01` | 类、`dataclass` 与 `Protocol`——读懂 `DialogueBackend` 解耦契约 | 白盒精读 | 未编写 | `lessons/M01.01.html` | — |
| `M01.02` | 流式生成与 `OpenAICompatibleLLMProvider`——大模型怎样吐出文字和工具请求 | 白盒精读 | 未编写 | `lessons/M01.02.html` | — |
| `M01.03` | 搭建免麦克风的 Agent 文字调试台（你的第一件趁手兵器） | 白盒实践 | 未编写 | `lessons/M01.03.html` | — |
| `M01.04` | 逐行解剖 `camera_dialogue.py`（上）：有界工具循环与文字缓冲权衡 | 白盒精读 | 未编写 | `lessons/M01.04.html` | — |
| `M01.05` | 逐行解剖 `camera_dialogue.py`（下）：正则快捷通道为什么会静默吞掉复合指令？ | 白盒+复现 | 未编写 | `lessons/M01.05.html` | — |
| `M01.06` | 【实战改造 PR-1】抽出统一 `ToolRegistry` 与校验管道，修复复合指令丢步 | 🔥 白盒重构 | 未编写 | `lessons/M01.06.html` | — |
| `M01.07` | 【实战改造 PR-2】升级 `AgentDialogueBackend`：分级错误自愈、Doom-Loop 防护与 `stop_reason` | 🔥 白盒重构 | 未编写 | `lessons/M01.07.html` | — |
| `M01.08` | 阶段 1 闭卷通关：关掉 AI，独立手写最小工具型 Agent | 闭卷考核 | 未编写 | `lessons/M01.08.html` | **🛑 Gate 1：完成本课学习与 PR-1/2 后再生成 M02** |

### 阶段 2 · `M02` 上下文工程、SQLite 与长期记忆升级（Batch 2 · 需 Gate 1 解锁，结束后触发 🛑 Gate 2）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M02.01` | SQLite 与 SQL 从零开始——对话和排除表是怎么落盘持久化的 | 基石+白盒 | 未编写 | `lessons/M02.01.html` | — |
| `M02.02` | 短期上下文预算与【实战改造 PR-3（上）】Prompt Prefix Cache 分层优化 | 🔥 白盒重构 | 未编写 | `lessons/M02.02.html` | — |
| `M02.03` | 读懂 `consolidation.py`：事实版本化、溯源校验与明确记住/遗忘治理 | 白盒精读 | 未编写 | `lessons/M02.03.html` | — |
| `M02.04` | 读懂 `MemoryService`：空闲后台整理、并发锁与代际取消机制 | 白盒精读 | 未编写 | `lessons/M02.04.html` | — |
| `M02.05` | 剖析现有历史召回瓶颈：8 词二字切分 + `SQL LIKE` 为什么会漏召回？ | 白盒+基准 | 未编写 | `lessons/M02.05.html` | — |
| `M02.06` | 【实战改造 PR-4】落地混合记忆检索（SQLite FTS5 + 轻量向量 + RRF 融合）与安全过滤 | 🔥 白盒重构 | 未编写 | `lessons/M02.06.html` | — |
| `M02.07` | 阶段 2 闭卷通关：记忆全链路白板推演与故障修复考核 | 闭卷考核 | 未编写 | `lessons/M02.07.html` | **🛑 Gate 2：完成本课学习与 PR-3上/PR-4 后再生成 M03** |

### 阶段 3 · `M03` 异步并发、WebSocket 协议与实时语音会话引擎（Batch 3 · 需 Gate 2 解锁，结束后触发 🛑 Gate 3）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M03.01` | 深入 `asyncio` 实战：有界队列背压、取消传播与阻塞隔离边界 | 并发+白盒 | 未编写 | `lessons/M03.01.html` | — |
| `M03.02` | 服务组装与 WebSocket 握手：从 `ServerApplication` 到每连接会话隔离 | 白盒精读 | 未编写 | `lessons/M03.02.html` | — |
| `M03.03` | 逐行精读 `VoiceSession`（上）：输入音频流、预卷缓冲与 VAD 自动切句 | 白盒+灰盒 | 未编写 | `lessons/M03.03.html` | — |
| `M03.04` | 逐行精读 `VoiceSession`（下）：流式分句、TTS 预取、抢话打断与部分回复保存 | 白盒+灰盒 | 未编写 | `lessons/M03.04.html` | — |
| `M03.05` | 灰盒掌握语音性能测量工具链：阶段耗时拆解与 P50 / P95 统计 | 灰盒压测 | 未编写 | `lessons/M03.05.html` | — |
| `M03.06` | 【实战改造 PR-3（下）】优化“开启工具后普通闲聊首字卡顿”的流式体验 | 🔥 白盒重构 | 未编写 | `lessons/M03.06.html` | — |
| `M03.07` | 阶段 3 闭卷通关：全链路语音状态流转与疑难日志排障 | 闭卷考核 | 未编写 | `lessons/M03.07.html` | **🛑 Gate 3：完成本课学习与 PR-3下 后再生成 M04** |

### 阶段 4 · `M04` 浏览器测试台、MCP 桥接与全项目外围模块贯通（Batch 4 · 需 Gate 3 解锁，结束后触发 🛑 Gate 4）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M04.01` | 灰盒读懂浏览器测试台：前端事件、WebAudio 桥接与双进程本机联调 | 灰盒联调 | 未编写 | `lessons/M04.01.html` | — |
| `M04.02` | 白盒精读两大 MCP 桥：`CameraMCPBridge` 与 `DeviceMcpBridge` | 白盒精读 | 未编写 | `lessons/M04.02.html` | — |
| `M04.03` | 视觉链路与外部输入安全围栏：拍照分析、独立视觉模块与防间接注入 | 白盒+加固 | 未编写 | `lessons/M04.03.html` | — |
| `M04.04` | 灰盒贯通全部剩余服务模块：管理 API、OTA 配置、点歌网关与部署样例 | 灰盒全覆盖 | 未编写 | `lessons/M04.04.html` | — |
| `M04.05` | 外围固件协议边界与「本地模拟必做 + ESP32 实机选做」端到端联调 | 集成验收 | 未编写 | `lessons/M04.05.html` | **🛑 Gate 4：完成全链路模拟（及可选实机）联调后再生成 M05** |

### 阶段 5 · `M05` 可观测性、自动化 Eval 评测与深圳求职作品封装（Batch 5 · 需 Gate 4 解锁）

| 课号 | 标题 | 层级 | 制作状态 | 目标页面 | 校验记录 / 断点说明 |
|---|---|---|---|---|---|
| `M05.01` | 【实战改造 PR-5（上）】全链路 `TurnTrace` 与流式 Token / 成本账本 | 🔥 白盒重构 | 未编写 | `lessons/M05.01.html` | — |
| `M05.02` | 【实战改造 PR-5（下）】构建 30 条自动化 Agent Eval 评测套件 | 🔥 白盒开发 | 未编写 | `lessons/M05.02.html` | — |
| `M05.03` | 跑出「改前 vs 改后」量化对照实验与 CI 回归保护 | 实验与CI | 未编写 | `lessons/M05.03.html` | — |
| `M05.04` | 用 `Ch.22` 设计画布撰写一页纸架构说明与技术复盘 | 架构交付 | 未编写 | `lessons/M05.04.html` | — |
| `M05.05` | 深圳 Agent 岗简历项目包装与 2 分钟高密度演示打磨 | 求职表达 | 未编写 | `lessons/M05.05.html` | — |
| `M05.06` | 毕业终极考核：关掉 AI 现场手写扩展 + 5 层深度模拟面试 | 毕业答辩 | 未编写 | `lessons/M05.06.html` | — |

---

## 阶段覆盖与源码变更登记区

- **Batch 0（`M00.01`–`M00.05`）已完整覆盖**：
  - 入口与依赖：`run.py`、`local_test.py`、`performance_tester.py`、`requirements*.txt`、`pytest.ini`、`config.example.yaml`、`.env.example`。
  - 配置与环境（灰盒掌握）：`src/voice_server/__init__.py`、`src/voice_server/__main__.py::main`、`src/voice_server/environment.py`（全文件）、`src/voice_server/config.py::load_config`、`tests/test_config.py`（典型用例）。
  - 核心模块片段初识：`dialogue.py`（`TurnRequest` / `DialogueBackend` / `LLMDialogueBackend`）、`protocol/state.py`（`_TRANSITIONS` / `SessionStateMachine.transition`）、`session.py::_make_messages`、`camera_dialogue.py`（`_model_tool_name` / `_execute_impl` / `_text`）。
- 后续每完成一个 Batch 或合并一个实战 PR，在此处登记新增/重构的文件名与关键符号，供下一批次编写 AI 核对。
