#!/usr/bin/env python3
"""Deskbot 学习室辅助 CLI：脚手架建课、真实源码精确切片提取、HTML 质量与语法自动化校验。

零第三方依赖，供编写与校验 HTML 课程的任何 AI 直接调用：
  1. 查看当前阶段进度：
     python3 workspace/deskbot-learning/scripts/course_tool.py status
  2. 从模板新建一课 HTML 与练习目录（自动从 syllabus.md 读取标题与前后课导航）：
     python3 workspace/deskbot-learning/scripts/course_tool.py new M00.02
  3. 从真实 Deskbot/server/voice 提取带精确行号与转义的 <pre> 代码块（防幻觉、防数错行号、自动拦截 .env）：
     python3 workspace/deskbot-learning/scripts/course_tool.py snippet src/voice_server/camera_dialogue.py 315 351
  4. 校验单课或全部已生成 HTML（检查未填占位符、断链、code-walk 行号越界、内联 JS 语法、敏感密钥泄露）：
     python3 workspace/deskbot-learning/scripts/course_tool.py check workspace/deskbot-learning/lessons/M00.01.html
     python3 workspace/deskbot-learning/scripts/course_tool.py check --all
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

LEARNING_ROOT = Path(__file__).resolve().parent.parent
VOICE_ROOT = Path("/home/yyy/desktop/ai/Deskbot/server/voice")
DESKBOT_ROOT = Path("/home/yyy/desktop/ai/Deskbot")
TEMPLATE_FILE = LEARNING_ROOT / "templates" / "lesson.html"
SYLLABUS_FILE = LEARNING_ROOT / "syllabus.md"
LESSONS_DIR = LEARNING_ROOT / "lessons"
EXERCISES_DIR = LEARNING_ROOT / "exercises"

MODULE_TITLES = {
    "M00": "M00 · 零基础破冰与最小够用 Python",
    "M01": "M01 · 纯文本直入 Agent 大脑：契约与自愈",
    "M02": "M02 · 上下文工程、SQLite 与长期记忆",
    "M03": "M03 · 异步并发、WebSocket 与语音会话",
    "M04": "M04 · 浏览器测试台、MCP 与外围贯通",
    "M05": "M05 · 可观测性、自动化 Eval 与求职答辩",
}

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"Bearer\s+[A-Za-z0-9._-]{24,}"),
]

LANG_BY_SUFFIX = {
    ".py": "python",
    ".js": "javascript",
    ".cjs": "javascript",
    ".json": "json",
    ".sql": "sql",
    ".sh": "bash",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".html": "html",
    ".css": "css",
}


def parse_syllabus_lessons() -> list[dict[str, str]]:
    """从 syllabus.md 提取有序的 38 课元数据。"""
    text = SYLLABUS_FILE.read_text(encoding="utf-8")
    pattern = re.compile(r"^####\s+`(M\d{2}\.\d{2})`\s+([^\n*]+)", re.MULTILINE)
    lessons: list[dict[str, str]] = []
    matches = list(pattern.finditer(text))
    for idx, match in enumerate(matches):
        lid = match.group(1).strip()
        title = match.group(2).strip()
        end_pos = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[match.end() : end_pos]
        tier_match = re.search(r"-\s+\*\*学习层级\*\*：([^\n]+)", block)
        tier = tier_match.group(1).strip() if tier_match else "核心课程"
        lessons.append({"id": lid, "module": lid.split(".")[0], "title": title, "tier": tier})
    return lessons


def tier_visuals(tier_text: str) -> tuple[str, str]:
    if "重构" in tier_text or "PR" in tier_text:
        return "pr", f"🔥 {tier_text}"
    if "白盒" in tier_text:
        return "whitebox", f"🔍 {tier_text}"
    if "灰盒" in tier_text:
        return "greybox", f"🧭 {tier_text}"
    return "whitebox", f"🌱 {tier_text}"


def cmd_status(_args: argparse.Namespace) -> int:
    lessons = parse_syllabus_lessons()
    existing = sorted(p.stem for p in LESSONS_DIR.glob("M*.html"))
    print(f"📚 Deskbot 课程总计：{len(lessons)} 课 | 已生成 HTML：{len(existing)} 课 ({', '.join(existing) or '无'})")
    for item in lessons:
        lid = item["id"]
        html_path = LESSONS_DIR / f"{lid}.html"
        if not html_path.exists():
            print(f"👉 下一待生成课程：{lid} · {item['title']}（{item['tier']}）")
            break
    return 0


def cmd_new(args: argparse.Namespace) -> int:
    lessons = parse_syllabus_lessons()
    idx = next((i for i, x in enumerate(lessons) if x["id"] == args.lesson_id), -1)
    if idx < 0:
        print(f"错误：在 syllabus.md 中未找到课号 {args.lesson_id}", file=sys.stderr)
        return 1

    target_html = LESSONS_DIR / f"{args.lesson_id}.html"
    if target_html.exists() and not args.force:
        print(f"错误：{target_html} 已存在（如需覆盖请加 --force）", file=sys.stderr)
        return 1

    cur = lessons[idx]
    prev_item = lessons[idx - 1] if idx > 0 else None
    next_item = lessons[idx + 1] if idx + 1 < len(lessons) else None

    if prev_item:
        prev_href = f"{prev_item['id']}.html" if (LESSONS_DIR / f"{prev_item['id']}.html").exists() else "../index.html"
        prev_nav = f'<a href="{prev_href}"><small>← 上一课 · {prev_item["id"]}</small>{html.escape(prev_item["title"])}</a>'
    else:
        prev_nav = '<a href="../index.html"><small>← 返回入口</small>38 课学习室首页</a>'

    if next_item:
        if (LESSONS_DIR / f"{next_item['id']}.html").exists():
            next_nav = f'<a class="next" href="{next_item["id"]}.html"><small>下一课 · {next_item["id"]} →</small>{html.escape(next_item["title"])}</a>'
        else:
            next_nav = f'<div class="nav-placeholder next"><small>下一课（待生成）· {next_item["id"]}</small>{html.escape(next_item["title"])}</div>'
    else:
        next_nav = '<a class="next" href="../index.html"><small>🎉 全课程收官 →</small>返回学习室总览</a>'

    tier_cls, tier_badge = tier_visuals(cur["tier"])
    today = dt.date.today().isoformat()
    tpl = TEMPLATE_FILE.read_text(encoding="utf-8")
    rendered = (
        tpl.replace("{{LESSON_ID}}", cur["id"])
        .replace("{{MODULE_ID}}", cur["module"])
        .replace("{{MODULE_TITLE}}", MODULE_TITLES.get(cur["module"], cur["module"]))
        .replace("{{TITLE}}", html.escape(cur["title"]))
        .replace("{{TIER_LABEL}}", html.escape(cur["tier"]))
        .replace("{{TIER_CLASS}}", tier_cls)
        .replace("{{TIER_BADGE}}", html.escape(tier_badge))
        .replace("{{DATE}}", today)
        .replace("{{PREV_NAV}}", prev_nav)
        .replace("{{NEXT_NAV}}", next_nav)
    )

    LESSONS_DIR.mkdir(parents=True, exist_ok=True)
    target_html.write_text(rendered, encoding="utf-8")

    ex_dir = EXERCISES_DIR / cur["id"]
    ex_dir.mkdir(parents=True, exist_ok=True)
    (ex_dir / "outputs").mkdir(exist_ok=True)
    print(f"✓ 已生成课程骨架：{target_html}")
    print(f"✓ 已准备练习目录：{ex_dir}")
    return 0


def cmd_snippet(args: argparse.Namespace) -> int:
    rel = args.path.strip()
    if Path(rel).name == ".env" or ".env." not in Path(rel).name and Path(rel).name.startswith(".env"):
        if Path(rel).name != ".env.example":
            print("安全拦截：严禁读取真实私有 .env 文件！请改用 .env.example。", file=sys.stderr)
            return 2

    candidate = VOICE_ROOT / rel
    display_path = rel
    if not candidate.exists():
        alt = DESKBOT_ROOT / rel
        if alt.exists():
            candidate = alt
            display_path = f"Deskbot/{rel}"
        else:
            print(f"错误：找不到源码文件 {candidate}", file=sys.stderr)
            return 1

    lines = candidate.read_text(encoding="utf-8").splitlines()
    start = max(1, args.start)
    end = min(len(lines), args.end)
    if start > end:
        print(f"错误：起始行 {start} 大于文件总行数 {len(lines)} 或结束行 {end}", file=sys.stderr)
        return 1

    lang = LANG_BY_SUFFIX.get(candidate.suffix.lower(), "python")
    snippet_text = html.escape("\n".join(lines[start - 1 : end]))
    print(f'<pre data-file="{html.escape(display_path)}" data-start="{start}"><code class="language-{lang}">{snippet_text}</code></pre>')
    return 0


def parse_range_nums(spec: str) -> set[int]:
    nums: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        pieces = part.split("-")
        a = int(pieces[0])
        b = int(pieces[1]) if len(pieces) > 1 else a
        nums.update(range(a, b + 1))
    return nums


def check_one_html(html_file: Path) -> list[str]:
    errors: list[str] = []
    text = html_file.read_text(encoding="utf-8")

    # 1. 未替换占位符检查
    if "TODO-LESSON" in text or "{{" in text and "}}" in text:
        # 排除代码演示中合法的 Python 双花括号 f-string 转义：仅拦截模板大写占位符
        if "TODO-LESSON" in text:
            errors.append("存在未完成的 TODO-LESSON 占位符")
        tpl_vars = re.findall(r"\{\{[A-Z_]+\}\}", text)
        if tpl_vars:
            errors.append(f"存在未替换的模板变量: {tpl_vars}")

    # 2. 敏感凭证扫描
    for pat in SECRET_PATTERNS:
        if pat.search(text):
            errors.append(f"疑似包含敏感密钥格式: {pat.pattern}")

    # 3. 相对资源链接存在性检查（href / src）
    for attr_match in re.finditer(r'(?:href|src)="([^"#?]+)', text):
        ref = attr_match.group(1).strip()
        if not ref or ref.startswith(("http://", "https://", "mailto:", "javascript:", "data:")):
            continue
        resolved = (html_file.parent / ref).resolve()
        if not resolved.exists():
            errors.append(f"相对路径不存在: {ref} -> {resolved}")

    # 4. .code-walk 行号范围越界核查
    for walk_match in re.finditer(r'<div class="code-walk"[^>]*>([\s\S]*?)</div>', text):
        walk_html = walk_match.group(1)
        pre_match = re.search(r'<pre[^>]*data-start="(\d+)"[^>]*><code[^>]*>([\s\S]*?)</code></pre>', walk_html)
        if not pre_match:
            continue
        start_line = int(pre_match.group(1))
        code_lines_count = len(html.unescape(pre_match.group(2)).rstrip("\n").split("\n"))
        end_line = start_line + code_lines_count - 1
        for li_match in re.finditer(r'data-lines="([^"]+)"', walk_html):
            spec = li_match.group(1)
            try:
                nums = parse_range_nums(spec)
            except ValueError:
                errors.append(f"code-walk data-lines 格式非法: {spec}")
                continue
            out_of_bounds = sorted(n for n in nums if n < start_line or n > end_line)
            if out_of_bounds:
                errors.append(f"code-walk data-lines='{spec}' 超出代码块实际行号范围 L{start_line}–L{end_line}")

    # 5. 内联 JavaScript 语法检查（调用本机 node --check）
    node_bin = shutil.which("node")
    if node_bin:
        for idx, sc_match in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)(?![^>]*application/json)[^>]*>([\s\S]*?)</script>", text)):
            js_code = sc_match.group(1).strip()
            if not js_code:
                continue
            with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
                tmp.write(js_code)
                tmp_path = Path(tmp.name)
            try:
                proc = subprocess.run([node_bin, "--check", str(tmp_path)], capture_output=True, text=True)
                if proc.returncode != 0:
                    errors.append(f"内联 <script #{idx + 1}> JS 语法错误: {proc.stderr.strip()}")
            finally:
                tmp_path.unlink(missing_ok=True)

    return errors


def cmd_check(args: argparse.Namespace) -> int:
    targets: list[Path] = []
    if args.all:
        index_html = LEARNING_ROOT / "index.html"
        if index_html.exists():
            targets.append(index_html)
        targets.extend(sorted(LESSONS_DIR.glob("M*.html")))
    elif args.file:
        targets.append(Path(args.file).resolve())
    else:
        print("请指定要检查的 HTML 文件路径，或使用 --all", file=sys.stderr)
        return 1

    # 同时检查共享 JS 语法
    node_bin = shutil.which("node")
    shared_js = LEARNING_ROOT / "assets" / "deskbot-course.js"
    if node_bin and shared_js.exists():
        proc = subprocess.run([node_bin, "--check", str(shared_js)], capture_output=True, text=True)
        if proc.returncode != 0:
            print(f"✗ 共享脚本语法错误 {shared_js}:\n{proc.stderr}", file=sys.stderr)
            return 1

    failed = 0
    for target in targets:
        errs = check_one_html(target)
        rel = target.relative_to(LEARNING_ROOT) if target.is_relative_to(LEARNING_ROOT) else target
        if errs:
            failed += 1
            print(f"✗ {rel} 发现 {len(errs)} 个问题：")
            for err in errs:
                print(f"  - {err}")
        else:
            print(f"✓ {rel} 校验通过（0 占位符 · 0 断链 · 行号对齐 · JS 语法正常）")

    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Deskbot 交互式 HTML 课程构建与校验工具")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("status", help="查看当前已生成课程与下一待生成课号")

    p_new = sub.add_parser("new", help="从 templates/lesson.html 创建新课 HTML 与练习目录")
    p_new.add_argument("lesson_id", help="课号，例如 M00.02")
    p_new.add_argument("--force", action="store_true", help="覆盖已存在的同课号 HTML")

    p_snip = sub.add_parser("snippet", help="从真实 Deskbot/server/voice 提取带精确行号的 <pre> 代码片段")
    p_snip.add_argument("path", help="相对 server/voice 的路径，例如 src/voice_server/camera_dialogue.py")
    p_snip.add_argument("start", type=int, help="起始行号（从 1 开始）")
    p_snip.add_argument("end", type=int, help="结束行号（包含）")

    p_chk = sub.add_parser("check", help="校验课程 HTML 完整性、链接、行号范围与 JS 语法")
    p_chk.add_argument("file", nargs="?", help="单个 HTML 文件路径")
    p_chk.add_argument("--all", action="store_true", help="检查 index.html 与 lessons/ 下全部课程")

    args = parser.parse_args()
    if args.cmd == "status":
        return cmd_status(args)
    if args.cmd == "new":
        return cmd_new(args)
    if args.cmd == "snippet":
        return cmd_snippet(args)
    if args.cmd == "check":
        return cmd_check(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
