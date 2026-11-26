"""M00.05 单元测试练习 (test_runner.py)——你的第一组 pytest 自动化防线！

运行方式：
  /home/yyy/desktop/ai/Deskbot/server/voice/.venv/bin/pytest workspace/deskbot-learning/exercises/M00.05/test_runner.py -v
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from runner import execute_raw_call


def test_valid_model_tool_call_succeeds():
    raw_out = execute_raw_call("device_self_screen_set_brightness", '{"brightness": 75}')
    data = json.loads(raw_out)
    assert data["success"] is True
    assert data["brightness"] == 75


def test_broken_json_returns_structured_error():
    raw_out = execute_raw_call("device_self_get_device_status", "{bad json")
    data = json.loads(raw_out)
    assert data["success"] is False
    assert "合法 JSON" in data["error"]


def test_non_dict_json_is_rejected():
    # 注意："[1, 2, 3]" 是合法的 JSON 列表，但不是工具要求的 JSON 对象（字典）！
    raw_out = execute_raw_call("device_self_get_device_status", "[1, 2, 3]")
    data = json.loads(raw_out)
    assert data["success"] is False
    assert "JSON 对象" in data["error"]


def test_unknown_tool_is_rejected():
    raw_out = execute_raw_call("device_self_nuclear_launch", "{}")
    data = json.loads(raw_out)
    assert data["success"] is False
    assert "未知" in data["error"]
