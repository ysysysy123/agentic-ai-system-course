/* ==========================================================================
   deskbot-course.js — Deskbot 交互式 HTML 课程零依赖运行时引擎 (window.DeskCourse)
   自动完成：深浅主题切换 · 顶部进度条 · 自动提取目录与滚动高亮 · 离线语法着色/行号/复制 ·
            双栏源码聚光灯 .code-walk · 逐步演示 .dk-stepper · 标签页 .dk-tabs ·
            折叠块 details.reveal · 终端命令复制 · 自测表单 .dk-quiz ·
            按课号隔离的讲回草稿箱 [data-teachback]
   编程 API：DeskCourse.ready(fn) · DeskCourse.flowGraph(el, spec) ·
            DeskCourse.tracePlayer(el, spec) · DeskCourse.playground(el, spec) ·
            DeskCourse.readout(el, kv) · DeskCourse.bars(el, values, opts)
   ========================================================================== */
(function () {
  "use strict";
  if (window.DeskCourse) return;

  const NS = "http://www.w3.org/2000/svg";
  const readyQueue = [];
  const themeRedraws = new Set();
  let isReady = false;
  let errorCount = 0;

  window.addEventListener("error", () => {
    errorCount += 1;
    syncStatusAttr();
  });

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function el(tag, attrs = {}, html) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, String(v));
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function svgEl(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v !== undefined && v !== null) n.setAttribute(k, String(v));
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  function fmt(x, d = 2) {
    if (typeof x !== "number" || !isFinite(x)) return String(x);
    return Number.isInteger(x) ? String(x) : String(+x.toFixed(d));
  }

  function lessonId() {
    const meta = $('meta[name="dk:lesson"]');
    return (meta && meta.content.trim()) || document.body.dataset.lessonId || "portal";
  }

  function homeHref() {
    const meta = $('meta[name="dk:home"]');
    if (meta && meta.content) return meta.content;
    return lessonId() === "portal" ? "index.html" : "../index.html";
  }

  function syncStatusAttr() {
    document.documentElement.setAttribute("data-dk-status", `ready=${isReady ? 1 : 0};errors=${errorCount}`);
  }

  // ---------------------------------------------------------------- 1. 主题切换
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("deskbot-course-theme", theme); } catch (_) {}
    themeRedraws.forEach((fn) => { try { fn(); } catch (_) {} });
    document.dispatchEvent(new CustomEvent("dk:theme", { detail: theme }));
  }

  (function initThemeEarly() {
    let t = null;
    try { t = localStorage.getItem("deskbot-course-theme"); } catch (_) {}
    if (!t) t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
  })();

  // ---------------------------------------------------------------- 2. 顶部进度条与工具栏
  function initChrome() {
    const prog = el("div", { id: "dk-progress" });
    document.body.prepend(prog);

    const bar = el("div", { class: "dk-toolbar" });
    if (lessonId() !== "portal") {
      bar.appendChild(el("a", { href: homeHref(), title: "返回 38 课学习室目录" }, "📚 目录"));
    }
    bar.appendChild(
      el("button", {
        type: "button",
        title: "切换浅色暖纸 / 深色夜间主题",
        onclick: () => applyTheme(currentTheme() === "dark" ? "light" : "dark"),
      }, "🌓 主题")
    );
    if ($$("details.reveal").length) {
      let allOpen = false;
      const toggleBtn = el("button", { type: "button", title: "一键展开或收起本页折叠提示与自测" }, "展开全部");
      toggleBtn.addEventListener("click", () => {
        allOpen = !allOpen;
        $$("details.reveal").forEach((d) => { d.open = allOpen; });
        toggleBtn.textContent = allOpen ? "收起全部" : "展开全部";
      });
      bar.appendChild(toggleBtn);
    }
    bar.appendChild(el("button", { type: "button", title: "回到页面顶部", onclick: () => scrollTo({ top: 0, behavior: "smooth" }) }, "↑"));
    document.body.appendChild(bar);

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------------------------------------------------------------- 3. 自动目录与滚动高亮
  function slugify(s) {
    return s.trim().toLowerCase().replace(/[\s·:：,，。()（）/\\?？!！'"`—-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "sec";
  }

  function initToc() {
    const toc = $("#dk-toc");
    const main = $(".dk-main");
    if (!toc || !main) return;
    const heads = $$("h2, h3", main).filter(
      (h) => !h.closest(".dk-stepper, .callout, details, .trace-player, .dk-playground, .teachback-card, .info-card, .syntax-bridge")
    );
    if (!heads.length) return;

    const used = new Set();
    heads.forEach((h) => {
      if (!h.id) {
        let id = slugify(h.textContent), n = 2;
        while (used.has(id) || document.getElementById(id)) id = slugify(h.textContent) + "-" + n++;
        h.id = id;
      }
      used.add(h.id);
    });

    toc.innerHTML = "";
    const id = lessonId();
    toc.appendChild(
      el(
        "a",
        { class: "toc-brand", href: homeHref() },
        `<span class="toc-brand-badge">DK</span><span>Deskbot 学习室${id !== "portal" ? " · " + esc(id) : ""}</span>`
      )
    );
    toc.appendChild(el("div", { class: "toc-title" }, id === "portal" ? "页面导航" : "本课小节"));

    const links = heads.map((h) => {
      const numEl = $(".num", h);
      const label = numEl
        ? numEl.textContent.trim() + " · " + h.textContent.slice(numEl.textContent.length).trim()
        : h.textContent.trim();
      const a = el("a", { href: "#" + h.id, class: "toc-link " + h.tagName.toLowerCase() }, esc(label));
      toc.appendChild(a);
      return a;
    });

    if ("IntersectionObserver" in window) {
      const map = new Map(heads.map((h, i) => [h, links[i]]));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              links.forEach((a) => a.classList.remove("active"));
              const active = map.get(e.target);
              if (active) active.classList.add("active");
            }
          });
        },
        { rootMargin: "0px 0px -70% 0px" }
      );
      heads.forEach((h) => io.observe(h));
    }
  }

  // ---------------------------------------------------------------- 4. 零依赖离线语法着色 + 行号 + 双栏 code-walk
  const PY_KW = new Set([
    "def", "class", "return", "yield", "if", "elif", "else", "for", "while", "in", "not", "and", "or",
    "try", "except", "finally", "raise", "with", "as", "import", "from", "async", "await", "pass",
    "break", "continue", "True", "False", "None", "lambda", "assert", "is", "nonlocal", "global"
  ]);
  const JS_KW = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "async", "await",
    "try", "catch", "finally", "throw", "new", "class", "true", "false", "null", "undefined", "import", "from"
  ]);
  const SQL_KW = new Set([
    "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
    "IF", "NOT", "EXISTS", "PRIMARY", "KEY", "ORDER", "BY", "LIMIT", "DESC", "ASC", "AND", "OR", "IN",
    "ON", "CONFLICT", "DO", "BEGIN", "COMMIT", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "NULL", "TEXT", "INTEGER"
  ]);

  function highlightLine(rawLine, lang) {
    if (lang === "plain" || lang === "text") return esc(rawLine);
    const tokenRe =
      lang === "sql"
        ? /(--.*$)|('(?:''|[^'])*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)\b/g
        : /(#.*$|\/\/.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_][\w.]*)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(\s*(?=\())?/g;

    let out = "";
    let last = 0;
    let m;
    while ((m = tokenRe.exec(rawLine)) !== null) {
      out += esc(rawLine.slice(last, m.index));
      last = tokenRe.lastIndex;
      if (lang === "sql") {
        const [, cmt, str, num, word] = m;
        if (cmt) out += `<span class="tok-cmt">${esc(cmt)}</span>`;
        else if (str) out += `<span class="tok-str">${esc(str)}</span>`;
        else if (num) out += `<span class="tok-num">${esc(num)}</span>`;
        else if (word && SQL_KW.has(word.toUpperCase())) out += `<span class="tok-kw">${esc(word)}</span>`;
        else out += esc(m[0]);
      } else {
        const [, cmt, str, dec, num, word, fnFollow] = m;
        if (cmt && lang !== "json") out += `<span class="tok-cmt">${esc(cmt)}</span>`;
        else if (str) out += `<span class="tok-str">${esc(str)}</span>`;
        else if (dec && lang === "python") out += `<span class="tok-dec">${esc(dec)}</span>`;
        else if (num) out += `<span class="tok-num">${esc(num)}</span>`;
        else if (word) {
          const kwSet = lang === "javascript" || lang === "js" ? JS_KW : lang === "json" ? new Set(["true", "false", "null"]) : PY_KW;
          if (kwSet.has(word)) out += `<span class="tok-kw">${esc(word)}</span>`;
          else if (fnFollow !== undefined) out += `<span class="tok-fn">${esc(word)}</span>${esc(fnFollow)}`;
          else out += esc(m[0]);
        } else {
          out += esc(m[0]);
        }
      }
    }
    out += esc(rawLine.slice(last));
    return out;
  }

  function parseLineRanges(spec) {
    const set = new Set();
    String(spec || "").split(",").forEach((part) => {
      const [a, b] = part.trim().split("-").map((x) => parseInt(x, 10));
      if (isNaN(a)) return;
      for (let i = a; i <= (isNaN(b) ? a : b); i++) set.add(i);
    });
    return set;
  }

  function initCodeBlocks() {
    $$("pre > code").forEach((code) => {
      const pre = code.parentElement;
      if (code.dataset.dkProcessed) return;
      code.dataset.dkProcessed = "1";

      const langMatch = code.className.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1].toLowerCase() : "python";
      const raw = code.textContent.replace(/\n$/, "");
      code.dataset.raw = raw;
      const rawLines = raw.split("\n");

      const numbered = pre.hasAttribute("data-start") || pre.classList.contains("numbered") || Boolean(pre.closest(".code-walk"));
      if (numbered) {
        const start = parseInt(pre.getAttribute("data-start") || "1", 10);
        const hl = parseLineRanges(pre.getAttribute("data-hl"));
        code.innerHTML = rawLines
          .map((ln, idx) => {
            const lineNo = start + idx;
            return `<span class="line${hl.has(lineNo) ? " hl" : ""}" data-n="${lineNo}">${highlightLine(ln, lang) || " "}</span>`;
          })
          .join("");
        code.classList.add("numbered");
      } else {
        code.innerHTML = rawLines.map((ln) => highlightLine(ln, lang)).join("\n");
      }

      const file = pre.getAttribute("data-file");
      const startAttr = pre.getAttribute("data-start");
      const label = file
        ? startAttr
          ? `${file} · L${startAttr}–L${parseInt(startAttr, 10) + rawLines.length - 1}`
          : file
        : lang.toUpperCase();

      const head = el("div", { class: "code-head" });
      head.appendChild(el("span", {}, esc(label)));
      const copyBtn = el("button", { class: "copy-btn", type: "button" }, "复制代码");
      copyBtn.addEventListener("click", () => {
        navigator.clipboard?.writeText(raw).then(
          () => { copyBtn.textContent = "已复制 ✓"; setTimeout(() => { copyBtn.textContent = "复制代码"; }, 1300); },
          () => { copyBtn.textContent = "请手动选择复制"; }
        );
      });
      head.appendChild(copyBtn);
      pre.prepend(head);
    });
  }

  function initCodeWalks() {
    $$(".code-walk").forEach((walk) => {
      const pre = $("pre", walk);
      const items = $$("ol.walk > li", walk);
      if (!pre || !items.length) return;
      const dim = walk.hasAttribute("data-dim");

      items.forEach((li) => {
        if (li.dataset.lines && !$(".lines-badge", li)) {
          li.appendChild(el("span", { class: "lines-badge" }, "L" + li.dataset.lines));
        }
        li.addEventListener("click", () => activate(li));
      });

      function activate(targetLi) {
        items.forEach((item) => item.classList.toggle("active", item === targetLi));
        const activeLines = parseLineRanges(targetLi.dataset.lines);
        let firstLineEl = null;
        $$(".line", pre).forEach((ln) => {
          const n = parseInt(ln.dataset.n, 10);
          const on = activeLines.has(n);
          ln.classList.toggle("hl", on);
          ln.classList.toggle("dim", dim && activeLines.size > 0 && !on);
          if (on && !firstLineEl) firstLineEl = ln;
        });
        if (firstLineEl) {
          pre.scrollTo({ top: Math.max(0, firstLineEl.offsetTop - 68), behavior: "smooth" });
        }
      }
      activate(items[0]);
    });
  }

  // ---------------------------------------------------------------- 5. Stepper / Tabs / Reveal / Terminal / Quiz
  const steppers = new Map();
  function makeStepper(root) {
    if (!root) return null;
    if (steppers.has(root)) return steppers.get(root);
    const steps = $$(":scope > .step", root);
    if (!steps.length) return null;
    const accumulate = root.dataset.mode === "accumulate";

    const head = el("div", { class: "stepper-head" });
    head.appendChild(el("div", { class: "stepper-title" }, esc(root.dataset.title || "分步推演")));
    const dots = el("div", { class: "dots" });
    head.appendChild(dots);

    const foot = el("div", { class: "stepper-foot" });
    const prev = el("button", { class: "dk-btn", type: "button" }, "← 上一步");
    const next = el("button", { class: "dk-btn primary", type: "button" }, "下一步 →");
    foot.append(prev, el("span", { class: "hint" }, "支持键盘 ← → 切换"), next);

    root.prepend(head);
    root.appendChild(foot);
    root.tabIndex = 0;

    steps.forEach((s, i) => {
      if (s.dataset.title && !$(".step-label", s)) {
        s.prepend(el("div", { class: "step-label" }, `STEP ${String(i + 1).padStart(2, "0")} · ${esc(s.dataset.title)}`));
      }
      dots.appendChild(el("button", { class: "dot", type: "button", title: s.dataset.title || "", onclick: () => go(i) }, String(i + 1)));
    });

    const listeners = [];
    const ctl = {
      index: 0,
      total: steps.length,
      go,
      next: () => go(ctl.index + 1),
      prev: () => go(ctl.index - 1),
      on: (fn) => { listeners.push(fn); fn(ctl.index, steps[ctl.index]); return ctl; },
    };

    function go(i) {
      i = Math.max(0, Math.min(steps.length - 1, i));
      ctl.index = i;
      steps.forEach((s, j) => s.classList.toggle("active", accumulate ? j <= i : j === i));
      $$(".dot", dots).forEach((d, j) => {
        d.classList.toggle("current", j === i);
        d.classList.toggle("done", j < i);
      });
      prev.disabled = i === 0;
      next.disabled = i === steps.length - 1;
      listeners.forEach((fn) => fn(i, steps[i]));
    }

    prev.addEventListener("click", ctl.prev);
    next.addEventListener("click", ctl.next);
    root.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") { ctl.next(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { ctl.prev(); e.preventDefault(); }
    });
    steppers.set(root, ctl);
    go(0);
    return ctl;
  }

  function initTabs() {
    $$(".dk-tabs").forEach((box) => {
      const tabs = $$(":scope > .tab", box);
      if (!tabs.length) return;
      const bar = el("div", { class: "tab-bar" });
      const group = box.dataset.group;
      const btns = tabs.map((t, i) => {
        const b = el("button", { type: "button" }, esc(t.dataset.label || "视图 " + (i + 1)));
        b.addEventListener("click", () => {
          if (group) $$(`.dk-tabs[data-group="${group}"]`).forEach((other) => other._dkSelect && other._dkSelect(t.dataset.label));
          else select(t.dataset.label);
        });
        bar.appendChild(b);
        return b;
      });
      box.prepend(bar);
      function select(label) {
        let idx = tabs.findIndex((t) => t.dataset.label === label);
        if (idx < 0) idx = 0;
        tabs.forEach((t, i) => t.classList.toggle("active", i === idx));
        btns.forEach((b, i) => b.classList.toggle("active", i === idx));
      }
      box._dkSelect = select;
      select(tabs[0].dataset.label);
    });
  }

  function initRevealsAndTerminals() {
    $$("details.reveal").forEach((d) => {
      const kids = Array.from(d.children).filter((c) => c.tagName !== "SUMMARY");
      if (kids.length !== 1 || !kids[0].classList.contains("reveal-body")) {
        const wrap = el("div", { class: "reveal-body" });
        kids.forEach((k) => wrap.appendChild(k));
        d.appendChild(wrap);
      }
    });

    $$(".terminal-lab .copy-cmd").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cmdEl = btn.parentElement.querySelector(".cmd-text");
        const cmd = cmdEl ? cmdEl.textContent.trim() : "";
        navigator.clipboard?.writeText(cmd).then(() => {
          const orig = btn.textContent;
          btn.textContent = "已复制 ✓";
          setTimeout(() => { btn.textContent = orig; }, 1200);
        });
      });
    });
  }

  function initQuizzes() {
    $$("form.dk-quiz").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fieldsets = $$("fieldset[data-answer]", form);
        let feedback = $(".dk-quiz-feedback", form);
        if (!feedback) {
          feedback = el("div", { class: "dk-quiz-feedback" });
          form.appendChild(feedback);
        }
        const data = new FormData(form);
        const unanswered = fieldsets.filter((fs) => !data.has(fs.dataset.name));
        if (unanswered.length) {
          feedback.className = "dk-quiz-feedback review";
          feedback.textContent = `还有 ${unanswered.length} 题未选择，先选出你当前的直觉判断再核对解释。`;
          return;
        }
        let passCount = 0;
        const itemsHtml = fieldsets
          .map((fs, i) => {
            const chosen = data.get(fs.dataset.name);
            const ok = chosen === fs.dataset.answer;
            if (ok) passCount += 1;
            return `<li><strong>第 ${i + 1} 题（${ok ? "✓ 正确" : "△ 再想想"}）：</strong>${esc(fs.dataset.explain || "")}</li>`;
          })
          .join("");
        feedback.className = "dk-quiz-feedback " + (passCount === fieldsets.length ? "pass" : "review");
        feedback.innerHTML = `<p style="margin:0 0 6px;font-weight:700">${passCount} / ${fieldsets.length} 题判断正确（自测仅辅助理解，不自动更改 progress.md）。</p><ol style="margin:0;padding-left:1.3em">${itemsHtml}</ol>`;
      });
    });
  }

  // ---------------------------------------------------------------- 6. 讲回草稿箱（自动按课号隔离存储 + 一键复制给 AI）
  function initTeachback() {
    $$("[data-teachback]").forEach((card) => {
      const id = lessonId();
      const storageKey = `deskbot.learn.${id}.teachback.v2`;
      const fields = $$("textarea[data-field]", card);
      const statusEl = $(".tb-status", card);
      if (!fields.length) return;

      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}") || {}; } catch (_) {}
      fields.forEach((ta) => {
        if (typeof saved[ta.dataset.field] === "string") ta.value = saved[ta.dataset.field];
        ta.addEventListener("input", () => {
          const next = {};
          fields.forEach((f) => { next[f.dataset.field] = f.value; });
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
            if (statusEl) statusEl.textContent = "草稿已自动保存在当前浏览器（本地缓存，未写入仓库）。";
          } catch (_) {
            if (statusEl) statusEl.textContent = "浏览器禁用了本地存储，写完请直接点击复制。";
          }
        });
      });

      const copyBtn = $("[data-copy-teachback]", card);
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const body = fields
            .map((ta, idx) => {
              const labelNode = ta.closest(".tb-field");
              const qText = labelNode ? labelNode.childNodes[0].textContent.trim() : `问题 ${idx + 1}`;
              return `${idx + 1}. ${qText}\n答：${ta.value.trim() || "（暂不确定，请帮我补讲）"}`;
            })
            .join("\n\n");
          const prompt = `我刚学完 Deskbot 课程 ${id}，以下是我的独立讲回与实验观察，请按苏格拉底陪读模式检查我的理解缺口；若达标请更新 progress.md：\n\n${body}`;
          navigator.clipboard?.writeText(prompt).then(
            () => { if (statusEl) statusEl.textContent = "✓ 已复制完整验收消息！直接粘贴发给 AI 老师即可。"; },
            () => { if (statusEl) statusEl.textContent = "复制受限，请手动选中文本框内容复制。"; }
          );
        });
      }
    });
  }

  // ---------------------------------------------------------------- 7. SVG 架构/状态流转图 DeskCourse.flowGraph
  function flowGraph(target, spec) {
    const host = typeof target === "string" ? $(target) : target;
    if (!host) return null;
    const W = spec.width || 720;
    const H = spec.height || 200;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "dk-svg", role: "img" });
    host.innerHTML = "";
    host.appendChild(svg);

    const defs = svgEl("defs", {}, svg);
    const markerId = "dk-arr-" + Math.random().toString(36).slice(2, 8);
    const marker = svgEl("marker", { id: markerId, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0,1 L10,5 L0,9 z", fill: "context-stroke" }, marker);

    const nodeMap = new Map();
    (spec.nodes || []).forEach((n) => nodeMap.set(n.id, Object.assign({ w: 118, h: 52 }, n)));

    const edgeEls = new Map();
    const edgeGroup = svgEl("g", {}, svg);
    (spec.edges || []).forEach((e) => {
      const a = nodeMap.get(e.from);
      const b = nodeMap.get(e.to);
      if (!a || !b) return;
      const key = e.id || `${e.from}->${e.to}`;
      const dx = b.x - a.x, dy = b.y - a.y;
      let d;
      let lx = (a.x + b.x) / 2, ly = (a.y + b.y) / 2 - 7;
      if (e.curve) {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + e.curve;
        d = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
        ly = my + (e.curve > 0 ? 12 : -6);
      } else {
        const dist = Math.hypot(dx, dy) || 1;
        const sx = a.x + (dx / dist) * (a.w * 0.44);
        const sy = a.y + (dy / dist) * (a.h * 0.44);
        const tx = b.x - (dx / dist) * (b.w * 0.46);
        const ty = b.y - (dy / dist) * (b.h * 0.46);
        d = `M${sx.toFixed(1)},${sy.toFixed(1)} L${tx.toFixed(1)},${ty.toFixed(1)}`;
      }
      const path = svgEl("path", { d, class: "flow-edge", "marker-end": `url(#${markerId})` }, edgeGroup);
      const label = svgEl("text", { x: lx, y: ly, "text-anchor": "middle", class: "flow-edge-label" }, edgeGroup);
      label.textContent = e.label || "";
      edgeEls.set(key, { path, label, defLabel: e.label || "" });
    });

    const nodeEls = new Map();
    const nodeGroup = svgEl("g", {}, svg);
    nodeMap.forEach((n) => {
      const g = svgEl("g", { class: "flow-node", transform: `translate(${n.x - n.w / 2}, ${n.y - n.h / 2})` }, nodeGroup);
      svgEl("rect", { width: n.w, height: n.h }, g);
      const title = svgEl("text", { x: n.w / 2, y: n.sub ? 22 : n.h / 2 + 4, "text-anchor": "middle", class: "nd-title" }, g);
      title.textContent = n.label;
      const sub = svgEl("text", { x: n.w / 2, y: 39, "text-anchor": "middle", class: "nd-sub" }, g);
      sub.textContent = n.sub || "";
      if (typeof spec.onNodeClick === "function") {
        g.addEventListener("click", () => spec.onNodeClick(n.id));
      }
      nodeEls.set(n.id, { g, title, sub, defSub: n.sub || "" });
    });

    function reset() {
      nodeEls.forEach((v) => {
        v.g.setAttribute("class", "flow-node");
        v.sub.textContent = v.defSub;
      });
      edgeEls.forEach((e) => {
        e.path.setAttribute("class", "flow-edge");
        e.label.textContent = e.defLabel;
      });
    }

    function apply(state = {}) {
      reset();
      (state.done || []).forEach((id) => nodeEls.get(id)?.g.classList.add("done"));
      (state.active || []).forEach((id) => nodeEls.get(id)?.g.classList.add("active"));
      (state.error || []).forEach((id) => nodeEls.get(id)?.g.classList.add("error"));
      (state.skipped || []).forEach((id) => nodeEls.get(id)?.g.classList.add("skipped"));
      if (state.sub) {
        for (const [id, text] of Object.entries(state.sub)) {
          if (nodeEls.get(id)) nodeEls.get(id).sub.textContent = text;
        }
      }
      (state.edgeActive || []).forEach((k) => edgeEls.get(k)?.path.classList.add("active"));
      (state.edgeError || []).forEach((k) => edgeEls.get(k)?.path.classList.add("error"));
      (state.edgeSkipped || []).forEach((k) => edgeEls.get(k)?.path.classList.add("skipped"));
      if (state.edgeLabels) {
        for (const [k, text] of Object.entries(state.edgeLabels)) {
          if (edgeEls.get(k)) edgeEls.get(k).label.textContent = text;
        }
      }
    }

    return { svg, reset, apply };
  }

  // ---------------------------------------------------------------- 8. Agent 消息流/工具循环沙盒 DeskCourse.tracePlayer
  function tracePlayer(target, spec) {
    const root = typeof target === "string" ? $(target) : target;
    if (!root || !spec.scenarios || !spec.scenarios.length) return null;
    root.classList.add("trace-player");
    root.innerHTML = "";

    let scIndex = 0;
    let stepIndex = 0;

    const top = el("div", { class: "tp-top" });
    const scBar = el("div", { class: "tp-scenarios", role: "group", "aria-label": "切换场景" });
    const scBtns = spec.scenarios.map((sc, idx) => {
      const b = el("button", { type: "button" }, esc(sc.label));
      b.addEventListener("click", () => {
        scIndex = idx;
        stepIndex = 0;
        render();
      });
      scBar.appendChild(b);
      return b;
    });
    top.append(scBar, el("span", { class: "small muted" }, "离线教学模拟 · 不连外部服务"));
    root.appendChild(top);

    const summaryP = el("p", { class: "tp-summary" });
    const graphHost = spec.graph ? el("div", { style: "margin-bottom:12px" }) : null;
    const stagesGrid = el("div", { class: "tp-stages" });
    const detail = el("div", { class: "tp-detail", "aria-live": "polite" });
    const foot = el("div", { class: "tp-foot" });
    const prevBtn = el("button", { class: "dk-btn", type: "button" }, "← 上一步");
    const counter = el("span", { class: "small muted" });
    const nextBtn = el("button", { class: "dk-btn primary", type: "button" }, "下一步 →");
    foot.append(prevBtn, counter, nextBtn);

    const logDetails = el("details", { style: "margin-top:12px" });
    logDetails.appendChild(el("summary", { class: "small", style: "cursor:pointer;font-weight:650;color:var(--accent)" }, "展开查看截至当前步的累积消息轨迹"));
    const logList = el("ol", { class: "tp-log" });
    logDetails.appendChild(logList);

    if (graphHost) root.appendChild(graphHost);
    root.append(summaryP, stagesGrid, detail, foot, logDetails);

    const fg = graphHost
      ? flowGraph(
          graphHost,
          Object.assign({}, spec.graph, {
            onNodeClick: (nodeId) => {
              const sc = spec.scenarios[scIndex];
              const found = sc.steps.findIndex((s) => s.node === nodeId);
              if (found >= 0) { stepIndex = found; render(); }
            },
          })
        )
      : null;

    function render() {
      const sc = spec.scenarios[scIndex];
      const steps = sc.steps;
      stepIndex = Math.max(0, Math.min(steps.length - 1, stepIndex));
      const cur = steps[stepIndex];

      scBtns.forEach((b, i) => b.classList.toggle("active", i === scIndex));
      summaryP.textContent = sc.summary || "";

      stagesGrid.innerHTML = "";
      if (spec.allStages) {
        const skippedSet = new Set(sc.skippedStages || []);
        spec.allStages.forEach((st) => {
          const activePos = steps.findIndex((s) => s.id === st.id);
          const isSkipped = skippedSet.has(st.id) || activePos === -1;
          const btn = el("button", {
            type: "button",
            class: "tp-stage-btn" + (isSkipped ? " skipped" : activePos === stepIndex ? (cur.error ? " error active" : " active") : activePos < stepIndex ? " done" : ""),
            disabled: isSkipped ? "disabled" : null,
          });
          btn.append(
            el("span", { class: "st-num" }, isSkipped ? "跳过" : `STEP ${String(activePos + 1).padStart(2, "0")}`),
            el("span", { class: "st-title" }, esc(st.title)),
            el("span", { class: "role-badge", "data-role": st.role || "server" }, esc(st.badge || st.role || "server"))
          );
          if (!isSkipped) btn.addEventListener("click", () => { stepIndex = activePos; render(); });
          stagesGrid.appendChild(btn);
        });
      } else {
        steps.forEach((st, idx) => {
          const btn = el("button", {
            type: "button",
            class: "tp-stage-btn" + (idx === stepIndex ? (st.error ? " error active" : " active") : idx < stepIndex ? " done" : ""),
          });
          btn.append(
            el("span", { class: "st-num" }, `STEP ${String(idx + 1).padStart(2, "0")}`),
            el("span", { class: "st-title" }, esc(st.title)),
            el("span", { class: "role-badge", "data-role": st.role || "server" }, esc(st.badge || st.role || "server"))
          );
          btn.addEventListener("click", () => { stepIndex = idx; render(); });
          stagesGrid.appendChild(btn);
        });
      }

      detail.innerHTML =
        `<div class="tp-detail-head"><span class="role-badge" data-role="${esc(cur.role || "server")}">${esc(cur.badge || cur.role || "STEP")}</span>` +
        (cur.state ? `<span class="chip">状态：${esc(cur.state)}</span>` : "") +
        `</div><h4>${esc(cur.title)}</h4><p>${esc(cur.explain)}</p>` +
        (cur.data ? `<pre><code class="language-${esc(cur.lang || "json")}">${highlightLine(cur.data, cur.lang || "plain")}</code></pre>` : "") +
        (cur.source ? `<p class="tp-source">📍 对应源码：${esc(cur.source)}</p>` : "");

      counter.textContent = `步骤 ${stepIndex + 1} / ${steps.length}（可用 ← → 键）`;
      prevBtn.disabled = stepIndex === 0;
      nextBtn.disabled = stepIndex === steps.length - 1;

      logList.innerHTML = steps
        .slice(0, stepIndex + 1)
        .map((s, idx) => `<li>[${String(idx + 1).padStart(2, "0")}] <strong>${esc(s.title)}</strong> — ${esc((s.data || s.explain).replace(/\n+/g, " ▏ "))}</li>`)
        .join("");

      if (fg) {
        const doneNodes = steps.slice(0, stepIndex).map((s) => s.node).filter(Boolean);
        fg.apply({
          done: doneNodes,
          active: cur.error ? [] : cur.node ? [cur.node] : [],
          error: cur.error && cur.node ? [cur.node] : [],
          skipped: sc.skippedStages || [],
          edgeActive: cur.edge ? [cur.edge] : [],
          edgeError: cur.error && cur.edge ? [cur.edge] : [],
        });
      }
    }

    prevBtn.addEventListener("click", () => { stepIndex -= 1; render(); });
    nextBtn.addEventListener("click", () => { stepIndex += 1; render(); });
    root.tabIndex = 0;
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" && !nextBtn.disabled) { stepIndex += 1; render(); e.preventDefault(); }
      if (e.key === "ArrowLeft" && !prevBtn.disabled) { stepIndex -= 1; render(); e.preventDefault(); }
    });

    render();
    return { setScenario: (i) => { scIndex = i; stepIndex = 0; render(); } };
  }

  // ---------------------------------------------------------------- 9. Playground 与 SVG 柱状对比图
  function readout(container, kv, digits = 2) {
    let box = $(":scope > .pg-readout", container);
    if (!box) {
      box = el("div", { class: "pg-readout" });
      container.appendChild(box);
    }
    box.innerHTML = Object.entries(kv)
      .map(([k, v]) => `<div class="kv"><div class="k">${esc(k)}</div><div class="v">${typeof v === "number" ? fmt(v, digits) : esc(v)}</div></div>`)
      .join("");
    return box;
  }

  function bars(target, values, opts = {}) {
    const host = typeof target === "string" ? $(target) : target;
    if (!host) return null;
    const W = opts.width || 620;
    const H = opts.height || 200;
    const pad = { top: 22, right: 24, bottom: 34, left: 48 };

    function draw(vals, o = opts) {
      host.innerHTML = "";
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "dk-svg" }, host);
      const maxV = o.max || Math.max(1, ...vals) * 1.15;
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;
      const slot = plotW / Math.max(1, vals.length);
      const bw = Math.min(58, slot * 0.6);

      svgEl("line", { x1: pad.left, x2: W - pad.right, y1: H - pad.bottom, y2: H - pad.bottom, stroke: "var(--plot-axis)" }, svg);
      vals.forEach((v, i) => {
        const bh = Math.max(2, (v / maxV) * plotH);
        const x = pad.left + i * slot + (slot - bw) / 2;
        const y = H - pad.bottom - bh;
        const isHl = Array.isArray(o.highlight) ? o.highlight.includes(i) : o.highlight === i;
        svgEl("rect", { x, y, width: bw, height: bh, rx: 5, fill: isHl ? "var(--c-lab)" : "var(--accent)" }, svg);
        const vt = svgEl("text", { x: x + bw / 2, y: y - 6, "text-anchor": "middle", style: "font:700 11.5px var(--font-mono);fill:var(--text)" }, svg);
        vt.textContent = fmt(v, o.decimals ?? 1) + (o.unit || "");
        if (o.labels && o.labels[i]) {
          const lt = svgEl("text", { x: x + bw / 2, y: H - 12, "text-anchor": "middle", style: "font:600 12px var(--font-sans);fill:var(--text-2)" }, svg);
          lt.textContent = o.labels[i];
        }
      });
    }
    draw(values, opts);
    return { update: draw };
  }

  function playground(target, spec) {
    const root = typeof target === "string" ? $(target) : target;
    if (!root) return null;
    root.classList.add("dk-playground");
    root.innerHTML = "";
    if (spec.title) root.appendChild(el("div", { class: "pg-title" }, esc(spec.title)));

    const controls = el("div", { class: "pg-controls" });
    const params = {};
    const refs = {};

    (spec.params || []).forEach((q) => {
      params[q.name] = q.value;
      const wrap = el("div", { class: "pg-control" });
      const out = el("output", {}, (q.fmt || fmt)(q.value));
      const input = el("input", { type: "range", min: q.min, max: q.max, step: q.step || 1, value: q.value });
      input.addEventListener("input", () => {
        params[q.name] = parseFloat(input.value);
        out.textContent = (q.fmt || fmt)(params[q.name]);
        update();
      });
      refs[q.name] = { input, out, q };
      wrap.append(el("label", {}, esc(q.label || q.name)), out, input);
      controls.appendChild(wrap);
    });

    (spec.selects || []).forEach((q) => {
      params[q.name] = q.value !== undefined ? q.value : q.options[0][0];
      const wrap = el("div", { class: "pg-control" });
      const sel = el("select");
      q.options.forEach(([val, text]) => {
        const opt = el("option", { value: val }, esc(text));
        if (String(val) === String(params[q.name])) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", () => {
        params[q.name] = isNaN(+sel.value) ? sel.value : +sel.value;
        update();
      });
      refs[q.name] = { sel, q };
      wrap.append(el("label", {}, esc(q.label || q.name)), el("span"), sel);
      controls.appendChild(wrap);
    });

    if (controls.children.length) root.appendChild(controls);

    const ctl = { params, set };
    if (spec.buttons && spec.buttons.length) {
      const btnRow = el("div", { class: "pg-buttons" });
      spec.buttons.forEach((b) => {
        btnRow.appendChild(
          el("button", { class: "dk-btn" + (b.primary ? " primary" : ""), type: "button", onclick: () => b.onClick(params, ctl) }, esc(b.label))
        );
      });
      root.appendChild(btnRow);
    }

    const outBox = el("div", { class: "pg-out" });
    root.appendChild(outBox);
    if (spec.caption) root.appendChild(el("div", { class: "caption" }, esc(spec.caption)));

    function set(name, val) {
      params[name] = val;
      const r = refs[name];
      if (r && r.input) { r.input.value = val; r.out.textContent = (r.q.fmt || fmt)(val); }
      if (r && r.sel) r.sel.value = String(val);
      update();
    }

    function update() {
      if (typeof spec.render === "function") spec.render(params, outBox, ctl);
    }
    themeRedraws.add(update);
    update();
    return ctl;
  }

  // ---------------------------------------------------------------- Boot
  function boot() {
    initChrome();
    initRevealsAndTerminals();
    initCodeBlocks();
    initCodeWalks();
    initTabs();
    $$(".dk-stepper").forEach(makeStepper);
    initQuizzes();
    initTeachback();
    initToc();
    isReady = true;
    syncStatusAttr();
    while (readyQueue.length) {
      const fn = readyQueue.shift();
      try { fn(); } catch (err) { console.error(err); errorCount += 1; syncStatusAttr(); }
    }
  }

  window.DeskCourse = {
    version: "2.0",
    ready: (fn) => (isReady ? fn() : readyQueue.push(fn)),
    $, $$, el, esc, fmt,
    theme: currentTheme,
    stepper: (sel) => makeStepper(typeof sel === "string" ? $(sel) : sel),
    onStep: (sel, fn) => DeskCourse.ready(() => DeskCourse.stepper(sel)?.on(fn)),
    flowGraph,
    tracePlayer,
    playground,
    readout,
    bars,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
