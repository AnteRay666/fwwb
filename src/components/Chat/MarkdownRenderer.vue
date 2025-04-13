<template>
  <div class="markdown-content" ref="container"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import katex from 'katex'
import DOMPurify from 'dompurify'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const container = ref(null)

// 配置 Markdown 扩展
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  breaks: true,
  gfm: true
})

// 自定义数学公式渲染器
const renderLatex = (content) => {
  const blockRegex = /(?:\$\$|\\\[)([\s\S]*?)(?:\$\$|\\\])/g
  const inlineRegex = /(?:\$|\\\()([\s\S]*?)(?:\$|\\\))/g
  return content
    .replace(blockRegex, (_, equation) => {
      try {
        return katex.renderToString(equation, { displayMode: true })
      } catch (e) {
        return `<div class="katex-error">公式渲染错误：${e.message}</div>`
      }
    })
    .replace(inlineRegex, (_, equation) => {
      try {
        return katex.renderToString(equation, { displayMode: false })
      } catch (e) {
        return `<span class="katex-error">${e.message}</span>`
      }
    })

}

// 安全渲染管道
const renderContent = (content) => {
  const withMath = renderLatex(content)
  const html = marked.parse(withMath)
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'], // 允许特定标签
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  })
}

// 渲染逻辑
// 渲染逻辑
const updateContent = async () => {
  if (!container.value) return

  // 渲染 Markdown 内容
  container.value.innerHTML = renderContent(props.content)

  // 确保 DOM 已更新
  await nextTick()

  // 高亮所有代码块
  container.value.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block)
  })

  // 修改所有链接为新标签页打开
  container.value.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer') // 安全最佳实践
  })
}

// 优化性能的监听
watch(() => props.content, () => {
  updateContent()
}, { immediate: true })

onMounted(updateContent)
</script>

<style>
@import 'katex/dist/katex.min.css';
@import 'highlight.js/styles/github.css';

.markdown-content {
  line-height: 1.6;

  /* 数学公式样式 */
  .katex {
    font-size: 1.1em;
    overflow-x: auto;
    overflow-y: hidden;

    .base {
      margin: 0.25em 0;
    }
  }

  /* 代码块样式 */
  pre {
    position: relative;

    &::after {
      content: attr(data-lang);
      position: absolute;
      right: 8px;
      top: 4px;
      font-size: 0.8em;
      color: #666;
    }
  }

  /* 表格样式增强 */
  table {
    width: 100%;
    border-collapse: collapse;

    th {
      background: #f8f9fa;
    }

    td,
    th {
      min-width: 120px;
    }
  }

  /* 图片响应式 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .markdown-content {
    .katex {
      filter: invert(1);
    }

    pre {
      background-color: #2d2d2d;

      code {
        color: #ccc;
      }
    }
  }
}
</style>