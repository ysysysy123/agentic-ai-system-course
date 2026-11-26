# Deskbot 语音 Agent 教材源文件地图

本文件是后续生成教材时的课程蓝图和覆盖清单。它不要求学习者一开始读完全部源码；课程应先教最小必要概念，再带着一个问题进入对应文件，最终让学习者能独立追踪、修改、验证和解释整条链路。

## 根目录与范围

- COURSE_ROOT：/mnt/study/github/agentic-ai-system-course
  - 中文课程在 course/zh/；课程文件只读。
  - 本清单位于 workspace/deskbot-learning/source-map.md。
- VOICE_ROOT：/home/yyy/desktop/ai/Deskbot/server/voice
  - 本清单中的 server/voice 相对路径均以此为根。
  - 教材的主要实践对象是这里的 Python 语音服务、浏览器测试页、脚本、测试、配置和部署示例。
- DESKBOT_ROOT：/home/yyy/desktop/ai/Deskbot
  - 固件、独立视觉服务、启动器等都属于外围系统。课程先讲清它们与 voice 的接口和运行方法，不把它们扩成初学者必须精读的实现范围。

按本次只读核对时的 rg --files 清单，VOICE_ROOT 共 117 个可见文件：src 40、tests 41（其中 fakes.py 是测试辅助而不是测试用例）、scripts 14、local_test 页面 4、deploy 2、docs 5、voice 根目录 11。下表逐个列出这些文件。未读取 .env 或任何实际密钥，没有启动服务，也没有运行测试。

## 如何使用这份地图

课程顺序、模块目标和唯一验收标准均以 [syllabus.md](syllabus.md) 为准；本文件只回答“哪些项目文件在哪里、会在什么课首次接触、如何确认覆盖”。M00–M15 编号仅作交叉索引，不在此另设学习顺序或结课标准。

“首次接触/主要精读”表示教材首次围绕该文件讲解的课号，不代表要求学习者在该课前看懂整份文件。大型文件会在多课中重复阅读；回读和分段精读是预期安排。首次完整浏览器运行按 syllabus 的 M10.06，环境复现与交付在 M14.01；部署样例先在 M14.01 解释，规模扩展按 M15.04 选修；设备端实机交接在 M11.07 接口课与 M13.05 实机课处理。

## src 源码逐文件地图

| voice 相对路径 | 职责 | 首次接触/主要精读（可回读，不要求提前读懂整份文件） | 对应验证 |
|---|---|---|---|
| src/voice_server/__init__.py | Python 包标记，无主要运行逻辑。 | M02 | 无专门用例；随所有 voice_server 导入间接覆盖。 |
| src/voice_server/__main__.py | python -m voice_server 命令入口，解析配置并运行应用。 | M02.01、M03.04、M06.02；运行见 M14.01 | tests/test_app.py、tests/test_py310_compat.py |
| src/voice_server/admin_api.py | 本机管理 HTTP 路由：会话/设备诊断、记忆读取/写入/清理、事实管理。 | M04、M08、M11 | tests/http/test_admin_api.py |
| src/voice_server/app.py | 组装 provider、记忆、WS/OTA/admin listener，并管理启动和关闭。 | M02、M06 | tests/test_app.py、tests/integration/test_voice_flow.py |
| src/voice_server/audio/__init__.py | audio 子包标记。 | M02、M09 | 无专门用例；tests/audio/ 下的实现测试间接覆盖。 |
| src/voice_server/audio/opus.py | 将协议 Opus 帧解码/编码为 PCM/Opus。 | M09 | tests/audio/test_opus.py、tests/integration/test_voice_flow.py |
| src/voice_server/audio/sentences.py | 将流式文字整理为可合成的完整句/短段。 | M09 | tests/audio/test_sentences.py、tests/session/test_dialogue_backend.py |
| src/voice_server/audio/transcoder.py | 通过 FFmpeg 将媒体流转为 PCM，并处理进程关闭。 | M09、M05 | tests/audio/test_transcoder.py、tests/providers/test_edge_tts.py |
| src/voice_server/auth.py | 无认证、设备白名单、Bearer 与管理 Token 验证策略。 | M03、M11 | tests/test_auth.py、tests/http/test_admin_api.py、tests/http/test_ota.py |
| src/voice_server/camera_dialogue.py | 组合 LLM、摄像头/设备 MCP、视觉分析和确定性快捷指令的对话后端。 | M07、M11 | tests/test_camera_dialogue.py、tests/session/test_dialogue_backend.py |
| src/voice_server/camera_mcp.py | 本地 camera MCP 桥；在服务端和浏览器标签页间转发工具请求/结果。 | M04、M11 | tests/test_camera_mcp.py、tests/integration/test_local_testing.py |
| src/voice_server/compat.py | Python 版本兼容的异步超时封装。 | M02、M05 | tests/test_py310_compat.py |
| src/voice_server/config.py | YAML、环境变量和默认值合并为 typed 配置，并校验配置组合。 | M02、M03 | tests/test_config.py、tests/test_environment.py |
| src/voice_server/device_mcp.py | 当前 WebSocket 设备会话的 MCP initialize、工具调用、请求关联和运动停止请求。 | M04.04、M11.02、M11.04 | tests/test_device_mcp.py、tests/test_websocket_server.py |
| src/voice_server/dialogue.py | TurnRequest 与 DialogueBackend 契约，以及只调用普通 LLM 的默认对话后端。 | M02、M06、M07 | tests/session/test_dialogue_backend.py、tests/test_camera_dialogue.py |
| src/voice_server/environment.py | 读取实际 .env 配置文件的值，并按规则与进程环境合并；课程用 .env.example 说明配置接口，不读取真实 .env。 | M03.03 | tests/test_environment.py、tests/test_config.py |
| src/voice_server/local_testing.py | 电脑本机浏览器测试服务，含静态页面、浏览器音频 WS 桥、设备列表、调试与 MCP 路由。 | M04、M06、M10、M11 | tests/integration/test_local_testing.py、tests/browser/local_test.test.cjs |
| src/voice_server/logging_utils.py | 对映射和列表日志数据中的敏感字段做遮盖。 | M02、M12 | tests/test_logging_utils.py |
| src/voice_server/memory/__init__.py | 记忆模块公开类型和实现的导出入口。 | M02、M08 | 无专门用例；tests/memory/ 的导入间接覆盖。 |
| src/voice_server/memory/base.py | 记忆 provider 和摘要存储的契约。 | M02、M08 | tests/memory/test_sqlite.py、tests/memory/test_service.py |
| src/voice_server/memory/consolidation.py | 记忆整理 prompt、结构化结果解析、事实字段校验和明确记忆命令判断。 | M07、M08 | tests/memory/test_facts.py、tests/memory/test_service.py |
| src/voice_server/memory/models.py | 消息、事实、上下文、摘要批次的数据类型。 | M02、M08 | tests/memory/test_sqlite.py、tests/memory/test_facts.py |
| src/voice_server/memory/service.py | 把记忆存储与 LLM 整理连起来，按设备协调摘要/事实后台任务和明确命令。 | M05、M08 | tests/memory/test_service.py、tests/memory/test_facts.py |
| src/voice_server/memory/sqlite.py | SQLite 消息、摘要进度、事实、检索、设备隔离与删除实现。 | M03、M08 | tests/memory/test_sqlite.py、tests/memory/test_facts.py |
| src/voice_server/music.py | 搜索音乐并把选定曲目转成 PCM 流的 provider。 | M09.07、M11.05 | tests/session/test_music.py、tests/scripts/test_music_http_server.py |
| src/voice_server/ota.py | OTA 配置、健康/就绪状态、图片分析上传 HTTP 路由和 WS URL 生成。 | M04.02、M11.06 | tests/http/test_ota.py |
| src/voice_server/performance.py | 为语音模型/Provider 提供构造、单项测量和命令行入口。 | M02、M12 | tests/scripts/test_performance_tester.py |
| src/voice_server/protocol/__init__.py | 协议子包标记。 | M02、M04 | 无专门用例；tests/protocol/ 的导入间接覆盖。 |
| src/voice_server/protocol/messages.py | 定义并解析客户端消息、构造服务端协议消息。 | M02、M04、M06 | tests/protocol/test_messages.py、tests/test_websocket_server.py |
| src/voice_server/protocol/state.py | WebSocket 语音会话状态和合法迁移。 | M02、M06 | tests/protocol/test_state.py、tests/session/ 下的会话测试 |
| src/voice_server/providers/__init__.py | provider 契约的包级导出入口。 | M02、M09 | 无专门用例；provider 导入间接覆盖。 |
| src/voice_server/providers/base.py | VAD、ASR、LLM 和 TTS 的 Protocol 接口。 | M02、M09、M07 | 各 provider 测试和 tests/session/test_dialogue_backend.py |
| src/voice_server/providers/edge_tts.py | Edge TTS 音频流及到 PCM 的转换/分块。 | M05、M09 | tests/providers/test_edge_tts.py、tests/audio/test_transcoder.py |
| src/voice_server/providers/local_tts.py | 执行配置的本地 TTS 命令并读取 PCM 输出。 | M02、M09 | tests/providers/test_local_tts.py |
| src/voice_server/providers/openai_compatible.py | OpenAI 兼容 LLM 流式文本与 tool-call 数据的适配。 | M04、M07 | tests/providers/test_openai_compatible.py、tests/test_camera_dialogue.py |
| src/voice_server/providers/openai_vision.py | 使用 OpenAI 兼容接口分析图像并返回文字。 | M04、M11 | tests/test_camera_dialogue.py、tests/http/test_ota.py |
| src/voice_server/providers/sensevoice.py | SenseVoice 本地 ASR 模型适配、并发限制与取消后模型调用管理。 | M05、M09 | tests/providers/test_sensevoice.py |
| src/voice_server/providers/silero.py | Silero VAD provider，管理连续音频窗口和每实例判定状态。 | M09 | tests/providers/test_silero.py、tests/session/test_auto_vad.py |
| src/voice_server/session.py | 单个 WS 会话的录音、VAD/ASR、上下文、对话、句子/TTS/Opus、播放与打断。 | M05、M06、M09 | tests/session/test_manual_turn.py、tests/session/test_auto_vad.py、tests/session/test_dialogue_backend.py、tests/session/test_abort.py、tests/session/test_isolation.py、tests/session/test_limits.py、tests/session/test_music.py |
| src/voice_server/websocket_server.py | WS 设备身份/认证/hello、每连接会话创建、消息路由与设备 MCP 通道。 | M04、M06、M11 | tests/test_websocket_server.py、tests/test_app.py、tests/integration/test_voice_flow.py |

## scripts 逐文件地图

在线模型脚本需要学习者在后续阶段按当前配置手动选择运行；课程初期优先读代码和对应 fake/离线测试，不自动调用付费服务。日志汇总脚本读取已有文本文件；设备验收日志不作为课程必需输入。

| voice 相对路径 | 用途与模块 | 对应测试或验证 |
|---|---|---|
| scripts/benchmark_llm_first_text.py | 固定文本下测 LLM 首字延迟与 SDK retry 观测；M12。 | 无专属 tests/scripts 文件；与 scripts/benchmark_voice_segments.py 的分位数工具相关。 |
| scripts/benchmark_memory.py | 临时合成 SQLite 历史下测本地写入/检索耗时；M08.04、M12.05。 | tests/memory/test_sqlite.py 验证功能；真实基准命令见 M14.01。 |
| scripts/benchmark_tts_stages.py | 分开测 Edge 媒体抵达、FFmpeg 启动和 PCM 产出阶段；M09.06、M12.05。 | tests/scripts/test_tts_stages.py |
| scripts/benchmark_voice_segments.py | 固定流与真实 TTS 比较句/短语切分的首音频和分位数；M09.05、M12.05。 | tests/session/test_dialogue_backend.py、tests/audio/test_sentences.py；基准运行见 M14.01。 |
| scripts/benchmark_voice_server.py | 临时本机端口启动隔离服务，经 WS 测真实语音 provider 和系统资源；M04.05、M12.05。 | tests/integration/test_voice_flow.py、tests/test_app.py；真实基准运行见 M14.01。 |
| scripts/check_asr.py | 检查指定音频能否经配置的 SenseVoice ASR 转成文字；M09.04。 | tests/scripts/test_connectivity_cli.py；真实检查需模型和输入音频，运行见 M14.01。 |
| scripts/check_llm.py | 用配置的兼容 LLM 对单条文本 prompt 流式生成；M07.03。 | tests/scripts/test_connectivity_cli.py、tests/providers/test_openai_compatible.py；运行见 M14.01。 |
| scripts/check_memory.py | 临时库和合成对话检查真实模型的记住、更正、遗忘闭环；M08.06、M12.06。 | tests/memory/test_facts.py 提供离线行为验证；真实模型脚本运行见 M14.01。 |
| scripts/check_tts.py | 检查配置 TTS 是否输出可播放 WAV 文件；M09.05、M09.06。 | tests/scripts/test_connectivity_cli.py、tests/providers/test_edge_tts.py；运行见 M14.01。 |
| scripts/check_vad_endpoints.py | 重放语音片段和插入停顿，检查本地 Silero 端点切分；M09.03、M12.06。 | tests/providers/test_silero.py、tests/session/test_auto_vad.py |
| scripts/check_voice_turn.py | 用隔离临时记忆执行一轮 ASR→LLM→TTS→Opus 并汇总阶段信息；M06.04、M09.07、M12.05。 | tests/integration/test_voice_flow.py；真实运行需模型、TTS 和 FFmpeg，见 M14.01。 |
| scripts/music_http_server.py | 独立小型 LAN 音乐 HTTP 网关，调用 voice 的 MusicProvider 并转换为设备可读的媒体流；M04.02、M11.05。 | tests/scripts/test_music_http_server.py、tests/session/test_music.py；运行示例见 M14.01。 |
| scripts/summarize_device_timings.py | 从设备日志汇总设备单调时钟上的语音阶段/插话时序；M12.05、M13.05。 | tests/scripts/test_device_timings.py |
| scripts/summarize_voice_timings.py | 读取 voice turn 日志并汇总阶段耗时的 P50/P95；M12.05。 | tests/scripts/test_performance_tester.py；需给定已生成日志样本。 |

## tests 逐文件地图

先用 fake 测试理解逻辑、状态和失败边界；它们不证明真实识别准确率、云服务可用、声学效果或硬件播放效果。每一项都属于 VOICE_ROOT 下测试源文件。

| voice 相对路径 | 教学验证主题 | 模块 |
|---|---|---|
| tests/audio/test_opus.py | 输入/输出 Opus 帧编解码、帧尾和错误输入。 | M09 |
| tests/audio/test_sentences.py | 流式增量分句、长度上限、标点和首段边界。 | M09 |
| tests/audio/test_transcoder.py | FFmpeg 转码、输出 PCM、流式早产出与取消时进程回收。 | M05、M09 |
| tests/browser/local_test.test.cjs | 浏览器侧麦克风、持续监听、回合打断、相机页面交互。 | M10、M11 |
| tests/fakes.py | 复用的假 transport、provider 和可控等待对象；教材测试替身示例。 | M02、M12 |
| tests/http/test_admin_api.py | 管理 API 的认证、JSON/limit 校验、记忆/事实操作、设备会话工具边界。 | M04、M08、M11 |
| tests/http/test_ota.py | OTA URL、健康/就绪、上传图片和配置认证。 | M04、M11 |
| tests/integration/test_local_testing.py | 测试页后端 HTTP/WS、设备列表、历史、MCP 和浏览器桥接。 | M04、M10、M11 |
| tests/integration/test_voice_flow.py | 真实监听器和 SQLite/Opus 配合假 provider 的完整协议语音路径。 | M06、M09、M12 |
| tests/memory/test_facts.py | 事实的来源校验、用户更正、遗忘、后台整理取消及持久化迁移行为。 | M05、M08 |
| tests/memory/test_service.py | 摘要阈值、失败回退、设备任务、关闭及运行中清理。 | M05、M08 |
| tests/memory/test_sqlite.py | SQLite 召回排序、设备隔离、保留/清理和摘要 checkpoint。 | M03、M08 |
| tests/protocol/test_messages.py | 客户端协议解析、输入类型、server message 格式和无效数据。 | M04、M06 |
| tests/protocol/test_state.py | 会话状态迁移、拒绝非法顺序、abort 和 disconnect。 | M02、M06 |
| tests/providers/test_edge_tts.py | Edge stream 到 PCM、分块、空输出、失败与关闭。 | M05、M09 |
| tests/providers/test_local_tts.py | 本地命令 TTS 输入输出和错误处理。 | M09 |
| tests/providers/test_openai_compatible.py | 流式文本、客户端生命周期、取消和配置默认值。 | M05、M07 |
| tests/providers/test_sensevoice.py | ASR 输入格式、模型调用限制和取消语义。 | M05、M09 |
| tests/providers/test_silero.py | VAD 输入窗口、阈值/状态、重置及运行会话配置。 | M09 |
| tests/scripts/test_connectivity_cli.py | 检查脚本 CLI 配置入口参数行为。 | M00、M09 |
| tests/scripts/test_device_timings.py | 设备时序日志解析和汇总。 | M12、M13.05 |
| tests/scripts/test_music_http_server.py | 独立音乐网关 URL/HTTP/媒体返回边界。 | M04、M11 |
| tests/scripts/test_performance_tester.py | 基准 CLI、耗时统计与汇总脚本行为。 | M12 |
| tests/scripts/test_tts_stages.py | TTS 阶段对比基准脚本的输入与结果结构。 | M09、M12 |
| tests/session/test_abort.py | 打断取消、旧回合丢弃、停止音频、部分发送记忆。 | M05、M06、M09 |
| tests/session/test_auto_vad.py | 自动 VAD 端点、静音忽略、长度限制与持续监听重装。 | M06、M09 |
| tests/session/test_dialogue_backend.py | 可注入后端的上下文、TTS 预取、分句队列和取消。 | M05、M06、M07 |
| tests/session/test_isolation.py | 两个 device/session 的 VAD、transport 和 memory 隔离。 | M06、M08、M09 |
| tests/session/test_limits.py | 输入长度、provider 超时、错误恢复、空输出、取消预算。 | M05、M06、M09 |
| tests/session/test_manual_turn.py | 手动录音 start/stop/detect 和一轮回复行为。 | M04、M06 |
| tests/session/test_music.py | 点歌意图提取及连接到音乐 provider/设备输出路径。 | M06、M11 |
| tests/test_app.py | 配置组装、listener 生命周期和关闭资源。 | M02、M06 |
| tests/test_auth.py | 认证方式选择与 token 比较行为。 | M03、M11 |
| tests/test_camera_dialogue.py | MCP 工具循环、工具映射、快捷命令、结果和视觉支路。 | M07、M11 |
| tests/test_camera_mcp.py | 浏览器 camera MCP 请求、会话绑定、请求等待与断开。 | M04、M11 |
| tests/test_config.py | YAML/env 配置合并、字段校验和无效配置拒绝。 | M03 |
| tests/test_device_mcp.py | 已取消运动调用后停止设备动作的路径。 | M05、M11 |
| tests/test_environment.py | .env 读取优先级、字面值和环境保留规则。 | M03 |
| tests/test_logging_utils.py | 日志映射数据中的敏感字段遮盖。 | M12 |
| tests/test_py310_compat.py | Python 版本兼容超时函数的成功、超时和取消行为。 | M00、M02、M05 |
| tests/test_websocket_server.py | hello/headers/auth、连接路由、设备 MCP 消息和断连行为。 | M04、M06、M11 |

## 浏览器页面、配置、运行和部署文件

| voice 相对路径 | 职责与第一次使用 |
|---|---|
| local_test/index.html | 浏览器测试页结构和控件；M10。 |
| local_test/app.js | 浏览器交互、麦克风/扬声器、WS 状态和摄像头流程；M10。 |
| local_test/pcm-worklet.js | 音频 worklet 的 PCM 采集与帧间传递；M10。 |
| local_test/styles.css | 测试页布局和状态展示样式；M10，辅助阅读。 |
| run.py | 直接启动 voice 服务并设置 src 导入路径；M00、M06。 |
| local_test.py | 启动独立浏览器测试页面服务；M00、M10。 |
| performance_tester.py | voice provider 冒烟/基准 CLI 的薄入口；M00、M12。 |
| config.example.yaml | 可复制的 YAML 配置模板及各 section 关系；M03。 |
| .env.example | 环境变量名称模板；M03。课程只讲变量接口，不读取任何真实 .env。 |
| pytest.ini | pytest discovery/config；M12。 |
| requirements.txt | 主运行依赖清单；M00。 |
| requirements-dev.txt | 开发/测试依赖清单；M00、M12。 |
| requirements-test.txt | 测试环境依赖清单；M00、M12。 |
| requirements-music.txt | 独立音乐 gateway 的可选依赖清单；M00、M11。 |
| deploy/Caddyfile.example | Caddy TLS reverse-proxy 示例；M14.01，扩展见M15.04。 |
| deploy/nginx.conf.example | Nginx TLS、WebSocket 转发和连接限制示例；M14.01，扩展见M15.04。 |
| README.md | 模块总览、Windows 环境、配置、启动、设备连接和验收指引；M00、M14。核对下方文档冲突后再当作当前事实。 |
| docs/local-testing.md | 浏览器/设备/相机测试步骤；M00、M10、M11。 |
| docs/voice-agent-integration.md | DialogueBackend 契约、生命周期、上下文和 Agent 接入例子；M06、M07。 |
| docs/upstream-voice-comparison.md | 与上游项目功能差异的历史说明；M14。含有过时的 ESP32 插话结论，见下节。 |
| docs/server-work-log.md | 项目实现过程的工作记录；M14。作为历史背景，不覆盖现有源码和可运行测试。 |
| docs/superpowers/plans/2026-08-06-voice-server.md | 最初的实现计划和架构约束；M14。标为历史计划，现状需以源码、测试和较新文档核对。 |

## 外围 Deskbot 模块：只学接口与运行方法

外围路径均相对 DESKBOT_ROOT。它们不是本次 voice 源码逐文件覆盖范围；教材只讲协议、启动方式和已验证的边界，不要求初学者先读完整 C++/视觉实现。

| 外围模块入口 | 已核对的接口/运行边界 | 教材安排 |
|---|---|---|
| firmware/lichuang-s3/source/xiaozhi-esp32/main/application.cc、main/protocols/protocol.h、main/protocols/protocol.cc、main/protocols/websocket_protocol.cc | 固件负责设备生命周期、WebSocket 控制和音频；voice 端通过 OTA 地址取得 WebSocket v1 URL，发送 hello/控制消息并传原始 Opus 帧。相关 MCP handshake 在 main/mcp_server.h/.cc。当前固件源码含 AEC/realtime/WebSocket 的设备端插话交接路径。 | M04、M11.07讲接口字段和客户端/服务端时序；M13.05再按板卡文档读运行入口、固件配置并真机测量，不要求零基础者先读 C++ 内部。构建入口见该固件仓库的 scripts/build.py，按其 README/AGENTS 的 ESP-IDF 版本要求操作。 |
| server/vision/deskbot_vision/http_server.py；server/vision/README.md | 独立视觉服务提供 health 与 POST /mcp/vision/explain，默认 8005；README 给出的运行方式是从 server/vision 启动 python -m deskbot_vision.http_server。该模块也接受 multipart 图片请求。 | M11 只讲 HTTP 契约和如何启动/检查；不纳入本课程的视觉模型内部实现。voice 自身已有 OpenAI-compatible vision provider 和 OTA 上传路由；只有配置实际指向独立模块时才把它列为运行依赖。 |
| tools/deskbot_launcher.py、tools/restart_deskbot.sh、tools/stop_deskbot.sh | 桌面启动器管理本地 voice 与浏览器测试页进程，并可选择本机模型/视觉模式；README 指出面板入口和测试页地址。 | M00 用直接 CLI 理解服务后，再把桌面面板作为便捷启动入口；课程不先精读启动器实现。 |
| protocol/README.md、protocol/schema/envelope.schema.json | Deskbot 更大工程的跨模块 JSON envelope；voice 语音 WebSocket v1 是另一条协议边界。 | 在M04.04与M11.07比较两套协议，后续仅按实际事件对接需求扩展；不要把 envelope 和 voice 的 JSON-RPC/WebSocket 消息混为一谈。 |

## 文档冲突与验收边界

目前有一个已知的 ESP32 插话文档冲突：

- voice/README.md 描述了设备端 AEC + realtime + WebSocket 插话路径；固件当前实现入口可在 DESKBOT_ROOT 下的 firmware/.../main/application.cc 和 protocols 中看到。
- voice/docs/local-testing.md 与 voice/docs/upstream-voice-comparison.md 仍有“ESP32 尚无回复期间 VAD 自动打断”的旧说法。
- 更近期的 DESKBOT_ROOT/docs/voice-improvements-progress-2026-11-04.md 记录了固件代码与离线链路验证；DESKBOT_ROOT/docs/voice-device-timing-and-acceptance-2026-11-04.md 仍将回声误触发率、实际停音、首字完整性等列为实机验收。课程应明确区分“代码存在”“离线测试覆盖”“真实麦克风/扬声器已验收”三件事，不能把前两项当成最后一项。
- README 中有关浏览器自动插话的描述与 local_test 实现相对应；它不能单独证明 ESP32 麦克风在设备自身播放期间工作正常。

在电脑端先用 local_test 页面走通文本和浏览器音频链路，摄像头可作为第二条工具链。浏览器功能通过之后，才连接 ESP32。实机需要按已有设备计时/验收说明复核目标板、AEC 模式和硬件回声效果。

## 给后续教材生成器的编写约束

1. 使用 M00–M15 编号和本文件中的文件职责；每一课说明先修、目标、关键概念、逐步代码阅读路径、一个小练习、一个掌握检查、测试证据和未验证边界。
2. 零基础部分先补必要的 Python/网络基础，随后从浏览器本机测试而非真实机器人开始。不要要求读者先安装/烧录 ESP-IDF 或付费模型。
3. Agent 核心教学应单独讲清：LLM 只提出 tool call；应用查找、验证和执行具体 Python 工具；结果再作为消息交回 LLM；Session 再把最终文本交给 TTS。先练文字链路，之后再连接语音。
4. 先让学习者读懂已有实现，特别是 provider 契约、DialogueBackend、session 和现有设备/摄像头工具调用；改进前要有一个可复现例子和对应测试，再决定小改动。不要为了框架名或技术关键词重写已有记忆和音频底座。
5. 对线上 provider 脚本标注网络/模型/API 条件与成本，提供离线替代阅读和 fake 测试。不要在教材示例中放真实 .env 或密钥。
6. 使用相对 VOICE_ROOT 的路径；若链接到外围代码，标清 DESKBOT_ROOT。不要猜测行号，生成教材时再按当前源码核对。
7. 不把文档中的数字、模型名称、IP、硬件行为或“已通过”当成永恒事实；每次演示前看当前配置和测试证据。项目展示的数据只来自实际执行并记录条件的测量。
8. 源码清单覆盖 40 个 src 文件；scripts/tests 表分别覆盖 14/41 个 rg 可见文件；加浏览器 4、配置/根目录 11、部署 2、文档 5，总计 117。后续若 rg --files 结果变化，先更新此地图，再据此生成课程。


## 函数覆盖记录

文件已列入地图不等于该文件已讲完。授课AI每次读当前文件，列出自有类、函数、方法与主要分支；当前课只登记实际教学过的部分，余下内容安排到相应后续课。测试和脚本也要记录尚未讲解的入口与断言，不以“辅助代码”整体略过。

批量编写教材时，将已经写入教材的文件/符号及对应课号记录在[AUTHORING_STATUS.md](AUTHORING_STATUS.md)的模块检查区；这是教材覆盖情况。下面的progress.md模板用于学生日后实际学习时的理解证据，两者分别维护。

后续在progress.md中按文件追加以下记录：

| 文件 | 本课课号 | 已讲清的类/函数/主要分支 | 尚未讲解部分及计划课号 | 独立讲回或修改证据 |
|---|---|---|---|---|
| 实际相对路径 | Mxx.yy | 实际符号名 | 实际剩余符号 | 可观察结果或待验收 |

毕业前再遍历当前可见文件清单，对照记录确认完整覆盖；新增文件按职责补到原模块，不默认为已学。
