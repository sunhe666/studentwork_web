# 毕业设计项目 - 用户前端

基于Vue3 + Element Plus构建的毕业设计项目用户前端应用。

## 功能特性

- 用户注册与登录
- 论文浏览与搜索
- 论文详情查看
- PDF/Word文档在线预览
- 个人中心管理
- 收藏论文功能
- 公告浏览
- 加入我们页面
- 响应式设计

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Vite
- Axios
- PDF.js (PDF预览)
- docx-preview (Word文档预览)
- vue-pdf-embed (PDF嵌入)
- mitt (事件总线)

## 主要页面

- `Home` - 首页
- `Login/Register` - 登录注册
- `ThesisList` - 论文列表
- `ThesisDetail` - 论文详情
- `ThesisViewer` - 文档查看器
- `PersonalCenter` - 个人中心
- `ProjectSearch` - 项目搜索
- `JoinUs` - 加入我们

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── components/          # 公共组件
├── views/              # 页面组件
├── assets/             # 静态资源
├── router.js           # 路由配置
├── axios.js            # HTTP请求配置
└── zhuanye.json        # 专业数据配置
```

## 部署

本项目已配置Vercel部署，推送到GitHub后可直接在Vercel中导入部署。

## 环境要求

- Node.js >= 16
- npm >= 7