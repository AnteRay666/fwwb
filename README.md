# 项目结构

设定界面如下。

注册登录界面：
RegisterLoginPage.vue
整体来说，这是一个小型弹窗，在主界面的左上方有一个按钮，点击后弹出注册登录界面。
注册登录界面有两个子界面：

默认是登录界面：LoginPage.vue
配置路由：/login
登录界面有两个输入框，一个是用户名，一个是密码。
登录界面有一个按钮，点击后会发送登录请求。
登录成功后，会跳转到主界面。

注册界面：RegisterPage.vue
配置路由：/register
输入用户名、密码、确认密码即可注册成功。
注册成功后，会自动跳转到登录界面。

主界面：
MainPage
默认在没有登录的情况下，中心界面是一个聊天框体。
这个聊天框体是一个组件，它的功能是：
给用户提供输入框，让用户输入消息。
给用户提供一个选择模型的下拉框，让用户选择模型。
给用户提供一个发送按钮，让用户发送消息。

详细设计：
主界面分为2个部分，左侧是一个侧边栏(可以隐藏)，右侧是一个主界面。
主界面中，分为2个组件，上面是一个聊天框体，用于显示用户的输入和AI的回复。
下面是一个输入框，用于用户输入消息。
输入框中，有一个选择模型的下拉框，用于用户选择模型。
输入框中，有一个发送按钮，用于用户发送消息。





左侧是一个侧边栏。
这个侧边栏是一个组件，它的功能是：
一个按钮，点击会隐藏侧边栏，再次点击会显示侧边栏。
一个按钮，点击会显示一个设置按钮。点击会显示一个设置按钮。
一个按钮开启新对话。

在用户登录后，将用户的用户名和后端返回的Token存储在LocalStorage,
    localStorage.setItem('username', this.form.username);
    localStorage.setItem('authToken', response.data.data.token);
然后动态检测LocalStorage.getItem('authToken')是否为空。如果存在则隐藏登录注册按钮。
UserInfoPage
用户信息界面，显示用户的用户名。
用户信息界面，显示用户的Token。


设置界面：
SettingsPage
设置界面可以更改主题，一般是深色和浅色，默认跟随系统。
设置界面可以更改语言，一般是中文和英文，默认跟随系统。
设置界面可以注销用户。


交互逻辑，包括<script></script>和<style></style>部分的逻辑都在单组件内实现。目前不考虑拆分。使用组合式API
按照下列步骤进行设计。
<!-- 1. Chatwindow.vue作为主界面。包含2个子组件，InputArea.vue和一个MessageShow.vue.
2. InputArea.vue
作为输入框，包含一个输入框，一个选择模型的下拉框，一个发送按钮。
处理逻辑，包括用户的输入，模型的选择，发送按钮的事件。
需要将用户的输入同步渲染到
3. MessageShow.vue
作为消息显示框.MessageShow.vue的内容又交由一个MarkdownRender.vue进行渲染，它支持大模型的输出内容的渲染。
4. MarkdownRender.vue
MarkdownRender.vue是一个组件，它的功能是：
渲染Markdown语法的文本。
渲染LaTeX语法的文本。
渲染代码块。 -->
重新设计 2025年4月5日13:52:59
直接一整个Chatwindow.vue。实现用户的输入和大模型的输出。

仅渲染部分交由MarkdownRender.vue处理该部分暂不实现。
同时，script的内容需要分离出来，命名为ChatWindow.js。
ChatWindow.js调用InputArea.js和MessageShow.js
InputArea.js负责用户的输入和发送按钮的事件。
MessageShow.js负责消息的显示。

css的内容也需要分离出来，命名为Chatwindow.css.
调用InputArea.css和MessageShow.css




按照下列步骤进行再重构。
1. 先搭好输入框和消息展示框，这个部分将和市面上的大模型一致。该步骤能够正确的将用户的输入展示在消息展示框中。

2. 该步骤将实现用户输入内容提交到大模型，并获取输出结果。

3. 该步骤将实现数据的存储和获取历史记录。