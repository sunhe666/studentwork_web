import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import ProjectSearch from './views/ProjectSearch.vue'
import ContentDetail from './views/ContentDetail.vue';
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import PersonalCenter from './views/PersonalCenter.vue';
import ThesisViewer from './views/ThesisViewer.vue'
import AnnouncementDetail from './views/AnnouncementDetail.vue';
import ThesisList from './views/ThesisList.vue';
import ThesisDetail from './views/ThesisDetail.vue'; // 导入论文详情组件
import FavoriteThesisList from './views/FavoriteThesisList.vue'; // 导入收藏列表组件
import AIAssistant from './views/AIAssistant.vue'; // 导入AI助手选择页面
import ThesisGuidanceChat from './views/ThesisGuidanceChat.vue'; // 导入论文指导聊天组件
import ThesisReduction from './views/ThesisReduction.vue'; // 导入论文降重组件
import JoinUs from './views/JoinUs.vue'; // 导入加入我们组件

const routes = [
  { path: '/', component: Home },
  { path: '/project-search', name: 'ProjectSearch', component: ProjectSearch },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/personal-center', name: 'PersonalCenter', component: PersonalCenter, meta: { requiresAuth: true } },
  { path: '/content-detail/:id', component: ContentDetail },
  { path: '/thesis-viewer/:filePath', name: 'ThesisViewer', component: ThesisViewer },
  { path: '/announcement/:id', component: AnnouncementDetail },
  { path: '/thesis-list', name: 'ThesisList', component: ThesisList },
  { path: '/thesis-detail/:id', name: 'ThesisDetail', component: ThesisDetail }, // 添加论文详情路由
  { path: '/favorites', name: 'FavoriteThesisList', component: FavoriteThesisList, meta: { requiresAuth: true } }, // 添加收藏列表路由
  { path: '/ai-assistant', name: 'AIAssistant', component: AIAssistant, meta: { requiresAuth: true } }, // AI助手选择页面
  { path: '/thesis-guidance-chat', name: 'ThesisGuidanceChat', component: ThesisGuidanceChat, meta: { requiresAuth: true } }, // 论文指导聊天页面
  { path: '/thesis-reduction', name: 'ThesisReduction', component: ThesisReduction, meta: { requiresAuth: true } }, // 论文降重页面
  { path: '/join-us', name: 'JoinUs', component: JoinUs } // 添加加入我们路由
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
// router.beforeEach((to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // 检查是否登录
//     const user = localStorage.getItem('user')
//     if (!user) {
//       // 未登录，重定向到登录页
//       next('/login')
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })

export default router