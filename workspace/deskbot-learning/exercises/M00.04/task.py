"""M00.04 动手实验：纯标准库最小模拟工具调度器（循环上限 + 函数契约 + 异常兜底）。

运行方式：
  python3 workspace/deskbot-learning/exercises/M00.04/task.py
"""

DEVICE_STATE = {"battery": 78, "volume": 50, "theme": "light"}


def get_battery() -> dict[str, object]:
    return {"success": True, "battery": DEVICE_STATE["battery"]}


def set_volume(*, level: int) -> dict[str, object]:
    if isinstance(level, bool) or not isinstance(level, int) or not 0 <= level <= 100:
        raise ValueError("音量 level 必须是 0 到 100 之间的整数")
    DEVICE_STATE["volume"] = level
    return {"success": True, "volume": DEVICE_STATE["volume"]}


TOOLS = {
    "self.get_battery": get_battery,
    "self.audio_speaker.set_volume": set_volume,
}


def dispatch_tool(name: str, arguments: dict[str, object]) -> dict[str, object]:
    """安全执行单个工具：任何异常都转成结构化错误字典，绝不让服务崩溃。"""
    if name not in TOOLS:
        return {"success": False, "error": f"当前会话没有此设备工具: {name}"}
    try:
        func = TOOLS[name]
        return func(**arguments)
    except (TypeError, ValueError) as exc:
        return {"success": False, "error": str(exc)}


def run_bounded_plan(plan: list[tuple[str, dict[str, object]]], *, max_rounds: int = 3) -> list[dict[str, object]]:
    outcomes: list[dict[str, object]] = []
    for round_index in range(max_rounds):
        if round_index >= len(plan):
            break
        tool_name, args = plan[round_index]
        result = dispatch_tool(tool_name, args)
        outcomes.append({"round": round_index + 1, "tool": tool_name, "result": result})
        if result.get("success") is False:
            # 对照 camera_dialogue.py 当前行为：遇到失败立即终止循环
            break
    return outcomes


if __name__ == "__main__":
    sample_plan = [
        ("self.get_battery", {}),
        ("self.audio_speaker.set_volume", {"level": 80}),
        ("self.audio_speaker.set_volume", {"level": 150}),  # 故意越界！
        ("self.get_battery", {}),                           # 因为上一步失败 break，这一步不会执行
    ]
    for step in run_bounded_plan(sample_plan, max_rounds=3):
        print(f"[第{step['round']}步] {step['tool']} -> {step['result']}")
