# Deskbot 随堂动手实验目录 (`exercises/`)

本目录存放每节课配套的**本地离线 Python 小实验、故障复现脚本与阶段闭卷盲写练习**（由 `scripts/course_tool.py new Mxx.yy` 自动创建子目录，例如 `exercises/M00.02/`）。

## 目录约定

- `exercises/Mxx.yy/task.py`：供你亲手修改、预测输出和练习的起点脚本。
- `exercises/Mxx.yy/solution.py`：参考实现（建议先自己动手跑过、试错后再对照）。
- `exercises/Mxx.yy/test_*.py`：配套 `pytest` 自检用例。
- `exercises/Mxx.yy/outputs/`：运行生成的临时 `.db` 或日志（已被 `.gitignore` 自动忽略，不污染仓库）。

## 真实 Deskbot 仓库改造分支建议（`M01.06` 起适用）

进入 `PR-1`～`PR-5` 改造真实 `/home/yyy/desktop/ai/Deskbot/server/voice` 代码前，建议先在 `Deskbot` 仓库从 `main` 切出独立升级分支（保留 `main` 作为 `M05.03` 改前对照基线）：

```bash
cd /home/yyy/desktop/ai/Deskbot
git checkout -b feat/agent-portfolio-upgrade
```
