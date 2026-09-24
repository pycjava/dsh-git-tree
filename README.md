# dsh-git-tree

在每个 DSH 会话的标题栏，以及**新建会话页（输入框右下角、Agent/模型选择器旁）**显示当前 Git 分支，
点击即可选择本地分支并手动切换。

Show the current Git branch in **every DSH session header** and on the
**new-session screen (bottom-right of the composer, beside the Agent/model seat)**,
with a click-to-open picker for manually switching local branches.

## 功能

- 会话标题栏新增 `⎇ <branch>` 徽章（位于 agent-preset 徽章之后）。
- 新建会话页的输入框右下角（Agent/模型选择器旁）显示同一个 `⎇ <branch>` 分支下拉框；
  只在「空白新会话」阶段出现，发送第一条消息后自动隐藏，与 Agent 预设芯片的展示时机一致。
- 当前分支、本地分支列表、工作区是否 dirty 一目了然；分支状态每 5 秒刷新一次，窗口重新聚焦时强制刷新。
- 点击徽章/下拉框展开分支列表，点选分支执行 `git switch --quiet -- <branch>`。
- 切换失败（例如有未提交改动且无法自动合并）会在菜单内显示 git 的原始错误，**绝不强切、绝不 stash、绝不丢弃改动**。
- 分支下拉框底部新增「查看 Git 图谱」入口，点击会关闭分支下拉框并**单独弹出一个独立小窗**，
  在小窗内以 **VSCode Git Graph 风格的节点+连线图谱**渲染全部提交（默认 100 条）：每条提交是
  一个彩色节点，父提交间以折线相连，分支按道次上色；行内显示提交信息、分支/标签徽章（与所在
  分支同色）、作者、相对时间与短哈希。小窗外观使用与 DeepSeek Harness 一致的 DSW 设计令牌。
  非 repo 时该入口不出现。
- 提供文本命令：`/git status`、`/git branches`、`/git switch <branch>`、`/git graph [count] [--no-all]`。
- 所有 git 命令都针对会话的 `cwd`；多个会话共享同一仓库时，一个会话切换后其他会话的徽章会自动跟上。

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
2. 新建会话页输入框右下角（Agent/模型选择器旁）会显示同一分支下拉框，作用对象就是
   这个即将开始会话的工作区；只在空白新会话阶段可见。
3. 点击分支徽章/下拉框 → 弹出本地分支列表。
4. 点击目标分支 → 执行切换；当前分支带 `✓`，dirty 时徽章上有橙色圆点。
5. 点击分支列表底部的「查看 Git 图谱」→ 分支下拉框关闭，并单独弹出一个独立小窗；
   在小窗里查看 VSCode 风格的提交图谱（节点连线 + 提交信息 + 分支标签徽章）。
   可用「刷新」重新拉取，点小窗外、× 或按 Esc 关闭。

命令行：

```
/git status              # 当前分支 + 是否 dirty + repo 路径
/git branches            # 列出本地分支
/git switch feat/foo     # 切换到 feat/foo
/git graph                # 查看提交图谱（默认全部 ref，前 100 条）
/git graph 200            # 查看前 200 条
/git graph --no-all       # 只看当前 HEAD 所在的分支
```

## 插件结构

```
cordis.patch.yml   bundle patch：插入一个 host 行
lib/
  index.js         host：GitTreeService（git 探测、/api/git-branch/* 路由、/git 命令）
  git-core.js      纯函数：分支名校验、git stdout 解析、wire state
  client.js        浏览器半部（手写 ModuleLoader bundle，零构建）
test/              纯函数单测（node --test）
scripts/check.mjs  node --check 语法门禁
```

- **host 半部**：`ctx.gitTree` 服务，只依赖 `node:child_process` 与 cordis 基础库。
  读取 `session.header.cwd`，用 `git rev-parse` 找仓库根，`git symbolic-ref` /
  `for-each-ref` / `git status --porcelain` 读取状态；`git switch` 是唯一写操作。
- **web 半部**：注册到两个官方扩展点（无需修改 DSH 客户端源码，官方 rc.6 即自带）：
  - `conversation.session.header.actions`（list slot，`scope: session`）：每个会话标题栏一个。
  - `conversation.input.right`（list slot，`scope: session`）：新建会话页输入框右下角的
    Agent/模型选择器旁一个，组件内按 `composerPhase === 'blank'` 门控，仅空白新会话阶段渲染。
  - 两处共用同一个 `GitBranchAction` 组件，各自轮询 `/api/git-branch/*` Fetch 路由。
- **RPC**：`state { sessionId, force? }`、`switch { sessionId, branch }` 与
  `graph { sessionId, count?, all? }`（返回 `{ cwd, all, count, lines, truncated, commits }`，
  `commits` 为结构化提交数据，供图谱渲染）。
  路由注册在共享 `/api` 通道的认证栅栏内（浏览器需先通过 Connection 认证），
  不暴露给模型或外部网络。

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
- 新建会话页**顶部 hero 行（工作区 + Agent 预设芯片那一行）没有官方 list 扩展槽**
  （`conversation.hero.agentPreset` 是 single 槽，注册会替换掉 Agent 芯片），所以无法
  在不改客户端源码的前提下把分支放到「Agent 芯片正右边」；本插件改而使用官方自带
  的 `conversation.input.right`（输入框右下角，紧邻 Agent/模型选择器）。若必须放在
  hero 行内，仍需改 DSH 客户端源码新增槽位。
- 只列出并切换**本地分支**；remote-tracking ref、tag、detached HEAD 不提供选择。
- 切换是普通 `git switch`：如果工作区改动与目标分支冲突，git 会拒绝并显示原因。

## 开发

```
npm run check   # 所有 JS 文件语法检查
npm test        # 纯函数单测
```
