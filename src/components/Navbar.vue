<template>
  <div class="navbar-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <template v-if="userInfo">
          <span class="user-greeting">Hi, {{ userInfo.username }}</span>
          <span class="divider">|</span>
          <button @click="handleLogout" class="logout-button">退出登录</button>
        </template>
        <template v-else>
          <router-link to="/login" class="auth-link">Hi, 请登录</router-link>
          <span class="divider">|</span>
          <router-link to="/register" class="auth-link">我要注册</router-link>
        </template>
      </div>
      <div class="header-right">
        <router-link to="/personal-center" class="personal-link">个人中心</router-link>
        <span class="divider">|</span>
        <span>找回密码</span>
      </div>
    </header>
    <!-- logo与主导航 -->
    <nav class="main-nav">
      <div class="logo">
        <img src="/src/assets/logo.svg" alt="logo" />
        <span class="site-title">孙猴子源码</span>
      </div>
      <ul class="nav-list">
        <router-link to="/" class="nav-link"><li>首页</li></router-link>
        <li>必读指南</li>
        <li><router-link to="/project-search">毕业设计</router-link></li>
        <li>更多项目</li>
        <li>技术疑难</li>
        <li>AI毕设管家</li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '/src/axios.js';

const userInfo = ref(null);
const router = useRouter();

onMounted(() => {
  // 检查本地存储中的用户信息
  const storedUser = localStorage.getItem('user');
  console.log(storedUser);
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser);
  }
});

const handleLogout = () => {
  localStorage.removeItem('userInfo');
  userInfo.value = null;
  router.push('/login');
};
</script>

<style scoped>
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  
  background-color: white;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f5f5f5;
  font-size: 14px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.divider {
  color: #ccc;
}

.auth-link, .personal-link {
  color: #333;
  text-decoration: none;
}

.auth-link:hover, .personal-link:hover {
  color: #409eff;
}

.logout-button {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
}

.logout-button:hover {
  color: #409eff;
}

.main-nav {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 40px;
}

.logo img {
  width: 40px;
  height: 40px;
}

.site-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.nav-list li {
  cursor: pointer;
  color: #333;
  font-size: 16px;
}

.nav-list li:hover {
  color: #409eff;
}

.nav-list a {
  color: inherit;
  text-decoration: none;
}
</style>