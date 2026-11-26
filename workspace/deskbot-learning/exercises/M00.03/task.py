"""M00.03 动手实验：清洗用户输入、确定性分支路由与拼装 LLM messages 列表。

运行方式：
  python3 workspace/deskbot-learning/exercises/M00.03/task.py
"""

SYSTEM_PROMPT = "你是桌面陪伴助手，请用简洁中文口语回答。"


def route_and_build_messages(history: list[dict[str, str]], raw_input: str) -> tuple[str, list[dict[str, str]]]:
    """返回 (路由分支名, 组装好的新消息列表)，且绝不污染外部传入的 history！"""
    cleaned = raw_input.strip()
    if not cleaned:
        return "empty", []

    if cleaned in {"停下", "停止", "停住", "马上停下"}:
        return "direct_stop", []

    # 关键防坑：复制一份新列表与字典，避免修改调用方原有的 history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in history:
        messages.append(dict(item))
    messages.append({"role": "user", "content": cleaned})
    return "llm_chat", messages


if __name__ == "__main__":
    prior_history = [
        {"role": "user", "content": "记住我喜欢喝无糖绿茶"},
        {"role": "assistant", "content": "已更新长期记忆。"},
    ]

    for sample in ["   ", "  马上停下  ", "  我平时喜欢喝什么？  "]:
        route, built = route_and_build_messages(prior_history, sample)
        last_user = built[-1].get("content") if built else None
        print(f"输入={sample!r} -> 分支={route} | 消息条数={len(built)} | 末条内容={last_user}")

    print(f"原 history 长度保持不变：{len(prior_history)} 条（未被污染 ✓）")
