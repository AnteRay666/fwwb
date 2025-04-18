// main.js
import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { ElMessage } from 'element-plus'
import { createPinia } from 'pinia'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'


// 配置marked
marked.setOptions({
    highlight: function (code, lang) {
        return hljs.highlightAuto(code).value;
    }
});
const pinia = createPinia()
// 创建Vue实例
const app = createApp(App);
app.config.globalProperties.$message = ElMessage
// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 全局配置
app.use(router);
app.use(ElementPlus);
app.use(pinia);
// 挂载应用
app.mount('#app');