<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup>
import { marked } from 'marked'
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const renderedContent = computed(() => {
  return marked(props.content, {
    breaks: true,
    gfm: true,
    highlight: (code) => {
      return hljs.highlightAuto(code).value
    }
  })
})
</script>

<style scoped>
.markdown-content {
  white-space: pre-wrap;

  :deep(code) {
    background: #f3f3f3;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }

  :deep(pre) {
    background: #f8f8f8;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #ddd;
    margin: 8px 0;
    padding-left: 12px;
    color: #666;
  }

  :deep(table) {
    border-collapse: collapse;
    margin: 12px 0;

    td,
    th {
      padding: 8px;
      border: 1px solid #ddd;
    }
  }
}
</style>