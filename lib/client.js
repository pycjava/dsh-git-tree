window.__ModuleLoader__.load({
  id: "dsh-git-tree",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })

    let React = require("react")
    let ReactDOM = null
    try { ReactDOM = require("react-dom") } catch (_) {}
    let { useCallback, useEffect, useMemo, useRef, useState } = React

    //#region css
    const css = [
      ".dshGit_wrap{position:relative;display:inline-flex}",
      ".dshGit_trigger{box-sizing:border-box;background:var(--dsw-alias-fill-tsp-secondary);height:22px;max-width:240px;color:var(--dsw-alias-label-secondary);white-space:nowrap;cursor:pointer;border:none;border-radius:6px;align-items:center;gap:4px;padding:0 6px;font:inherit;font-size:12px;line-height:22px;display:inline-flex;overflow:hidden}",
      ".dshGit_trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGit_triggerMuted{cursor:default}",
      ".dshGit_triggerMuted:hover{background:var(--dsw-alias-fill-tsp-secondary)}",
      ".dshGit_icon{opacity:.7;flex:none;display:inline-flex}",
      ".dshGit_name{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
      ".dshGit_dot{background:var(--dsw-alias-state-warn-primary);border-radius:50%;flex:none;width:7px;height:7px}",
      ".dshGit_chevron{opacity:.55;flex:none;display:inline-flex}",
      ".dshGit_menu{z-index:60;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);min-width:220px;max-width:320px;box-shadow:var(--dsw-shadow-lv1,0 4px 16px #00000029);border-radius:10px;flex-direction:column;padding:4px;display:flex;position:absolute;top:calc(100% + 4px);right:0}",
      ".dshGit_menuHead{color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;padding:6px 8px;font-size:12px;line-height:16px;display:flex}",
      ".dshGit_menuTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshGit_refresh{color:var(--dsw-alias-label-secondary);background:0 0;cursor:pointer;border:none;border-radius:6px;flex:none;padding:2px 6px;font:inherit;font-size:12px;line-height:16px}",
      ".dshGit_refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGit_error{color:var(--dsw-alias-state-error-primary);padding:6px 8px;font-size:12px;line-height:16px}",
      ".dshGit_list{min-height:0;max-height:300px;flex-direction:column;gap:1px;padding:2px;display:flex;overflow:auto}",
      ".dshGit_item{width:100%;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;cursor:pointer;border:none;border-radius:6px;align-items:center;gap:8px;padding:5px 8px;font:inherit;font-size:13px;line-height:20px;display:flex}",
      ".dshGit_item:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGit_item:disabled{opacity:.55;cursor:default}",
      ".dshGit_itemCheck{color:var(--dsw-alias-label-secondary);flex:none;width:14px;font-size:12px}",
      ".dshGit_itemName{text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;overflow:hidden}",
      ".dshGit_itemCurrent{background:var(--dsw-alias-bg-layer-1)}",
      ".dshGit_itemBusy{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px}",
      ".dshGit_empty{color:var(--dsw-alias-label-tertiary);padding:8px;font-size:12px;line-height:16px}",
      ".dshGit_divider{height:1px;background:var(--dsw-alias-border-l2);margin:4px 0}",
      ".dshGit_viewGraph{width:100%;color:var(--dsw-alias-label-secondary);text-align:left;background:0 0;cursor:pointer;border:none;border-radius:6px;align-items:center;gap:8px;padding:5px 8px;font:inherit;font-size:12px;line-height:20px;display:flex}",
      ".dshGit_viewGraph:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGit_viewGraphIcon{opacity:.7;flex:none;display:inline-flex}",
      ".dshGit_graphBody{min-height:0;max-height:320px;flex-direction:column;padding:2px;display:flex;overflow:auto}",
      ".dshGit_graphLoading{color:var(--dsw-alias-label-tertiary);padding:8px;font-size:12px;line-height:16px}",
      ".dshGit_canvas{position:relative}",
      ".dshGit_svg{position:absolute;left:0;top:0;display:block;pointer-events:none}",
      ".dshGit_row{box-sizing:border-box;display:flex;align-items:center;gap:8px;padding-right:8px;font-size:12px;line-height:16px;min-width:0}",
      ".dshGit_subject{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary)}",
      ".dshGit_chips{flex:none;display:inline-flex;gap:4px;align-items:center;min-width:0}",
      ".dshGit_chip{flex:none;display:inline-flex;align-items:center;height:16px;padding:0 6px;border-radius:8px;font-size:11px;line-height:16px;color:#fff;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshGit_chipTag{background:var(--dsw-alias-fill-tsp-secondary);color:var(--dsw-alias-label-secondary)}",
      ".dshGit_chipHead{background:transparent;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}",
      ".dshGit_meta{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}",
      ".dshGit_graphHint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;padding:2px 8px 6px}",
      ".dshGit_modalOverlay{position:fixed;inset:0;z-index:1000;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-mask,rgba(0,0,0,.45));animation:dshGitFade .18s ease-out}",
      ".dshGit_modal{box-sizing:border-box;width:min(760px,calc(100vw - 32px));max-height:min(640px,calc(100vh - 48px));background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:var(--dsw-shadow-lv2,var(--dsw-shadow-lv1,0 8px 28px #0000004d));flex-direction:column;display:flex;overflow:hidden;animation:dshGitPop .18s ease-out}",
      ".dshGit_modalHead{box-sizing:border-box;color:var(--dsw-alias-label-primary);border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:8px;padding:8px 8px 8px 12px;font-size:13px;line-height:20px;display:flex}",
      ".dshGit_modalTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}",
      ".dshGit_modalActions{flex:none;display:inline-flex;align-items:center;gap:2px}",
      ".dshGit_modalClose{box-sizing:border-box;width:24px;height:24px;color:var(--dsw-alias-label-secondary);text-align:center;background:0 0;cursor:pointer;border:none;border-radius:6px;padding:0;font:inherit;font-size:14px;line-height:24px;display:inline-flex;align-items:center;justify-content:center;flex:none}",
      ".dshGit_modalClose:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGit_modalBody{min-height:0;flex:1;flex-direction:column;padding:2px 0;display:flex;overflow:hidden}",
      ".dshGit_modalBody .dshGit_graphBody{max-height:none;flex:1;padding:6px 8px 8px}",
      ".dshGit_modalBody .dshGit_graphHint{padding:2px 8px 8px}",
      "@keyframes dshGitFade{from{opacity:0}to{opacity:1}}",
      "@keyframes dshGitPop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}",
    ].join("\n")
    const tagId = "dsh-git-tree/client.css"
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      const tag = document.createElement("style")
      tag.dataset.plugin = "dsh-git-tree"
      tag.dataset.pluginCss = tagId
      tag.textContent = css
      document.head.appendChild(tag)
    }
    //#endregion

    //#region dictionaries
    const NS = "dsh-git-tree"
    const zh = {
      loading: "加载分支…",
      noRepo: "无 Git 仓库",
      noRepoHint: "当前目录不是 Git 仓库",
      dirty: "工作区有未提交的更改",
      dirtyHint: "有未提交的更改",
      detached: "游离 HEAD",
      unknown: "未知分支",
      menuTitle: "本地分支",
      refresh: "刷新",
      refreshHint: "刷新分支状态",
      failed: "操作失败：{message}",
      switchTo: "切换到 {name}",
      empty: "没有本地分支",
      viewGraph: "查看 Git 图谱",
      graphTitle: "Git 图谱",
      graphLoading: "加载图谱…",
      graphEmpty: "没有提交记录",
      graphTruncated: "仅显示前 {count} 条记录（已截断）",
      graphRefresh: "刷新图谱",
      graphRefreshHint: "刷新 Git 图谱",
      close: "关闭",
      closeHint: "关闭 Git 图谱",
    }
    const en = {
      loading: "Loading branch…",
      noRepo: "No Git repo",
      noRepoHint: "The session directory is not a Git repository",
      dirty: "Working tree has uncommitted changes",
      dirtyHint: "Uncommitted changes",
      detached: "Detached HEAD",
      unknown: "Unknown branch",
      menuTitle: "Local branches",
      refresh: "Refresh",
      refreshHint: "Refresh branch state",
      failed: "Operation failed: {message}",
      switchTo: "Switch to {name}",
      empty: "No local branches",
      viewGraph: "View Git graph",
      graphTitle: "Git graph",
      graphLoading: "Loading graph…",
      graphEmpty: "No commits",
      graphTruncated: "Showing first {count} (truncated)",
      graphRefresh: "Refresh graph",
      graphRefreshHint: "Refresh the Git graph",
      close: "Close",
      closeHint: "Close the Git graph",
    }
    //#endregion

    /** Inline SVG icons keep the bundle dependency-free. */
    function BranchIcon({ size = 12 }) {
      return React.createElement(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
        React.createElement("path", {
          fill: "currentColor",
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z",
        }),
      )
    }

    function ChevronIcon({ size = 10 }) {
      return React.createElement(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
        React.createElement("path", {
          fill: "currentColor",
          d: "M4.53 6.03a.75.75 0 0 1 1.06 0L8 8.44l2.41-2.41a.75.75 0 1 1 1.06 1.06L8.53 10.03a.75.75 0 0 1-1.06 0L4.53 7.09a.75.75 0 0 1 0-1.06Z",
        }),
      )
    }

    /** Close icon for the graph dialog. */
    function CloseIcon({ size = 14 }) {
      return React.createElement(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
        React.createElement("path", {
          stroke: "currentColor",
          strokeWidth: 1.5,
          strokeLinecap: "round",
          d: "M4 4l8 8M12 4l-8 8",
        }),
      )
    }

    /** Small commit-graph glyph (nodes joined by edges). */
    function GraphIcon({ size = 12 }) {
      return React.createElement(
        "svg",
        { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
        React.createElement("path", {
          stroke: "currentColor",
          strokeWidth: 1.5,
          strokeLinecap: "round",
          d: "M4 3.5v7M4 7h8M12 4.5v6",
        }),
        React.createElement("circle", { cx: 4, cy: 3.5, r: 1.5, fill: "currentColor" }),
        React.createElement("circle", { cx: 4, cy: 10.5, r: 1.5, fill: "currentColor" }),
        React.createElement("circle", { cx: 12, cy: 4.5, r: 1.5, fill: "currentColor" }),
        React.createElement("circle", { cx: 12, cy: 10.5, r: 1.5, fill: "currentColor" }),
      )
    }

    function basename(path) {
      if (typeof path !== "string" || path === "") return ""
      return path.replace(/[\/]+$/, "").split(/[\/]/).pop()
    }

    /** Relative human time for an ISO timestamp, e.g. "5m", "3d", "2mo". */
    function relativeTime(iso) {
      if (typeof iso !== "string" || iso === "") return ""
      const then = new Date(iso).getTime()
      if (!Number.isFinite(then)) return ""
      const s = Math.max(0, Math.floor((Date.now() - then) / 1000))
      if (s < 60) return s + "s"
      const m = Math.floor(s / 60)
      if (m < 60) return m + "m"
      const h = Math.floor(m / 60)
      if (h < 24) return h + "h"
      const d = Math.floor(h / 24)
      if (d < 30) return d + "d"
      const mo = Math.floor(d / 30)
      if (mo < 12) return mo + "mo"
      return Math.floor(mo / 12) + "y"
    }

    // Deterministic palette shared by every lane in the graph.
    const GRAPH_COLORS = [
      "#519ABA", "#B58FD6", "#73B06F", "#E0913B", "#D06A6A",
      "#5B9BD5", "#8FA5C8", "#B0B0D6", "#9CD6A0", "#D6C08F",
      "#D69CB0", "#6AB0A0", "#C89B62", "#7F9BC0", "#A9B06F",
    ]

    /**
     * Assign each commit a graph column (lane) and a color, walking commits
     * in the topo order the host returns (children before parents). The lane
     * model mirrors what `git log --graph` and VSCode Git Graph compute:
     * one lane per active branch path; a merge's secondary parents open new
     * lanes that collapse back once they rejoin an existing lane.
     * @param commits - array of `{ id, parents }`.
     * @returns `{ colOf, colorOf, maxCol }` keyed by commit id.
     */
    function computeLayout(commits) {
      let lanes = [] // each: { next, color }
      const colOf = new Map()
      const colorOf = new Map()
      let colorIdx = 0
      for (const c of commits) {
        let idx = lanes.findIndex((l) => l.next === c.id)
        let color
        if (idx === -1) {
          idx = lanes.length
          color = GRAPH_COLORS[colorIdx++ % GRAPH_COLORS.length]
          lanes.push({ next: c.id, color })
        } else {
          color = lanes[idx].color
        }
        colOf.set(c.id, idx)
        colorOf.set(c.id, color)

        const first = c.parents[0] ?? null
        lanes[idx].next = first
        for (let i = 1; i < c.parents.length; i++) {
          const p = c.parents[i]
          if (!lanes.some((l) => l.next === p)) {
            lanes.push({ next: p, color: GRAPH_COLORS[colorIdx++ % GRAPH_COLORS.length] })
          }
        }
        // Drop dead lanes and duplicate merges so no dangling lines remain.
        const seen = new Set()
        lanes = lanes.filter((l) => {
          if (l.next === null) return false
          if (seen.has(l.next)) return false
          seen.add(l.next)
          return true
        })
      }
      let maxCol = 0
      for (const col of colOf.values()) maxCol = Math.max(maxCol, col)
      return { colOf, colorOf, maxCol }
    }

    /** A colored branch/tag label chip shown on a commit row. */
    function RefChip({ type, name, color }) {
      const cls =
        "dshGit_chip" +
        (type === "tag" ? " dshGit_chipTag" : type === "HEAD" ? " dshGit_chipHead" : "")
      const style = type === "head" || type === "branch" ? { background: color } : undefined
      return React.createElement("span", { className: cls, style, title: name }, name)
    }

    /**
     * VSCode Git Graph style renderer: an SVG node-and-edge graph overlaid on
     * the left, with one commit row (subject, ref chips, author/time/hash) per
     * commit to its right. Pure function of `commits`, no hooks.
     */
    function GraphBody({ commits, t }) {
      const layout = computeLayout(commits)
      const rowH = 30
      const nodeR = 4.5
      const cellW = 20
      const padX = 14
      const graphWidth = padX + layout.maxCol * cellW + padX + 8
      const height = commits.length * rowH

      const pos = new Map()
      commits.forEach((c, i) => {
        const col = layout.colOf.get(c.id) ?? 0
        pos.set(c.id, { x: padX + col * cellW, y: (i + 0.5) * rowH })
      })

      const edges = []
      commits.forEach((c) => {
        const from = pos.get(c.id)
        const color = layout.colorOf.get(c.id) ?? "#888888"
        for (const parent of c.parents) {
          const to = pos.get(parent)
          if (to === undefined) continue
          const d =
            Math.abs(to.x - from.x) < 1
              ? "M" + from.x + " " + from.y + " L" + to.x + " " + to.y
              : "M" + from.x + " " + from.y + " V" + (from.y + 8) + " H" + to.x + " V" + to.y
          edges.push(
            React.createElement("path", {
              key: c.id + "->" + parent,
              d,
              stroke: color,
              strokeWidth: 2,
              fill: "none",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              opacity: 0.85,
            }),
          )
        }
      })

      const nodes = commits.map((c) => {
        const p = pos.get(c.id)
        const color = layout.colorOf.get(c.id) ?? "#888888"
        const isHead = (c.refs || []).some((r) => r.type === "head")
        return React.createElement("circle", {
          key: c.id,
          cx: p.x,
          cy: p.y,
          r: isHead ? nodeR + 1.2 : nodeR,
          fill: color,
          stroke: "#ffffff",
          strokeWidth: 1.2,
        })
      })

      const rows = commits.map((c) => {
        const color = layout.colorOf.get(c.id) ?? "#888888"
        const chips = (c.refs || []).map((r) =>
          React.createElement(RefChip, { key: r.name, type: r.type, name: r.name, color }),
        )
        const meta = [c.author, relativeTime(c.date), c.hash].filter((s) => s !== "").join(" · ")
        return React.createElement(
          "div",
          { className: "dshGit_row", key: c.id, style: { height: rowH, paddingLeft: graphWidth }, title: c.subject },
          React.createElement("span", { className: "dshGit_subject" }, c.subject),
          React.createElement("span", { className: "dshGit_chips" }, chips),
          React.createElement("span", { className: "dshGit_meta" }, meta),
        )
      })


      return React.createElement(
        "div",
        { className: "dshGit_canvas", style: { position: "relative", height, minWidth: graphWidth } },
        React.createElement(
          "svg",
          { className: "dshGit_svg", style: { position: "absolute", left: 0, top: 0 }, width: graphWidth, height },
          edges,
          nodes,
        ),
        rows,
      )
    }

    /**
     * The per-session header action. Receives the framework session kit
     * (`sessionId`, hooks, `t`) plus the registrant's injected RPC caller.
     */
    function GitBranchAction({ sessionId, t, call }) {
      const [state, setState] = useState({ status: "loading", value: null, error: null })
      const [open, setOpen] = useState(false)
      const [graphOpen, setGraphOpen] = useState(false)
      const [switching, setSwitching] = useState(null)
      const [graph, setGraph] = useState(null)
      const [graphError, setGraphError] = useState(null)
      const [graphLoading, setGraphLoading] = useState(false)
      const wrapRef = useRef(null)
      const busyRef = useRef(false)

      const load = useCallback(
        async (force = false) => {
          if (typeof call !== "function") {
            setState({ status: "error", value: null, error: "RPC unavailable" })
            return
          }
          try {
            const result = await call("state", { sessionId, force })
            if (result?.ok === true) {
              setState({ status: "ready", value: result.value, error: null })
            } else {
              const message = result?.error?.message ?? "git-branch RPC failed"
              setState((prev) => ({ status: "error", value: prev.status === "ready" ? prev.value : null, error: message }))
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            setState((prev) => ({ status: "error", value: prev.status === "ready" ? prev.value : null, error: message }))
          }
        },
        [call, sessionId],
      )

      const loadGraph = useCallback(
        async () => {
          if (typeof call !== "function") {
            setGraphError("RPC unavailable")
            return
          }
          setGraphLoading(true)
          setGraphError(null)
          try {
            const result = await call("graph", { sessionId, count: 100, all: true })
            if (result?.ok === true) {
              setGraph(result.value)
            } else {
              setGraphError(result?.error?.message ?? "git graph RPC failed")
            }
          } catch (error) {
            setGraphError(error instanceof Error ? error.message : String(error))
          } finally {
            setGraphLoading(false)
          }
        },
        [call, sessionId],
      )

      // Poll while mounted so branch switches made by other sessions (or by a
      // shell outside DSH) appear without a manual refresh.
      useEffect(() => {
        let alive = true
        const tick = () => {
          if (alive) void load(false)
        }
        tick()
        const timer = window.setInterval(tick, 5000)
        const onFocus = () => {
          if (alive) void load(true)
        }
        window.addEventListener("focus", onFocus)
        return () => {
          alive = false
          window.clearInterval(timer)
          window.removeEventListener("focus", onFocus)
        }
      }, [load])

      // Dismiss the branch dropdown on outside pointer-down and on Escape.
      useEffect(() => {
        if (!open) return
        const onDown = (event) => {
          if (wrapRef.current !== null && !wrapRef.current.contains(event.target)) setOpen(false)
        }
        const onKey = (event) => {
          if (event.key === "Escape") setOpen(false)
        }
        document.addEventListener("pointerdown", onDown)
        document.addEventListener("keydown", onKey)
        return () => {
          document.removeEventListener("pointerdown", onDown)
          document.removeEventListener("keydown", onKey)
        }
      }, [open])

      // Close the standalone graph dialog on Escape.
      useEffect(() => {
        if (!graphOpen) return
        const onKey = (event) => {
          if (event.key === "Escape") setGraphOpen(false)
        }
        document.addEventListener("keydown", onKey)
        return () => {
          document.removeEventListener("keydown", onKey)
        }
      }, [graphOpen])

      const switchTo = useCallback(
        (branch) => {
          if (switching !== null || busyRef.current || typeof call !== "function") return
          busyRef.current = true
          setSwitching(branch)
          call("switch", { sessionId, branch })
            .then((result) => {
              if (result?.ok === true) {
                setState({ status: "ready", value: result.value, error: null })
                setOpen(false)
              } else {
                const message = result?.error?.message ?? "branch switch failed"
                setState((prev) => ({ status: "error", value: prev.value, error: message }))
              }
            })
            .catch((error) => {
              const message = error instanceof Error ? error.message : String(error)
              setState((prev) => ({ status: "error", value: prev.value, error: message }))
            })
            .finally(() => {
              busyRef.current = false
              setSwitching(null)
            })
        },
        [call, sessionId, switching],
      )

      const value = state.status === "ready" ? state.value : null
      const repo = value?.repo === true
      const branchName = value?.branch ?? ""
      const branchLabel = repo
        ? branchName === ""
          ? t("unknown")
          : branchName
        : t("noRepo")

      const menuTitle = useMemo(() => basename(value?.cwd) || t("menuTitle"), [value?.cwd, t])

      const trigger = React.createElement(
        "button",
        {
          type: "button",
          className: "dshGit_trigger" + (repo ? "" : " dshGit_triggerMuted"),
          "aria-haspopup": "listbox",
          "aria-expanded": repo && open,
          title: repo
            ? `${value.cwd}${value.dirty ? " — " + t("dirty") : ""}`
            : state.error ?? t("noRepoHint"),
          onClick: () => {
            if (repo) {
              if (!open) {
                void load(true)
              }
              setOpen((v) => !v)
            } else {
              void load(true)
            }
          },
        },
        React.createElement("span", { className: "dshGit_icon" }, BranchIcon({})),
        React.createElement("span", { className: "dshGit_name" }, state.status === "loading" ? t("loading") : branchLabel),
        repo && value.dirty === true
          ? React.createElement("span", { className: "dshGit_dot", title: t("dirtyHint") })
          : null,
        repo ? React.createElement("span", { className: "dshGit_chevron" }, ChevronIcon({})) : null,
      )

      // The graph lives in its own centered dialog, not inside the branch list.
      const graphCommits = Array.isArray(graph?.commits) ? graph.commits : []
      let graphContent
      if (graphError !== null) {
        graphContent = React.createElement("div", { className: "dshGit_error" }, t("failed", { message: graphError }))
      } else if (graphLoading && graphCommits.length === 0) {
        graphContent = React.createElement("div", { className: "dshGit_graphLoading" }, t("graphLoading"))
      } else if (graphCommits.length > 0) {
        graphContent = React.createElement(
          "div",
          { className: "dshGit_graphBody" },
          GraphBody({ commits: graphCommits, t }),
          graph?.truncated === true
            ? React.createElement("div", { className: "dshGit_graphHint" }, t("graphTruncated", { count: graph.count ?? 100 }))
            : null,
        )
      } else {
        graphContent = React.createElement("div", { className: "dshGit_empty" }, t("graphEmpty"))
      }

      const modalElement =
        repo === true && graphOpen === true
          ? React.createElement(
              "div",
              { className: "dshGit_modalOverlay", onClick: (event) => { if (event.target === event.currentTarget) setGraphOpen(false) } },
              React.createElement(
                "div",
                { className: "dshGit_modal", role: "dialog", "aria-modal": "true", "aria-label": t("graphTitle") },
                React.createElement(
                  "div",
                  { className: "dshGit_modalHead" },
                  React.createElement("span", { className: "dshGit_modalTitle", title: graph?.cwd ?? value.cwd }, t("graphTitle")),
                  React.createElement(
                    "span",
                    { className: "dshGit_modalActions" },
                    React.createElement(
                      "button",
                      { type: "button", className: "dshGit_refresh", title: t("graphRefreshHint"), onClick: () => void loadGraph() },
                      t("graphRefresh"),
                    ),
                    React.createElement(
                      "button",
                      { type: "button", className: "dshGit_modalClose", title: t("closeHint"), "aria-label": t("close"), onClick: () => setGraphOpen(false) },
                      CloseIcon({}),
                    ),
                  ),
                ),
                React.createElement("div", { className: "dshGit_modalBody" }, graphContent),
              ),
            )
          : null

      const graphModal =
        modalElement !== null && ReactDOM !== null && ReactDOM.createPortal && typeof document !== "undefined"
          ? ReactDOM.createPortal(modalElement, document.body)
          : modalElement

      if (!repo) {
        return React.createElement("div", { className: "dshGit_wrap", ref: wrapRef }, trigger)
      }

      if (!open) {
        return React.createElement("div", { className: "dshGit_wrap", ref: wrapRef }, trigger, graphModal)
      }

      const items = value.branches.map((branch) =>
        React.createElement(
          "button",
          {
            type: "button",
            key: branch,
            role: "option",
            "aria-selected": branch === value.branch,
            className:
              "dshGit_item" +
              (branch === value.branch ? " dshGit_itemCurrent" : ""),
            disabled: switching !== null,
            title: t("switchTo", { name: branch }),
            onClick: () => switchTo(branch),
          },
          React.createElement("span", { className: "dshGit_itemCheck" }, branch === value.branch ? "✓" : ""),
          React.createElement("span", { className: "dshGit_itemName" }, branch),
          switching === branch ? React.createElement("span", { className: "dshGit_itemBusy" }, "…") : null,
        ),
      )

      const header = React.createElement(
        "div",
        { className: "dshGit_menuHead" },
        React.createElement("span", { className: "dshGit_menuTitle", title: value.cwd }, menuTitle),
        React.createElement(
          "button",
          { type: "button", className: "dshGit_refresh", title: t("refreshHint"), onClick: () => void load(true) },
          t("refresh"),
        ),
      )

      const body = [
        state.error ? React.createElement("div", { className: "dshGit_error" }, t("failed", { message: state.error })) : null,
        items.length > 0
          ? React.createElement("div", { className: "dshGit_list" }, items)
          : React.createElement("div", { className: "dshGit_empty" }, t("empty")),
        React.createElement("div", { className: "dshGit_divider" }),
        React.createElement(
          "button",
          {
            type: "button",
            className: "dshGit_viewGraph",
            title: t("viewGraph"),
            onClick: () => {
              setOpen(false)
              setGraph(null)
              setGraphError(null)
              setGraphOpen(true)
              void loadGraph()
            },
          },
          React.createElement("span", { className: "dshGit_viewGraphIcon" }, GraphIcon({ size: 12 })),
          React.createElement("span", { className: "dshGit_itemName" }, t("viewGraph")),
        ),
      ]

      const menu = React.createElement(
        "div",
        { className: "dshGit_menu", role: "listbox", "aria-label": t("menuTitle") },
        header,
        body,
      )

      return React.createElement("div", { className: "dshGit_wrap", ref: wrapRef }, trigger, menu, graphModal)
    }

    /**
     * Composer-side branch control. Registered into `conversation.input.right`
     * (an official list slot in the composer tool row) so the dropdown appears
     * on the new-session page next to the agent/model seat. Gated to the blank
     * phase so it only shows before the first message, matching the hero.
     */
    function GitBranchComposer({ sessionId, useSession, t, call }) {
      const blank = useSession((s) => s.composerPhase === 'blank')
      if (!blank) return null
      return React.createElement(GitBranchAction, { sessionId, t, call })
    }

    //#region client entry
    /** Services required by the header-action registration. */
    const inject = ["slots", "locale", "connection"]

    /** Contribute the branch control to the open session-header action row. */
    function apply(ctx) {
      ctx.effect(
        () => ctx.locale.register(NS, { zh, en }),
        "dsh-git-tree: dictionaries",
      )

      const call = (endpoint, payload) => ctx.connection.rpc.call("/api", "git-branch/" + endpoint, payload)

      ctx.slots.inject("conversation.session.header.actions", () =>
        ctx.slots.register(
          {
            name: "conversation.session.header.actions",
            id: "git-branch",
            order: 15,
            locale: NS,
            inject: () => ({ call }),
          },
          GitBranchAction,
        ),
      )

      ctx.slots.inject("conversation.input.right", () =>
        ctx.slots.register(
          {
            name: "conversation.input.right",
            id: "git-branch",
            order: 15,
            locale: NS,
            inject: () => ({ call }),
          },
          GitBranchComposer,
        ),
      )
    }
    //#endregion

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
