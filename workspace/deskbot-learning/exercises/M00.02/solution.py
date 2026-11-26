"""M00.02 参考解法：演示类型差异（int vs str）与音量上限保护。"""

from pathlib import Path

device_id = "deskbot-sz-01"
volume = 65
volume_step_str = "10"

# 字符串 "10" 必须先用 int(...) 转成整数，才能和整数 volume 相加
new_volume = min(100, volume + int(volume_step_str))

print(f"脚本文件：{Path(__file__).resolve().name}")
print(f"原始类型对比：volume 是 {type(volume).__name__}，volume_step_str 是 {type(volume_step_str).__name__}")
print(f"安全转换相加后：{device_id} 当前音量 -> {new_volume}%")
