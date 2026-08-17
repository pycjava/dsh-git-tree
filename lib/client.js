window.__ModuleLoader__.load({
  id: "dsh-git-tree",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })

    let React = require("react")
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

    function basename(path) {
      if (typeof path !== "string" || path === "") return ""
      return path.replace(/[\/]+$/, "").split(/[\/]/).pop()
    }

    /**
     * The per-session header action. Receives the framework session kit
     * (`sessionId`, hooks, `t`) plus the registrant's injected RPC caller.
     */
    function GitBranchAction({ sessionId, t, call }) {
      const [state, setState] = useState({ status: "loading", value: null, error: null })
      const [open, setOpen] = useState(false)
      const [switching, setSwitching] = useState(null)
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

      // Dismiss the popup on outs
      // Dismiss the popup on outside pointer-down and on Escape.
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
              if (!open) void load(true)
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

      if (!repo || !open) {
        return React.createElement("div", { className: "dshGit_wrap", ref: wrapRef }, trigger)
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

      const menu = React.createElement(
        "div",
        { className: "dshGit_menu", role: "listbox", "aria-label": t("menuTitle") },
        React.createElement(
          "div",
          { className: "dshGit_menuHead" },
          React.createElement("span", { className: "dshGit_menuTitle", title: value.cwd }, menuTitle),
          React.createElement(
            "button",
            { type: "button", className: "dshGit_refresh", title: t("refreshHint"), onClick: () => void load(true) },
            t("refresh"),
          ),
        ),
        state.error ? React.createElement("div", { className: "dshGit_error" }, t("failed", { message: state.error })) : null,
        items.length > 0
          ? React.createElement("div", { className: "dshGit_list" }, items)
          : React.createElement("div", { className: "dshGit_empty" }, t("empty")),
      )

      return React.createElement("div", { className: "dshGit_wrap", ref: wrapRef }, trigger, menu)
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

      const call = (endpoint, payload) => ctx.connection.rpc.call("/git-branch", endpoint, payload)

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
