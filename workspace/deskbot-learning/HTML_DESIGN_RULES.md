# Deskbot 交互式 HTML 课程视觉规范与组件速查手册

所有课程页（`lessons/Mxx.yy.html`）与课程入口（`index.html`）**必须统一使用 `assets/deskbot-course.css` 与 `assets/deskbot-course.js` 设计系统**，严禁每节课各写一套零散样式或引用外部受限 CDN（保证 100% 本地离线秒开、浅色暖纸与深色夜间双主题自适应）。

---

## 一、新建与校验一节课的标准 4 步流水线

编写任何新课（如 `M00.02`）时，严格使用内置工具 `scripts/course_tool.py`：

1. **一键从模板生成骨架与练习目录**：
   ```bash
   python3 workspace/deskbot-learning/scripts/course_tool.py new M00.02
   ```
   自动从 `syllabus.md` 读取标题、阶段、白盒/灰盒标签与前后课导航，生成 `lessons/M00.02.html` 与 `exercises/M00.02/`。
2. **用工具精确提取真实 Deskbot 源码（严禁手抄或盲猜行号！）**：
   ```bash
   python3 workspace/deskbot-learning/scripts/course_tool.py snippet src/voice_server/camera_dialogue.py 315 351
   ```
   工具会自动读取 `/home/yyy/desktop/ai/Deskbot/server/voice` 对应行、完成 HTML 转义并输出带准确 `data-file` 与 `data-start` 的 `<pre>` 标签（且自动拦截私有 `.env`）。
3. **填充 7 个教学板块与配套 `exercises/Mxx.yy/task.py` + `solution.py`**，并在本地实际运行 `python3 exercises/Mxx.yy/solution.py` 核对真实输出。
4. **交付前必跑自动化检查（必须 0 错误通过！）**：
   ```bash
   python3 workspace/deskbot-learning/scripts/course_tool.py check --all
   ```
   自动检查：无残留 `TODO-LESSON` 占位符、无相对路径断链、`.code-walk` 的 `data-lines` 未越界、全部内联 `<script>` 通过 `node --check` 语法检查、无敏感密钥泄露。

---

## 二、HTML 页面三栏布局与必备头部结构

- **左栏 `<nav id="dk-toc"></nav>`**：保持空标签即可，`deskbot-course.js` 会自动提取正文 `h2` / `h3` 生成悬浮目录并随滚动高亮。
- **中栏 `<main class="dk-main">`**：正文阅读区（最大舒适宽度 `790px`）。章节标题统一写为：
  ```html
  <h2><span class="num">01</span>问题引入：为什么需要这一环？</h2>
  ```
- **右栏 Tufte 边注 `<aside class="sidenote">补充说明…</aside>`**：直接写在正文段落旁即可；宽屏（`>1320px`）自动浮动到右侧留白栏，中窄屏优雅折叠为侧边提示条。
- **顶部悬浮工具栏与阅读进度条**：由 `deskbot-course.js` 自动注入（含 `📚 目录` · `🌓 主题切换` · `展开全部` · `↑ 顶部`），无需在 HTML 手写。

---

## 三、核心教学组件库（直接复制组合，禁止自造样式）

### 1. 九种语义卡片（`.callout`）
```html
<div class="callout intuition">
  <span class="ct">一句话直觉</span>
  <p>把抽象机制映射成一眼能懂的日常画面。</p>
</div>
```
支持的修饰类：
- `intuition`（💡 生活直觉）
- `syntax`（🔤 零基础语法要点）
- `principle`（🔧 架构原理）
- `bug`（💥 源码真实缺陷 / PR 改造动机）
- `warn`（⚠️ 防坑与真实物理边界）
- `lab`（🧪 动手实验要求）
- `interview`（🎤 深圳 Agent 岗 30 秒回答模板）
- `summary`（📌 本课浓缩）
- `source`（📚 关联课程章节与文件）

### 2. 零基础语法拆桥双栏卡（`.syntax-bridge`，首次出现新语法必用！）
左栏用 5–8 行纯标准库极简例子讲清语法符号，右栏展示 Deskbot 源码里的真实写法：
```html
<div class="syntax-bridge">
  <div class="sb-col">
    <span class="sb-tag">1 · 极简日常小例子（零前置）</span>
    <pre data-file="最小例子"><code class="language-python">scores = {"asr": 120, "llm": 450}
print(scores.get("tts", 0))  # 键不存在时安全返回默认值 0，不报错</code></pre>
    <p class="small">花括号 <code>{}</code> 表示字典；<code>.get(键, 默认值)</code> 避免了直接写 <code>scores["tts"]</code> 触发 <code>KeyError</code> 崩溃。</p>
  </div>
  <div class="sb-col project">
    <span class="sb-tag">2 · Deskbot 真实源码写法</span>
    <pre data-file="src/voice_server/session.py" data-start="330"><code class="language-python">metrics["tts_ms"] = round(metrics.get("tts_ms", 0.0) + elapsed_ms, 1)</code></pre>
    <p class="small">第 1 句语音合成前 <code>metrics</code> 里还没有 <code>"tts_ms"</code>，用 <code>.get("tts_ms", 0.0)</code> 实现安全累加。</p>
  </div>
</div>
```

### 3. 双栏源码聚光灯走读（`.code-walk`）
左侧放 `course_tool.py snippet` 生成的 `<pre data-file="..." data-start="...">`，右侧放 `ol.walk > li[data-lines="起-止"]`（行号必须与左侧真实行号一致！点击卡片会自动高亮对应行并平滑滚动）：
```html
<div class="code-walk" data-dim>
<pre data-file="src/voice_server/dialogue.py" data-start="37"><code class="language-python">class LLMDialogueBackend:
    def __init__(self, llm: LLMProvider) -&gt; None:
        self._llm = llm

    def stream(self, request: TurnRequest) -&gt; AsyncIterator[str]:
        return self._llm.stream(request.messages)</code></pre>
  <ol class="walk">
    <li data-lines="38-39"><strong>保存模型组件</strong>：初始化时把符合 <code>LLMProvider</code> 契约的对象存进 <code>self._llm</code>（测试时可传入 FakeLLM）。</li>
    <li data-lines="41-42"><strong>转发消息流</strong>：把会话层组装好的 <code>request.messages</code> 交给模型，逐块返回可朗读文字。</li>
  </ol>
</div>
```

### 4. 四类零依赖动态交互组件（在底部 `DeskCourse.ready(() => { ... })` 中调用）

#### (A) Agent 消息流 / 工具循环 / 协议帧回放器：`DeskCourse.tracePlayer(target, spec)`
最适合语音链路、工具调用循环、错误自愈与打断课，支持多场景切换、可选联动顶部 SVG 流程图、键盘 `← →` 步进与累积轨迹查看：
```js
DeskCourse.tracePlayer("#sim-turn", {
  graph: {
    width: 720, height: 110,
    nodes: [
      { id: "client", label: "浏览器/设备", sub: "采集与播放", x: 75, y: 55, w: 116, h: 50 },
      { id: "server", label: "VoiceSession", sub: "状态与组装", x: 265, y: 55, w: 126, h: 50 },
      { id: "agent",  label: "AgentBackend", sub: "决策与循环", x: 465, y: 55, w: 126, h: 50 },
      { id: "tool",   label: "MCP 工具",     sub: "真实执行",   x: 645, y: 55, w: 112, h: 50 }
    ],
    edges: [
      { id: "e1", from: "client", to: "server", label: "请求" },
      { id: "e2", from: "server", to: "agent",  label: "TurnRequest" },
      { id: "e3", from: "agent",  to: "tool",   label: "tools/call" }
    ]
  },
  scenarios: [
    {
      label: "场景 1：工具调用闭环",
      summary: "观察模型提出请求、Python 执行工具并将结果回传模型的全过程。",
      steps: [
        { node: "client", edge: "e1", role: "client", badge: "CLIENT", state: "LISTENING",
          title: "用户发起请求", explain: "用户询问设备状态。", data: '{"text": "查询设备状态"}', lang: "json", source: "session.py::handle_text" }
      ]
    }
  ]
});
```
*(若同一链路在不同场景有“跳过环节”对比，可传入 `allStages: [{id, title, role, badge}]` 与场景级 `skippedStages: ["asr"]`，按钮会自动置灰标为“跳过”。)*

#### (B) 分步推导/状态推进器：`.dk-stepper` + `DeskCourse.onStep`
适合 SQL 表变化、RRF 公式手算、并发时序步进（设 `data-mode="accumulate"` 可保留已展开步骤）：
```html
<div class="dk-stepper" id="step-demo" data-title="RRF 倒数排名融合 3 步手算" data-mode="accumulate">
  <div class="step" data-title="词面检索排名"><p>...</p></div>
  <div class="step" data-title="向量语义排名"><p>...</p></div>
</div>
```

#### (C) 多方案/改前改后对比标签页：`.dk-tabs`
```html
<div class="dk-tabs">
  <div class="tab" data-label="❌ 原版：提前 return 丢掉后半句">...</div>
  <div class="tab" data-label="✅ PR-1：收口至 Agent Loop 多步执行">...</div>
</div>
```

#### (D) 参数滑块实验台与柱状对比图：`DeskCourse.playground` + `DeskCourse.bars` + `DeskCourse.readout`
适合 PCM 字节换算、VAD 静音阈值实验、Prompt Cache 命中率、首字延迟 P50/P95 对比。

### 5. 本地终端实验盒（`.terminal-lab`）+ 折叠提示/答案（`details.reveal`）+ 讲回草稿箱（`[data-teachback]`）
直接使用 `templates/lesson.html` 第 `05` 与 `07` 节的标准结构。讲回草稿箱会自动根据 `<meta name="dk:lesson" content="Mxx.yy">` 隔离保存在浏览器本地，并提供「📋 一键复制我的回答发给 AI 老师验收」按钮。
