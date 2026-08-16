# dsh-git-tree

在 **每个 DSH 会话的标题栏**显示当前 Git 分支，点击即可选择本地分支并手动切换。

Show the current Git branch in **every DSH session header**, with a click-to-open
picker for manually switching local branches.

## 功能

- 会话标题栏新增 `⎇ <branch>` 徽章（位于 agent-preset 徽章之后）。
- 当前分支、本地分支列表、工作区是否 dirty 一目了然；分支状态每 5 秒刷新一次，窗口重新聚焦时强制刷新。
- 点击徽章展开分支列表，点选分支执行 `git switch --quiet -- <branch>`。
- 切换失败（例如有未提交改动且无法自动合并）会在菜单内显示 git 的原始错误，**绝不强切、绝不 stash、绝不丢弃改动**。
- 提供文本命令：`/git status`、`/git branches`、`/git switch <branch>`。
- 所有 git 命令都针对 session header 里的 `cwd`；多个会话共享同一仓库时，一个会话切换后其他会话的徽章会自动跟上。

## 安装

```powershell
cd D:\dsh-git-tree
dsh plugin --profile web add .
```

然后**完全重启 DSH（web profile）**。插件 host 半部在启动时加载，浏览器半部由
`dsh.client` 声明自动注入 web 前端。

可选（无 UI 的 headless/TUI profile 也能用 `/git` 命令）：

```powershell
dsh plugin --profile headless add .
```

## 使用

1. 打开任意会话，标题栏右侧会显示当前分支（无仓库时显示 `无 Git 仓库`）。
2. 点击分支徽章 → 弹出本地分支列表。
3. 点击目标分支 → 执行切换；当前分支带 `✓`，dirty 时徽章上有橙色圆点。

命令行：

```
/git status              # 当前分支 + 是否 dirty + repo 路径
/git branches            # 列出本地分支
/git switch feat/foo     # 切换到 feat/foo
```

## 插件结构

```
cordis.patch.yml   bundle patch：插入一个 host 行
lib/
  index.js         host：GitTreeService（git 探测、/git-branch RPC、/git 命令）
  git-core.js      纯函数：分支名校验、git stdout 解析、wire state
  client.js        浏览器半部（手写 ModuleLoader bundle，零构建）
test/              纯函数单测（node --test）
scripts/check.mjs  node --check 语法门禁
```

- **host 半部**：`ctx.gitTree` 服务，只依赖 `node:child_process` 与 cordis 基础库。
  读取 `session.header.cwd`，用 `git rev-parse` 找仓库根，`git symbolic-ref` /
  `for-each-ref` / `git status --porcelain` 读取状态；`git switch` 是唯一写操作。
- **web 半部**：注册到官方扩展点
  `conversation.session.header.actions`（list slot，`scope: session`），
  每个会话实例各自轮询 `/git-branch` loopback RPC。
- **RPC**：`state { sessionId, force? }` 与 `switch { sessionId, branch }`。
  只监听 loopback（`authority: 'loopback'`），不暴露给模型或外部网络。

## 配置

编辑 profile patch 层（例如 `$DSH_HOME/profiles/web/cordis.patch.yml`）：

```yaml
- id: dsh-git-tree
  config:
    gitPath: git        # git 可执行文件
    timeoutMs: 8000     # 单条 git 命令超时
    maxBuffer: 4194304  # 单条 git 命令输出上限
    cacheMs: 3000       # host 侧状态缓存时长（浏览器每 5s 轮询）
```

## 已知限制

- DSH 侧栏的会话行**没有逐行扩展槽**（`sidebar.workspaces` 是单槽，占位需要整体替换
  整个浏览器），因此分支显示落在每个会话自己的标题栏——这是官方契约允许的逐会话
  位置。侧栏行内直接显示分支需要修改 DSH 客户端源码。
- 只列出并切换**本地分支**；remote-tracking ref、tag、detached HEAD 不提供选择。
- 切换是普通 `git switch`：如果工作区改动与目标分支冲突，git 会拒绝并显示原因。

## 开发

```
npm run check   # 所有 JS 文件语法检查
npm test        # 纯函数单测
```
