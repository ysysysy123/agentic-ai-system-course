"""M00.04 参考解法：新增只读工具 get_theme 并区分“达到轮数上限”状态。"""

from task import DEVICE_STATE, TOOLS, dispatch_tool


def get_theme() -> dict[str, object]:
    return {"success": True, "theme": DEVICE_STATE["theme"]}


TOOLS["self.screen.get_theme"] = get_theme


def run_with_stop_reason(plan: list[tuple[str, dict[str, object]]], *, max_rounds: int = 3) -> tuple[str, list[dict[str, object]]]:
    outcomes: list[dict[str, object]] = []
    for idx, (tool_name, args) in enumerate(plan):
        if idx >= max_rounds:
            return "max_rounds", outcomes
        result = dispatch_tool(tool_name, args)
        outcomes.append({"round": idx + 1, "tool": tool_name, "result": result})
        if result.get("success") is False:
            return "tool_error", outcomes
    return "completed", outcomes


if __name__ == "__main__":
    reason1, out1 = run_with_stop_reason([("self.screen.get_theme", {})])
    reason2, out2 = run_with_stop_reason([("self.get_battery", {})] * 5, max_rounds=3)
    print(f"单步只读查询：stop_reason={reason1}, 结果={out1}")
    print(f"超长计划保护：stop_reason={reason2}, 实际执行步数={len(out2)}")
