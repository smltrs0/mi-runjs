<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import Editor from "$lib/Editor.svelte";
  import { runCode, type OutLine } from "$lib/run";
  import {
    THEME_IDS,
    THEME_LABELS,
    getPalette,
    type ThemeId,
  } from "$lib/themes";

  const LS_THEME = "mi-runjs-theme";
  const LS_AUTO = "mi-runjs-autorun";
  const LS_SPLIT = "mi-runjs-split";

  let code = $state("");
  let themeId = $state<ThemeId>(
    (localStorage.getItem(LS_THEME) as ThemeId) || "classic",
  );
  let autoRun = $state(localStorage.getItem(LS_AUTO) !== "0");
  let split = $state(Number(localStorage.getItem(LS_SPLIT) || 58));
  let lines = $state<OutLine[]>([]);
  let ms = $state(0);
  let ln = $state(1);
  let col = $state(1);
  let dragging = $state(false);
  let debounce: ReturnType<typeof setTimeout> | undefined;

  const palette = $derived(getPalette(themeId));
  const engine = $derived(
    typeof navigator !== "undefined"
      ? `WebView ${navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] ?? ""}`
      : "WebView",
  );

  function persist() {
    localStorage.setItem(LS_THEME, themeId);
    localStorage.setItem(LS_AUTO, autoRun ? "1" : "0");
    localStorage.setItem(LS_SPLIT, String(split));
  }

  function run() {
    const r = runCode(code);
    lines = r.lines;
    ms = r.ms;
  }

  function onChange(next: string) {
    code = next;
    if (!autoRun) return;
    clearTimeout(debounce);
    debounce = setTimeout(run, 280);
  }

  function clearOut() {
    lines = [];
  }

  function onMove(e: MouseEvent) {
    if (!dragging) return;
    const w = document.documentElement.clientWidth;
    split = Math.min(80, Math.max(30, (e.clientX / w) * 100));
  }

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    persist();
  }

  async function win(action: "min" | "max" | "close") {
    const w = getCurrentWindow();
    if (action === "min") await w.minimize();
    else if (action === "max") await w.toggleMaximize();
    else await w.close();
  }

  $effect(() => {
    themeId;
    autoRun;
    persist();
  });
</script>

<svelte:window onmousemove={onMove} onmouseup={stopDrag} />

<div
  class="app"
    style="--bg:{palette.bg}; --console:{palette.console}; --fg:{palette.fg}; --muted:{palette.comments}; --pink:{palette.pink}; --green:{palette.green}; --yellow:{palette.yellow}; --orange:{palette.orange};"
>
  <header class="bar" data-tauri-drag-region>
    <div class="traffic">
      <button class="dot close" onclick={() => win("close")} aria-label="Cerrar"></button>
      <button class="dot min" onclick={() => win("min")} aria-label="Minimizar"></button>
      <button class="dot max" onclick={() => win("max")} aria-label="Maximizar"></button>
    </div>
    <span class="title">Mi RunJS</span>
    <div class="actions">
      <button class="btn run" onclick={run}>▶ Run</button>
      <button class="btn" onclick={clearOut} title="Limpiar consola">🧹</button>
    </div>
  </header>

  <div class="work">
    <div class="pane" style="width:{split}%">
      <Editor
        {themeId}
        onRun={run}
        onCursor={(a, b) => {
          ln = a;
          col = b;
        }}
        {onChange}
      />
    </div>
    <div
      class="resizer"
      role="separator"
      onmousedown={() => (dragging = true)}
    ></div>
    <div class="pane console">
      {#if lines.length === 0}
        <p class="empty">Salida vacía. Cmd/Ctrl + Enter para ejecutar.</p>
      {:else}
        {#each lines as l}
          <pre class={l.kind}>{l.text}</pre>
        {/each}
      {/if}
    </div>
  </div>

  <footer class="foot">
    <label class="tog">
      <input type="checkbox" bind:checked={autoRun} />
      Auto-run: {autoRun ? "On" : "Off"}
    </label>
    <select bind:value={themeId}>
      {#each THEME_IDS as id}
        <option value={id}>{THEME_LABELS[id]}</option>
      {/each}
    </select>
    <span>Ln {ln}, Col {col}</span>
    <span>{engine}</span>
    <span>⏱ {ms}ms</span>
  </footer>
</div>

<style>
  .app {
    height: 100vh;
    display: grid;
    grid-template-rows: 40px 1fr 28px;
    background: var(--bg);
    color: var(--fg);
  }
  .bar {
    display: grid;
    grid-template-columns: 88px 1fr auto;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #0006;
    background: var(--bg);
  }
  .traffic {
    display: flex;
    gap: 7px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 0;
    cursor: pointer;
  }
  .close {
    background: #ff5f57;
  }
  .min {
    background: #febc2e;
  }
  .max {
    background: #28c840;
  }
  .title {
    font-size: 13px;
    opacity: 0.85;
    pointer-events: none;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  .btn {
    background: #0004;
    color: var(--fg);
    border: 1px solid #fff2;
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }
  .run {
    background: color-mix(in srgb, var(--green) 25%, transparent);
    border-color: var(--green);
  }
  .work {
    display: flex;
    min-height: 0;
  }
  .pane {
    min-width: 0;
    min-height: 0;
    height: 100%;
  }
  .resizer {
    width: 4px;
    cursor: col-resize;
    background: #0005;
  }
  .console {
    flex: 1;
    background: var(--console);
    overflow: auto;
    padding: 12px 14px;
    user-select: text;
    font-family: "Fira Code", "JetBrains Mono", "Cascadia Code", ui-monospace, monospace;
    font-size: 13px;
  }
  .empty {
    color: var(--muted);
    margin: 0;
  }
  pre {
    margin: 0 0 10px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .error {
    color: var(--pink);
  }
  .warn {
    color: var(--orange);
  }
  .result {
    color: var(--yellow);
  }
  .log,
  .info {
    color: var(--fg);
  }
  .foot {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 12px;
    font-size: 11px;
    color: var(--muted);
    border-top: 1px solid #0006;
    background: var(--bg);
  }
  .foot select {
    background: transparent;
    color: var(--fg);
    border: 0;
    font: inherit;
  }
  .tog {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
</style>
