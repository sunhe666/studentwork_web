import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ProjectSearch from './views/ProjectSearch.vue'
import ContentDetail from './views/ContentDetail.vue';
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import PersonalCenter from './views/PersonalCenter.vue';
import ThesisViewer from './views/ThesisViewer.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/project-search', name: 'ProjectSearch', component: ProjectSearch },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/personal-center',
    name: 'PersonalCenter',
    component: PersonalCenter,
    meta: { requiresAuth: true }
  },
  { path: '/content-detail/:id', component: ContentDetail },
  { path: '/thesis-viewer/:filePath', name: 'ThesisViewer', component: ThesisViewer }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否登录
    const user = localStorage.getItem('user')
    if (!user) {
      // 未登录，重定向到登录页
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router