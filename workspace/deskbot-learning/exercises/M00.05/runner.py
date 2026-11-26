"""M00.05 多文件练习模块 2：JSON 参数反序列化与执行器 (runner.py)。"""

import json
from tools import REGISTRY, model_tool_name


def execute_raw_call(call_name: str, raw_arguments: str) -> str:
    """接收模型发来的工具名和 JSON 字符串，返回 UTF-8 JSON 结果字符串。"""
    # 支持把 device_self_screen_set_brightness 还原回 self.screen.set_brightness
    wire_name = next((k for k in REGISTRY if model_tool_name(k) == call_name), call_name)
    if wire_name not in REGISTRY:
        return json.dumps({"success": False, "error": "未知设备工具"}, ensure_ascii=False)

    try:
        parsed = json.loads(raw_arguments or "{}")
    except ValueError:
        return json.dumps({"success": False, "error": "工具参数不是合法 JSON"}, ensure_ascii=False)

    if not isinstance(parsed, dict):
        return json.dumps({"success": False, "error": "工具参数必须是 JSON 对象"}, ensure_ascii=False)

    try:
        outcome = REGISTRY[wire_name](**parsed)
    except (TypeError, ValueError) as exc:
        outcome = {"success": False, "error": str(exc)}
    return json.dumps(outcome, ensure_ascii=False)


if __name__ == "__main__":
    print("正常查询 ->", execute_raw_call("device_self_get_device_status", "{}"))
    print("合法调光 ->", execute_raw_call("device_self_screen_set_brightness", '{"brightness": 60}'))
    print("损坏JSON ->", execute_raw_call("device_self_screen_set_brightness", '{"brightness": '))
