<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { EditorState, Compartment } from "@codemirror/state";
  import { EditorView, keymap, lineNumbers } from "@codemirror/view";
  import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
  import { javascript } from "@codemirror/lang-javascript";
  import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
  import { editorTheme, type ThemeId } from "./themes";

  let {
    themeId,
    onRun,
    onCursor,
    onChange,
  }: {
    themeId: ThemeId;
    onRun: () => void;
    onCursor: (ln: number, col: number) => void;
    onChange: (code: string) => void;
  } = $props();

  let host: HTMLDivElement | undefined;
  let view: EditorView | undefined;
  const themeComp = new Compartment();

  const starter = `const usuario = {
  nombre: "Dev",
  rol: "Admin"
};

const saludar = (u) => {
  return \`Hola, \${u.nombre}\`;
};

console.log(usuario);
saludar(usuario);
`;

  $effect(() => {
    if (!view) return;
    view.dispatch({ effects: themeComp.reconfigure(editorTheme(themeId)) });
  });

  onMount(() => {
    if (!host) return;
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: starter,
        extensions: [
          lineNumbers(),
          history(),
          javascript(),
          autocompletion({ defaultKeymap: true }),
          keymap.of([
            { key: "Mod-Enter", run: () => (onRun(), true) },
            ...defaultKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
          ]),
          themeComp.of(editorTheme(themeId)),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChange(u.state.doc.toString());
            const pos = u.state.selection.main.head;
            const line = u.state.doc.lineAt(pos);
            onCursor(line.number, pos - line.from + 1);
          }),
          EditorView.theme({ "&": { height: "100%" }, ".cm-scroller": { overflow: "auto" } }),
        ],
      }),
    });
    onChange(starter);
  });

  onDestroy(() => view?.destroy());
</script>

<div class="ed" bind:this={host}></div>

<style>
  .ed {
    height: 100%;
    min-width: 0;
  }
  .ed :global(.cm-editor) {
    height: 100%;
  }
</style>
