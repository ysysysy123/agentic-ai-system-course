"use strict";

(() => {
  const voiceQuestion = "请简单解释什么是语音助手。";
  const answer = "语音助手可以通过说话接收请求，并给出回应。";
  const dialogue = [
    {id:"capture", title:"采集声音", role:"客户端 · 浏览器", explain:"浏览器经用户许可，从麦克风接收声音数据。此时数据还是声音。", data:"输入：麦克风中的声音\n输出：声音数据", source:"local_test/app.js · 麦克风采集"},
    {id:"vad", title:"判断说完", role:"浏览器测试桥 / 语音会话", explain:"语音活动检测（VAD）帮助判断有没有讲话，再结合静音时长或手动停止，划分一次发言。", data:"声音片段 → 有人说话 → 发言结束", source:"local_testing.py；session.py::handle_audio"},
    {id:"asr", title:"声音 → 文字", role:"服务端 · ASR", explain:"自动语音识别把这段声音转写成文字。声音识别错了，后面的模型也可能收到错误问题。", data:"转写：" + voiceQuestion, source:"session.py::_run_pipeline；providers/sensevoice.py"},
    {id:"context", title:"准备上下文", role:"服务端 · 记忆与会话", explain:"程序准备当前问题、相关历史和助手说明，决定这次模型能参考什么。文字输入可以直接从这里开始。", data:"当前问题：" + voiceQuestion + "\n相关信息：对话历史、偏好、回答方式", source:"session.py::_make_messages；memory/"},
    {id:"model", title:"生成回答文字", role:"语言模型 · 本机或远程", explain:"普通问答中，对话后端把消息交给语言模型，接收生成的回答文字。这里还没有用户实际听到的声音。", data:"回答文字：" + answer, source:"dialogue.py::LLMDialogueBackend；providers/openai_compatible.py"},
    {id:"tts", title:"文字 → 声音", role:"服务端 · TTS", explain:"语音合成把回答文字变成声音数据。数据仍要经过发送、接收和播放。", data:"输入：" + answer + "\n输出：合成的声音数据", source:"providers/edge_tts.py 或 providers/local_tts.py"},
    {id:"play", title:"返回并播放", role:"服务端 → 客户端", explain:"服务端发送声音数据，浏览器接收并播放。到这一步，用户才听到回答；声音已发送与已播放是两个位置。", data:"声音发送 → 浏览器接收 → 扬声器播放", source:"session.py::_speak_sentence；local_test/app.js"}
  ];
  const toolSteps = [
    {id:"request",title:"用户提出任务",role:"用户 → 助手程序",explain:"用户问设备状态。程序准备问题、上下文和当前可用工具说明。",data:"用户：查询一下设备状态。",source:"session.py::_run_pipeline；TurnRequest"},
    {id:"choose",title:"模型提出请求",role:"语言模型",explain:"模型判断需要设备信息，提出工具请求。此时还没有真正读取设备。",data:'工具请求示意：self.get_device_status\n参数：{}',source:"OpenAICompatibleLLMProvider.stream_with_tools"},
    {id:"execute",title:"程序执行工具",role:"助手程序 → 工具服务",explain:"程序检查当前连接和可用工具，发起调用。实际读取由工具与设备完成。",data:"_execute → 当前设备工具通道\n读取设备状态（教学示意）",source:"camera_dialogue.py::_execute/_execute_impl；device_mcp.py"},
    {id:"result",title:"结果返回上下文",role:"工具 → 助手程序 → 模型",explain:"设备结果返回后，程序把成功结果和调用标识放进工具消息，提供给下一次模型调用。",data:"模拟结果：设备在线，电量 76%\n这是固定示例，不是当前设备读数。",source:"camera_dialogue.py::stream · role=tool"},
    {id:"respond",title:"根据结果回答",role:"模型与语音后端",explain:"模型根据结果形成回答文字，再由语音层处理朗读。这个例子演示工具循环，不代表所有请求都经过它。",data:"示例回答：设备在线，电量为 76%。",source:"camera_dialogue.py::stream → TTS → 客户端"}
  ];
  const skipped = new Set(["capture","vad","asr"]);

  function initSimulator(root) {
    const isDialogue = root.dataset.simulator === "dialogue";
    const stages = isDialogue ? dialogue : toolSteps;
    let mode = "voice";
    let cursor = 0;
    const grid = root.querySelector("[data-stage-grid]");
    const previous = root.querySelector('[data-action="previous"]');
    const next = root.querySelector('[data-action="next"]');

    stages.forEach((stage, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stage-button";
      button.dataset.stage = stage.id;
      button.setAttribute("aria-label", "查看环节：" + stage.title);
      const number = document.createElement("span");
      number.className = "stage-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("strong");
      title.textContent = stage.title;
      const role = document.createElement("span");
      role.className = "stage-role";
      role.textContent = stage.role;
      button.append(number, title, role);
      button.addEventListener("click", () => {
        const indexInActive = activeStages().findIndex(item => item.id === stage.id);
        if (indexInActive !== -1) {
          cursor = indexInActive;
          render();
        }
      });
      grid.append(button);
    });

    function activeStages() {
      return isDialogue && mode === "text" ? stages.filter(stage => !skipped.has(stage.id)) : stages;
    }

    function render() {
      const active = activeStages();
      const current = active[cursor];
      const activeIds = active.map(stage => stage.id);
      grid.querySelectorAll("[data-stage]").forEach(button => {
        const at = activeIds.indexOf(button.dataset.stage);
        button.classList.toggle("active", at === cursor);
        button.classList.toggle("done", at >= 0 && at < cursor);
        button.classList.toggle("skipped", at === -1);
        button.disabled = at === -1;
        if (at === cursor) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
        button.querySelector(".stage-number").textContent = at === -1 ? "跳过" : String(at + 1).padStart(2,"0");
      });
      root.querySelector("[data-step-role]").textContent = current.role;
      root.querySelector("[data-step-title]").textContent = current.title;
      root.querySelector("[data-step-explain]").textContent = current.explain;
      root.querySelector("[data-step-data]").textContent = current.data;
      root.querySelector("[data-step-source]").textContent = "对应位置：" + current.source;
      root.querySelector("[data-step-count]").textContent = String(cursor + 1) + " / " + active.length;
      previous.disabled = cursor === 0;
      next.disabled = cursor === active.length - 1;
      const log = root.querySelector("[data-event-log]");
      log.replaceChildren();
      active.slice(0,cursor + 1).forEach((stage, index) => {
        const li = document.createElement("li");
        li.textContent = String(index + 1).padStart(2,"0") + " · " + stage.title + "：" + stage.data.replaceAll("\n","；");
        log.append(li);
      });
      root.dataset.currentStage = current.id;
      root.querySelectorAll("[data-mode]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
      });
      const caption = root.querySelector("[data-scenario-caption]");
      if (caption) caption.textContent = mode === "text"
        ? "已输入文字，跳过采集、分轮和ASR；仍然合成声音并播放。"
        : "输入：“" + voiceQuestion + "”";
    }

    root.querySelectorAll("[data-mode]").forEach(button => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        cursor = 0;
        render();
      });
    });
    previous.addEventListener("click", () => { cursor = Math.max(0,cursor - 1); render(); });
    next.addEventListener("click", () => { cursor = Math.min(activeStages().length - 1,cursor + 1); render(); });
    root.addEventListener("keydown", event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight" && !next.disabled) { event.preventDefault(); next.click(); }
      if (event.key === "ArrowLeft" && !previous.disabled) { event.preventDefault(); previous.click(); }
    });
    render();
  }

  document.querySelectorAll("[data-simulator]").forEach(initSimulator);

  const sourceRoot = document.querySelector("[data-code-walk]");
  const sourceDataElement = document.getElementById("source-data");
  if (sourceRoot && sourceDataElement) {
    const sources = JSON.parse(sourceDataElement.textContent);
    const renderSource = key => {
      const source = sources[key];
      sourceRoot.querySelector("[data-source-path]").textContent =
        source.file + " · L" + source.start + "–L" + (source.start + source.lines.length - 1);
      const code = sourceRoot.querySelector("[data-source-code]");
      code.replaceChildren();
      source.lines.forEach((text, index) => {
        const line = document.createElement("span");
        line.className = "code-line" + (source.highlight.includes(index) ? " highlight" : "");
        line.textContent = String(source.start + index).padStart(3," ") + "  " + text + "\n";
        code.append(line);
      });
      sourceRoot.querySelector("[data-source-title]").textContent = source.title;
      sourceRoot.querySelector("[data-source-explain]").textContent = source.explain;
      sourceRoot.querySelectorAll("[data-source]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.source === key));
      });
    };
    sourceRoot.querySelectorAll("[data-source]").forEach(button =>
      button.addEventListener("click", () => renderSource(button.dataset.source)));
    renderSource("asr");
  }

  const expected = {
    q1: {value:"asr",reason:"输入已经是文字，ASR可以跳过；朗读仍需要TTS与播放。"},
    q2: {value:"program",reason:"模型提出调用请求，程序与工具服务负责实际执行并返回结果。"},
    q3: {value:"audio",reason:"先沿声音链路收集证据，区分合成、发送、接收和播放。"}
  };
  document.querySelectorAll("[data-quiz]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const feedback = form.querySelector("[data-quiz-feedback]");
      feedback.replaceChildren();
      const missing = Object.keys(expected).filter(key => !data.has(key));
      if (missing.length) {
        feedback.dataset.result = "incomplete";
        feedback.textContent = "还有 " + missing.length + " 题未选择。可以先选你目前的判断，再查看解释。";
        return;
      }
      let correct = 0;
      const list = document.createElement("ol");
      Object.entries(expected).forEach(([key,answer],index) => {
        const passed = data.get(key) === answer.value;
        if (passed) correct += 1;
        const li = document.createElement("li");
        li.textContent = "第 " + (index + 1) + " 题：" + (passed ? "判断正确。" : "再看一下。") + answer.reason;
        list.append(li);
      });
      feedback.dataset.result = correct === 3 ? "correct" : "review";
      const title = document.createElement("p");
      title.textContent = correct + " / 3 题判断正确。这里的反馈只帮助复习，不自动记为课程已掌握。";
      feedback.append(title,list);
    });
  });

  const drafts = Array.from(document.querySelectorAll("[data-draft]"));
  const draftStatus = document.querySelector("[data-draft-status]");
  const storageKey = "deskbot.learning.M00.01.answers.v1";
  if (drafts.length) {
    let storageAvailable = true;
    let saved = {};
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (stored && typeof stored === "object") saved = stored;
    } catch (_) { storageAvailable = false; }
    drafts.forEach(input => {
      if (typeof saved[input.dataset.draft] === "string") input.value = saved[input.dataset.draft];
      input.addEventListener("input", () => {
        if (!storageAvailable) return;
        const answers = {};
        drafts.forEach(field => { answers[field.dataset.draft] = field.value; });
        try { localStorage.setItem(storageKey,JSON.stringify(answers)); }
        catch (_) {
          storageAvailable = false;
          draftStatus.textContent = "当前浏览器不允许保存草稿，请复制回答自行保留。";
        }
      });
    });
    if (!storageAvailable) draftStatus.textContent = "当前浏览器不允许读取草稿，请复制回答自行保留。";
    const copy = document.querySelector("[data-copy-answers]");
    if (copy) copy.addEventListener("click", async () => {
      const text = "我正在学 Deskbot M00.01，请根据我的回答补讲具体缺口：\n\n" +
        drafts.map((input,index) => String(index + 1) + ". " +
          input.parentElement.childNodes[0].textContent.trim() + "\n" + (input.value.trim() || "（尚未填写）")).join("\n\n");
      const notice = document.querySelector("[data-copy-feedback]");
      try {
        await navigator.clipboard.writeText(text);
        notice.textContent = "已复制，可以粘贴给讲课AI。";
      } catch (_) {
        notice.textContent = "复制未获浏览器许可，请直接选择输入框中的文字复制。";
      }
    });
  }

  document.querySelectorAll("[data-print]").forEach(button => {
    button.addEventListener("click", () => window.print());
  });
})();
