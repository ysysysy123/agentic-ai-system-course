# Deskbot 交互式 HTML 教材：按阶段分批制作交接书（38 课版）

更新日期：2026-11-26

---

## 一、核心任务与「阶段闸门（Stage Gate）」规则

本任务面向一位**编程与 Agent 完全零基础、目标深圳 Agent 岗求职、手头有 ESP32 实机但本地日常以模拟为主**的学习者，围绕 `/home/yyy/desktop/ai/Deskbot/server/voice` 制作一套 **6 个阶段（`M00`–`M05`）、共 38 课**的离线交互式 HTML 实战课程。

> **最重要的执行红线（为什么不能一口气生成全部 38 课）**：
> 这是一套**边学边改**课程！学习者在 `M01.06–07`、`M02.02/06`、`M03.06`、`M04.03`、`M05.01–02` 会亲手重构 `Deskbot/server/voice` 的核心源码。
> 因此，**教材编写必须按阶段（1 个阶段 = 5～8 课）分批推进**：
> - 每次接手教材制作任务，**只连续完成当前解锁的那 1 个阶段**（如果额度充足且用户明确要求提前备课，最多只允许连续生成 `M00` + `M01` 共 12 课，因为第一次修改 Deskbot 源码发生在 `M01.06`）。
> - 从 `M02` 开始，每一阶段的教材**必须在学习者完成上一阶段的源码改造（或明确跳过/定稿当前源码状态）之后**，重新读取最新的 `/home/yyy/desktop/ai/Deskbot/server/voice` 源码再编写，确保 HTML 中的代码片段、符号名与行号永远与真实仓库一致！

---

## 二、接手必读文件顺序

1. `/mnt/study/github/agentic-ai-system-course/AGENTS.md`：全局师徒准则，**严禁修改 `course/` 与 `references/`**。
2. 本文件（`HANDOFF.md`）与 [AUTHORING_STATUS.md](AUTHORING_STATUS.md)：确认当前处于哪个阶段、下一课是哪一课。
3. [syllabus.md](syllabus.md)：唯一权威的 **38 课大纲**（每课首讲语法、源码范围、HTML 交互规格、动手实验与验收标准）。
4. [improvement-roadmap.md](improvement-roadmap.md)：5 大求职级实战升级（PR-1～PR-5）与 30 条自动化 Eval 题库规格。
5. [source-map.md](source-map.md)：117 个项目文件的归属与`白盒精读` / `灰盒走读`深度边界。
6. [ai-authoring-guide.md](ai-authoring-guide.md) 与 [HTML_DESIGN_RULES.md](HTML_DESIGN_RULES.md)：零基础拆桥规范、统一 HTML 视觉组件手册与 4 步自动化建课流程。
7. [templates/lesson.html](templates/lesson.html)、[lessons/M00.01.html](lessons/M00.01.html)、`assets/deskbot-course.css`、`assets/deskbot-course.js`、`scripts/course_tool.py`：标准单课母版、第 1 课完成样板、共享 UI 运行时与 CLI 校验工具。
8. [progress.md](progress.md)：学生的真实学习验收进度（制作课件时只读，绝不把“课件已生成”写成“学生已掌握”）。

---

## 三、六个分批生产批次（Batches & Gates）

| 批次 | 阶段与课号范围 | 课数 | 源码读取与阶段闸门（Gate）条件 |
|---|---|---:|---|
| **Batch 0** | **`M00`**：`M00.01`–`M00.05` | 5 课 | **✅ 已全部完成并校验通过**（含配套 `exercises/M00.02`–`M00.05` 与 `pytest` 验证）。 |
| **Batch 1** | **`M01`**：`M01.01`–`M01.08` | 8 课 | 读取原始 `dialogue.py`、`openai_compatible.py`、`camera_dialogue.py`、`logging_utils.py`。在 `M01.06–07` 给出 PR-1（`ToolRegistry` + 复合指令修复）与 PR-2（分级自愈 + Doom-Loop）的完整教学指引与练习沙盒。<br>**🛑 Gate 1**：停下等待学生学完 `M01` 并落盘 PR-1 & PR-2！ |
| **Batch 2** | **`M02`**：`M02.01`–`M02.07` | 7 课 | 重新核对 Gate 1 后的最新 `session.py` / 对话后端与 `memory/` 全目录源码，编写 SQLite、Prefix Cache 分层（PR-3 上）与 FTS5+RRF 混合召回（PR-4）课程。<br>**🛑 Gate 2**：停下等待学生完成 `M02` 与 PR-3 上 / PR-4！ |
| **Batch 3** | **`M03`**：`M03.01`–`M03.07` | 7 课 | 读取最新 `app.py`、`websocket_server.py`、`session.py`、`audio/`、语音 `providers/` 与压测脚本，编写异步队列、抢话打断与闲聊首字流式优化（PR-3 下）课程。<br>**🛑 Gate 3**：停下等待学生完成 `M03` 与 PR-3 下！ |
| **Batch 4** | **`M04`**：`M04.01`–`M04.05` | 5 课 | 读取 `local_testing.py`、`local_test/`、`camera_mcp.py`、`device_mcp.py`、`openai_vision.py`、`admin_api.py`、`ota.py`、`music.py` 及外围视觉/固件接口，完成本地模拟全链路与可选 ESP32 联调课。<br>**🛑 Gate 4**：停下等待学生完成端到端联调验收！ |
| **Batch 5** | **`M05`**：`M05.01`–`M05.06` | 6 课 | 基于前四阶段最终代码，编写 `TurnTrace` + Token 账本（PR-5 上）、30 条自动化 Eval 套件（PR-5 下）、前后量化对照实验、架构复盘文档与深圳模拟面试通关课。 |

---

## 四、技术与工程护栏（避坑必看）

1. **统一使用内置模板与 CLI 工具链（严禁自造零散样式或盲猜源码行号）**：
   - 新建课程一律运行：`python3 workspace/deskbot-learning/scripts/course_tool.py new <Mxx.yy>`（自动从 `templates/lesson.html` 与 `syllabus.md` 生成骨架和 `exercises/<Mxx.yy>/` 目录）。
   - 提取真实源码一律运行：`python3 workspace/deskbot-learning/scripts/course_tool.py snippet <相对路径> <起行> <止行>`（自动核对行号、HTML 转义并安全拦截 `.env`）。
   - 所有页面统一引用 `../assets/deskbot-course.css` 与 `../assets/deskbot-course.js`（组件用法详见 [HTML_DESIGN_RULES.md](HTML_DESIGN_RULES.md)，真实样板见 `lessons/M00.01.html`）。
   - 每完成一课及整批收尾时，必须运行 `python3 workspace/deskbot-learning/scripts/course_tool.py check --all` 并确保 100% 零报错通过！
2. **练习代码目录隔离**：
   - 每课配套的可运行小脚本放在 `workspace/deskbot-learning/exercises/Mxx.yy/`，提示与参考实现用清晰文件名（如 `task.py` vs `solution.py`）分开；运行产生的临时 `.db` 或日志放入 `outputs/` 并保持忽略。
   - **编写教材本身绝不直接篡改正在使用的 `/home/yyy/desktop/ai/Deskbot/server/voice` 源码**！PR-1～PR-5 的真实仓库改动只在学生进入该课时（或明确要求你实施该 PR 时）在测试保护下执行。
3. **真实仓库双路径说明**：
   - 本机课程目录：`/mnt/study/github/agentic-ai-system-course`
   - 本机 Deskbot 源码目录：`/home/yyy/desktop/ai/Deskbot/server/voice`（外围接口位于 `/home/yyy/desktop/ai/Deskbot`）
   - 若在无本地源码环境编写：缺少对应源码文件时明确列出缺失文件路径并暂停该课源码区，**严禁凭记忆编造文件路径、类名、函数签名、行号或假测试结果**。
4. **准确更新索引与断点**：
   - 每完成并校验一课，立刻更新 [AUTHORING_STATUS.md](AUTHORING_STATUS.md) 的状态与校验记录，并将 `index.html` 中对应条目从“待编写”改为可点击的 `<a href="lessons/Mxx.yy.html">`。若遇上下文或额度上限，保存完整单课并在 `AUTHORING_STATUS.md` 写明精确断点。

---

## 五、一键复制给其他 AI 开始生成下一阶段（Batch 1：`M01.01`–`M01.08`）的指令

```text
请接手我的 Deskbot 零基础交互式课程下一阶段的编写任务。
先读取仓库根 AGENTS.md，以及 workspace/deskbot-learning/ 下的 HANDOFF.md、AUTHORING_STATUS.md、HTML_DESIGN_RULES.md、syllabus.md、source-map.md、improvement-roadmap.md、ai-authoring-guide.md，并查看 templates/lesson.html 与已完成的 M00.01～M00.05 课程页。

当前 Batch 0（M00 全 5 课）已完成。请现在执行 Batch 1：使用 `python3 workspace/deskbot-learning/scripts/course_tool.py new <课号>` 与 `snippet` 工具，完整编写并校验阶段 M01 的全部 8 课（M01.01 ～ M01.08）交互式 HTML 页面及 exercises/M01.0x/ 配套 Python 小实验，同时把 lessons/M00.05.html 底部的下一课导航链接更新为 M01.01.html。

注意阶段闸门（Gate 1）：M01.08 完成后必须立即停止，等待我学完 M01 并落地 PR-1/PR-2 源码改造，绝不提前生成 M02 及之后阶段！
严格遵守 HTML_DESIGN_RULES.md 的组件规范（.syntax-bridge 拆解首次出现语法、tracePlayer/flowGraph/playground 离线交互模拟器、.code-walk 真实源码聚光灯走读），不读私有 .env、不直接改 Deskbot 源码。每完成一课运行 `python3 workspace/deskbot-learning/scripts/course_tool.py check --all` 确保零错误，最后更新 index.html 与 AUTHORING_STATUS.md。
```
