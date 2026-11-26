# Deskbot 语音 Agent 全项目源码覆盖与分层掌握地图（对齐 38 课大纲）

核对日期：2026-11-26
课程唯一顺序与验收依据：[syllabus.md](syllabus.md)（共 6 个阶段 `M00`–`M05`，38 课）。

本文件确保 `Deskbot/server/voice` 下的 **全部 117 个自有文件**（`src` 40、`scripts` 14、`tests` 41、`local_test` 4、根目录与配置 11、`deploy` 2、`docs` 5）以及 **4 大外围模块** 100% 有明确的课程归属，同时严格区分**学习深度**，杜绝“核心模块看个大概、外围细枝末节耗光精力”：

- **🔥 白盒精读 + 重构**：逐行讲透数据结构、状态流转与边界条件，能够关掉 AI 独立重写最小版本，并在实战课中亲手升级改造（深圳 Agent 岗面试深挖核心区）。
- **🔍 白盒精读**：逐段读懂控制流、并发锁、协议交互与异常处理，能够独立写测试、复现并修复故障。
- **🧭 灰盒走读 + 排障**：讲清输入输出契约、配置项、在全链路中的位置、如何运行检查脚本及通过日志/测试定位故障，不把底层 C 动态库绑定、FFmpeg 编解码算法或前端样式细节设为逐行背诵负担。

---

## 一、目录基准约定

- `COURSE_ROOT`：`/mnt/study/github/agentic-ai-system-course`（`course/` 与 `references/` 严格只读；本课程位于 `workspace/deskbot-learning/`）。
- `VOICE_ROOT`：`/home/yyy/desktop/ai/Deskbot/server/voice`（下表相对路径均以此为根）。
- `DESKBOT_ROOT`：`/home/yyy/desktop/ai/Deskbot`（固件、独立视觉服务、协议草案、启动工具所在根仓库）。

---

## 二、`src/voice_server/` 全部 40 个服务源码文件映射

| `VOICE_ROOT` 相对路径 | 核心职责 | 掌握深度 | 所属课号（`M00`–`M05`） | 对应测试文件 |
|---|---|---|---|---|
| `src/voice_server/__init__.py` | Python 包标记 | 🧭 灰盒 | `M00.05` | 随包导入覆盖 |
| `src/voice_server/__main__.py` | `python -m voice_server` CLI 入口与事件循环启动 | 🔍 白盒 | `M00.05`、`M03.02` | `tests/test_app.py`、`tests/test_py310_compat.py` |
| `src/voice_server/admin_api.py` | 本机管理 HTTP 接口（会话快照、记忆管理、只读设备工具） | 🧭 灰盒 | `M04.04` | `tests/http/test_admin_api.py` |
| `src/voice_server/app.py` | `ServerApplication` 依赖注入组装、监听器启停与逆序清理 | 🔍 白盒 | `M03.02` | `tests/test_app.py`、`tests/integration/test_voice_flow.py` |
| `src/voice_server/audio/__init__.py` | `audio` 子包入口 | 🧭 灰盒 | `M03.03` | `tests/audio/` |
| `src/voice_server/audio/opus.py` | Opus 帧 ↔ PCM 编解码包装与原生动态库加载 | 🧭 灰盒 | `M03.03` | `tests/audio/test_opus.py` |
| `src/voice_server/audio/sentences.py` | `SentenceBuffer` 流式增量标点分句与首短句加速 | 🔍 白盒 | `M03.04` | `tests/audio/test_sentences.py` |
| `src/voice_server/audio/transcoder.py` | FFmpeg 流式管道转码与取消时子进程回收 | 🧭 灰盒 | `M03.04` | `tests/audio/test_transcoder.py` |
| `src/voice_server/auth.py` | 设备白名单、Bearer Token 与管理端鉴权 | 🔍 白盒 | `M03.02`、`M04.04` | `tests/test_auth.py` |
| `src/voice_server/camera_dialogue.py` | **核心**：MCP 工具发现、快捷指令、多轮工具循环与视觉接入（PR-1/2/3 重构主战场） | 🔥 白盒+重构 | `M00.04`、`M01.04`–`M01.07`、`M02.02`、`M03.06`、`M04.03` | `tests/test_camera_dialogue.py`、`tests/session/test_dialogue_backend.py` |
| `src/voice_server/camera_mcp.py` | 浏览器测试页摄像头 JSON-RPC MCP 桥 | 🔍 白盒 | `M04.02` | `tests/test_camera_mcp.py` |
| `src/voice_server/compat.py` | Python 3.10+ 异步 `wait_for` 兼容超时封装 | 🔍 白盒 | `M03.01` | `tests/test_py310_compat.py` |
| `src/voice_server/config.py` | Typed `dataclass` 配置模型、环境变量合并与校验 | 🧭 灰盒 | `M00.05`、`M04.02` | `tests/test_config.py` |
| `src/voice_server/device_mcp.py` | **核心**：实机 WebSocket MCP 握手、工具发现、白名单与打断急停 | 🔍 白盒 | `M04.02` | `tests/test_device_mcp.py`、`tests/test_websocket_server.py` |
| `src/voice_server/dialogue.py` | **核心**：`TurnRequest` 与 `DialogueBackend` 解耦契约 | 🔥 白盒+重构 | `M00.03`、`M01.01`、`M01.03`、`M05.01` | `tests/session/test_dialogue_backend.py` |
| `src/voice_server/environment.py` | `.env` 解析与环境变量优先级合并（绝不读真实私有 `.env`） | 🧭 灰盒 | `M00.05` | `tests/test_environment.py` |
| `src/voice_server/local_testing.py` | 浏览器本地测试服务（8004 静态页、WS 音频桥、相机路由） | 🧭 灰盒 | `M04.01` | `tests/integration/test_local_testing.py` |
| `src/voice_server/logging_utils.py` | 日志结构化脱敏（遮盖密钥与敏感字段） | 🔍 白盒 | `M01.03`、`M05.01` | `tests/test_logging_utils.py` |
| `src/voice_server/memory/__init__.py` | 记忆子包导出入口 | 🔍 白盒 | `M02.01` | `tests/memory/` |
| `src/voice_server/memory/base.py` | `MemoryProvider` 与 `SummaryStore` 接口契约 | 🔍 白盒 | `M02.01` | `tests/memory/test_sqlite.py` |
| `src/voice_server/memory/consolidation.py` | **核心**：长期事实抽取提示、溯源校验、记住/遗忘解析（PR-4 补安全过滤） | 🔥 白盒+重构 | `M02.03`、`M02.06` | `tests/memory/test_facts.py` |
| `src/voice_server/memory/models.py` | 消息、事实、`MemoryContext`、`SummaryBatch` 数据结构 | 🔍 白盒 | `M02.01` | `tests/memory/test_sqlite.py` |
| `src/voice_server/memory/service.py` | **核心**：空闲延迟摘要调度、并发锁、代际取消与明确记忆指令 | 🔍 白盒 | `M02.04` | `tests/memory/test_service.py`、`tests/memory/test_facts.py` |
| `src/voice_server/memory/sqlite.py` | **核心**：SQLite 持久化、预算裁剪、事实状态机与检索（PR-4 升级 FTS5+RRF） | 🔥 白盒+重构 | `M02.01`–`M02.03`、`M02.05`–`M02.06` | `tests/memory/test_sqlite.py`、`tests/memory/test_facts.py` |
| `src/voice_server/music.py` | 音乐搜索与流式 PCM 转码 Provider | 🧭 灰盒 | `M04.04` | `tests/session/test_music.py` |
| `src/voice_server/ota.py` | 设备健康探针、OTA 配置下发与实机图片上传视觉路由 | 🧭 灰盒 | `M04.03`、`M04.04` | `tests/http/test_ota.py` |
| `src/voice_server/performance.py` | 语音各组件构造与分阶段延迟压测逻辑 | 🧭 灰盒 | `M03.05` | `tests/scripts/test_performance_tester.py` |
| `src/voice_server/protocol/__init__.py` | 协议子包入口 | 🔍 白盒 | `M03.02` | `tests/protocol/` |
| `src/voice_server/protocol/messages.py` | WebSocket 控制消息（`hello`/`listen`/`abort`/`stt`/`tts`）解析与构造 | 🔍 白盒 | `M03.02` | `tests/protocol/test_messages.py` |
| `src/voice_server/protocol/state.py` | `SessionStateMachine` 会话合法状态迁移 | 🔍 白盒 | `M00.03`、`M03.02` | `tests/protocol/test_state.py` |
| `src/voice_server/providers/__init__.py` | Provider 导出入口 | 🔍 白盒 | `M01.01` | 各 provider 测试 |
| `src/voice_server/providers/base.py` | VAD / ASR / LLM / TTS `Protocol` 抽象接口 | 🔍 白盒 | `M01.01` | 各 provider 测试 |
| `src/voice_server/providers/edge_tts.py` | Edge 在线流式 TTS 与 PCM 转换 | 🧭 灰盒 | `M03.04` | `tests/providers/test_edge_tts.py` |
| `src/voice_server/providers/local_tts.py` | 本地命令行 TTS 子进程适配 | 🧭 灰盒 | `M03.04` | `tests/providers/test_local_tts.py` |
| `src/voice_server/providers/openai_compatible.py` | **核心**：OpenAI 兼容流式输出与 `ToolCall` 增量拼接（PR-5 采集 `usage`） | 🔥 白盒+重构 | `M01.02`、`M05.01` | `tests/providers/test_openai_compatible.py` |
| `src/voice_server/providers/openai_vision.py` | 多模态图像描述 Provider | 🔍 白盒 | `M04.03` | `tests/test_camera_dialogue.py`、`tests/http/test_ota.py` |
| `src/voice_server/providers/sensevoice.py` | SenseVoice 本地 ASR 推理、并发信号量与取消边界 | 🧭 灰盒 | `M03.01`、`M03.03` | `tests/providers/test_sensevoice.py` |
| `src/voice_server/providers/silero.py` | Silero VAD 语音活动检测窗口管理 | 🧭 灰盒 | `M03.03` | `tests/providers/test_silero.py` |
| `src/voice_server/session.py` | **核心**：`VoiceSession` 完整回合管线、上下文组装、队列预取、打断与部分回复保存（PR-3/5 联动） | 🔥 白盒+重构 | `M00.04`、`M02.02`、`M03.03`–`M03.04`、`M05.01` | `tests/session/*.py` |
| `src/voice_server/websocket_server.py` | WebSocket 连接接入、鉴权、每设备会话生命周期与 MCP 消息分发 | 🔍 白盒 | `M03.02`、`M04.02` | `tests/test_websocket_server.py` |

*(注：在 `M01` 与 `M05` 实战改造中你亲手新增的模块，如 `tool_registry.py`、`agent_dialogue.py`、`trace.py` 或 `evals/`，在创建后同步登记到本表底部。)*

---

## 三、`scripts/`（14 个脚本）与 `tests/`（41 个文件）归属总表

### 1. `scripts/` 诊断与基准脚本（全部按 🧭 灰盒实战工具掌握）

| 脚本路径 | 用途 | 所属课号 |
|---|---|---|
| `scripts/check_llm.py` | 单条文本流式连通性验证 | `M01.02` |
| `scripts/check_memory.py` | 记住、改口、遗忘真实模型连通检查 | `M02.04` |
| `scripts/benchmark_memory.py` | SQLite 记忆写入与检索延迟基准（PR-4 前后对比工具） | `M02.05`、`M02.06` |
| `scripts/check_vad_endpoints.py` | Silero VAD 语音端点切分检查 | `M03.03` |
| `scripts/check_asr.py` | SenseVoice 本地语音转文字检查 | `M03.03` |
| `scripts/check_tts.py` | TTS 输出 WAV 可播放检查 | `M03.04` |
| `scripts/check_voice_turn.py` | 隔离环境下跑通单轮完整语音管线 | `M03.04` |
| `scripts/benchmark_llm_first_text.py` | 测量 LLM 首字延迟与重试影响 | `M03.05`、`M03.06` |
| `scripts/benchmark_tts_stages.py` | 拆解 TTS 网络流、FFmpeg 启动与首块 PCM 耗时 | `M03.05` |
| `scripts/benchmark_voice_segments.py` | 对比不同分句策略对首音频包 P50/P95 的影响 | `M03.05` |
| `scripts/benchmark_voice_server.py` | 本地隔离端口端到端 WS 压测与 CPU/内存统计 | `M03.05` |
| `scripts/summarize_voice_timings.py` | 聚合服务端回合日志计算各阶段 P50/P95 | `M03.05`、`M05.03` |
| `scripts/music_http_server.py` | 独立局域网音乐 HTTP 转码网关 | `M04.04` |
| `scripts/summarize_device_timings.py` | 解析 ESP32 实机串口日志中的端到端与打断时序 | `M04.05` |

### 2. `tests/` 自动化测试套件（41 个可见文件，随对应源码课同步拆解）

- **测试替身基石**：`tests/fakes.py`（`M01.01` 精读，贯穿全课程离线实验）。
- **基础与配置（5 个）**：`test_config.py`、`test_environment.py`、`tests/scripts/test_connectivity_cli.py`（`M00.05`）；`test_logging_utils.py`（`M01.03`）；`test_py310_compat.py`（`M03.01`）。
- **Agent、模型与 MCP（4 个）**：`tests/providers/test_openai_compatible.py`（`M01.02`）；`test_camera_dialogue.py`（`M01.04`–`M01.07`、`M04.03`）；`test_camera_mcp.py`、`test_device_mcp.py`（`M04.02`）。
- **记忆系统（3 个）**：`tests/memory/test_sqlite.py`（`M02.01`、`M02.02`、`M02.05`）；`tests/memory/test_facts.py`（`M02.03`、`M02.06`）；`tests/memory/test_service.py`（`M02.04`）。
- **协议、服务与语音会话（12 个）**：`test_app.py`、`test_auth.py`、`test_websocket_server.py`、`tests/protocol/test_messages.py`、`tests/protocol/test_state.py`、`tests/session/test_isolation.py`（`M03.02`）；`tests/session/test_manual_turn.py`、`tests/session/test_auto_vad.py`（`M03.03`）；`tests/session/test_dialogue_backend.py`（`M01.04`、`M03.04`）；`tests/session/test_abort.py`、`tests/session/test_limits.py`（`M03.04`）；`tests/session/test_music.py`（`M04.04`）。
- **音频与语音 Provider（7 个）**：`tests/audio/test_opus.py`、`tests/providers/test_silero.py`、`tests/providers/test_sensevoice.py`（`M03.03`）；`tests/audio/test_sentences.py`、`tests/audio/test_transcoder.py`、`tests/providers/test_edge_tts.py`、`tests/providers/test_local_tts.py`（`M03.04`）。
- **性能、HTTP、集成与浏览器（9 个）**：`tests/scripts/test_performance_tester.py`、`tests/scripts/test_tts_stages.py`、`tests/integration/test_voice_flow.py`（`M03.05`）；`tests/integration/test_local_testing.py`、`tests/browser/local_test.test.cjs`（`M04.01`）；`tests/http/test_admin_api.py`、`tests/http/test_ota.py`、`tests/scripts/test_music_http_server.py`（`M04.04`）；`tests/scripts/test_device_timings.py`（`M04.05`）。

---

## 四、网页、入口、配置、部署与文档文件（22 个文件）及外围模块

- **入口与配置（11 个）**：`run.py`、`local_test.py`、`performance_tester.py`、`requirements.txt`、`requirements-dev.txt`、`requirements-test.txt`（`M00.01`–`M00.02`）；`config.example.yaml`、`.env.example`、`pytest.ini`（`M00.05`）；`requirements-music.txt`（`M04.04`）；`README.md`（`M00.01`、`M04.05`）。
- **浏览器测试台前端（4 个）**：`local_test/index.html`、`local_test/styles.css`、`local_test/app.js`、`local_test/pcm-worklet.js`（全部在 `M04.01` 按 🧭 灰盒联调深度覆盖）。
- **部署样例（2 个）**：`deploy/Caddyfile.example`、`deploy/nginx.conf.example`（`M04.04`）。
- **文档与历史设计记录（5 个）**：`docs/voice-agent-integration.md`（`M00.01`、`M01.04`）；`docs/local-testing.md`（`M04.01`）；`docs/upstream-voice-comparison.md`、`docs/server-work-log.md`、`docs/superpowers/plans/2026-08-06-voice-server.md`（`M04.05` 作为历史演进与固件插话文档冲突辨析材料，始终以当前源码和实测为准）。
- **外围 `DESKBOT_ROOT` 4 大边界模块（全部按 🧭 接口与运行契约掌握，不扩写 C++ 与底层模型训练）**：
  1. `server/vision/`（独立 HTTP 视觉服务，端口 8005）→ `M04.03`
  2. `tools/deskbot_launcher.py` 及启停脚本 → `M04.04`
  3. `protocol/`（跨模块 JSON Envelope 草案 vs 现行语音 WS 协议辨析）→ `M04.05`
  4. `firmware/lichuang-s3/source/xiaozhi-esp32/`（设备端 WebSocket、MCP Server 与 AEC 插话交接协议）→ `M04.05`

---

## 五、动态符号与改装追踪约定

每次某个阶段的 HTML 教材生成或实战 PR 落地后，在 [AUTHORING_STATUS.md](AUTHORING_STATUS.md) 记录该阶段已覆盖的关键类/函数，以及因 PR-1～PR-5 重构而新增或迁移的文件路径，确保下一阶段生成课件的 AI 读取到 100% 最新的代码地图。
