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

// 配置marked
marked.setOptions({
    highlight: function (code, lang) {
        return hljs.highlightAuto(code).value;
    }
});

// 创建Vue实例
const app = createApp(App);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 全局配置
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');