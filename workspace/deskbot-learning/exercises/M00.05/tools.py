"""M00.05 多文件练习模块 1：模拟设备工具定义 (tools.py)。"""


def model_tool_name(wire_name: str) -> str:
    """将固件点号工具名转为大模型合法函数名（同 camera_dialogue.py::_model_tool_name）。"""
    return "device_" + wire_name.replace(".", "_")


def get_device_status() -> dict[str, object]:
    return {"success": True, "online": True, "battery": 82}


def set_brightness(*, brightness: int) -> dict[str, object]:
    if isinstance(brightness, bool) or not isinstance(brightness, int) or not 0 <= brightness <= 100:
        raise ValueError("brightness 必须是 0..100 的整数")
    return {"success": True, "brightness": brightness}


REGISTRY = {
    "self.get_device_status": get_device_status,
    "self.screen.set_brightness": set_brightness,
}
