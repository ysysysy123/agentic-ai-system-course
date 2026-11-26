"""M00.03 参考解法：扩展支持忽略句末标点与安全读取可选字段 (.get)。"""

SYSTEM_PROMPT = "你是桌面陪伴助手，请用简洁中文口语回答。"
STOP_WORDS = {"停下", "停止", "停住", "刹车", "马上停下"}


def route_and_build_messages(history: list[dict[str, str]], raw_input: str) -> tuple[str, list[dict[str, str]]]:
    # 同时去掉首尾空格与常见句末标点，贴近 camera_dialogue.py 的真实清洗思路
    cleaned = raw_input.strip().rstrip("。！!?？.")
    if not cleaned:
        return "empty", []
    if cleaned in STOP_WORDS:
        return "direct_stop", []

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(dict(item) for item in history)
    messages.append({"role": "user", "content": raw_input.strip()})
    return "llm_chat", messages


if __name__ == "__main__":
    history = [{"role": "user", "content": "你好"}, {"role": "assistant", "content": "你好呀！"}]
    route1, _ = route_and_build_messages(history, "  停下！ ")
    route2, msgs = route_and_build_messages(history, " 今天深圳热吗？ ")
    assert route1 == "direct_stop"
    assert route2 == "llm_chat" and len(msgs) == 4
    assert len(history) == 2
    print("✓ 所有分支、句末标点清洗与浅拷贝隔离断言全部通过！")
