"""M00.02 动手实验：变量、基本类型与 f-string 设备状态卡。

运行方式（在课程仓库根目录执行）：
  python3 workspace/deskbot-learning/exercises/M00.02/task.py
"""

from pathlib import Path

# 1. 用不同类型的变量描述一台模拟桌面机器人
device_id = "deskbot-sz-01"   # str：字符串（文本，必须加引号）
volume = 65                   # int：整数（没有引号，可以做加减法）
speech_threshold = 0.5        # float：小数（VAD 语音检测阈值）
mcp_enabled = False           # bool：布尔值（注意首字母大写 True / False）
last_error = None             # NoneType：表示“目前还没有错误”

# 2. 定位当前脚本文件自己所在的真实目录（不受终端 cd 位置影响！）
script_dir = Path(__file__).resolve().parent

print(f"📍 脚本真实目录：{script_dir.name}")
print(f"🤖 设备编号：{device_id} | 在线音量：{volume}% | VAD阈值：{speech_threshold}")
print(f"🔧 工具开关 mcp_enabled={mcp_enabled}（类型：{type(mcp_enabled).__name__}）")
print(f"🩺 最近错误：{last_error}")

# TODO(你来动手改一改)：
# 1. 把下面的 volume_step 改成整数 10（去掉引号），算出调大后的 new_volume 并打印；
# 2. 如果保留引号 "10"，直接写 volume + volume_step 会报什么错？亲手试一次看清报错最后一行！
volume_step = 10
new_volume = volume + volume_step
print(f"🔊 调高后的音量：{new_volume}%")
