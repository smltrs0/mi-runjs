<script lang="ts">
  let { children } = $props();
</script>

{@render children()}

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(html, body) {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #221f22;
    color: #fcfcfa;
    font-family: Inter, Segoe UI, system-ui, sans-serif;
    user-select: none;
  }
</style>
