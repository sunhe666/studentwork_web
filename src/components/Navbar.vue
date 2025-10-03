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
        <router-link to="/favorites" class="personal-link">我的收藏</router-link>
     <span class="divider">|</span>
        <span class="personal-link" @click="handleMajorClick">
         {{ selectedMajor ? selectedMajor.name : '选择专业' }}
<span v-if="selectedMajor" style="color:red;font-size:12px">点击切换</span>
        </span>
        <!-- 专业选择弹窗 -->
        <div v-if="showMajorModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">选择/切换专业</h3>
              <button class="close-btn" @click="showMajorModal = false">×</button>
            </div>
            <div class="major-list">
              <div v-for="category in categories" :key="category.id" class="major-item" @click="selectCategory(category)">
                {{ category.name }}
              </div>
              <div v-if="!categories.length && !loading" class="no-data">暂无专业数据</div>
              <div v-if="loading" class="loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!-- logo与主导航 -->
    <nav class="main-nav">
      <div class="logo">
        <img src="@/assets/image.png" alt="logo" class="logo-img" />
        <span class="site-title">毕设集</span>
      </div>
      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span class="menu-icon"></span>
      </button>
      <!-- 导航列表 -->
      <ul class="nav-list" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link to="/" class="nav-link">
          <li class="nav-item">
            <img :src="$route.path === '/' ? shouye2 : shouye" alt="首页" class="nav-icon">
            <span>首页</span>
          </li>
        </router-link>
        <router-link to="/project-search" class="nav-link">
          <li class="nav-item">
            <img :src="$route.path === '/project-search' ? fenlei2 : fenlei" alt="毕设分类" class="nav-icon">
            <span>毕设分类</span>
          </li>
        </router-link>
        <router-link to="/ai-assistant" class="nav-link">
          <li class="nav-item">
            <img :src="$route.path.startsWith('/ai-assistant') || $route.path.startsWith('/thesis-guidance-chat') || $route.path.startsWith('/thesis-reduction') ? wuguan2 : wuguan" alt="Ai助手" class="nav-icon">
            <span>Ai助手</span>
          </li>
        </router-link>
        <router-link to="/thesis-list" class="nav-link">
          <li class="nav-item">
            <img :src="$route.path === '/thesis-list' ? baozhenfenlei2 : baozhenfenlei" alt="论文资料" class="nav-icon">
            <span>论文资料</span>
          </li>
        </router-link>
        <router-link to="/join-us" class="nav-link">
          <li class="nav-item">
            <img :src="$route.path === '/join-us' ? jiaruwomen2 : jiaruwomen" alt="加入我们" class="nav-icon">
            <span>加入我们</span>
          </li>
        </router-link>
       <!--  <li @click="showNotDeveloped">AI毕设管家</li> -->
      </ul>
    </nav>
  </div>
</template>

<script setup>
import shouye2 from '@/assets/shouye-2.png';
import shouye from '@/assets/shouye.png';
import fenlei2 from '@/assets/fenlei-2.png';
import fenlei from '@/assets/fenlei.png';
import wuguan2 from '@/assets/wuguan-2.png';
import wuguan from '@/assets/wuguan.png';
import baozhenfenlei2 from '@/assets/baozhenfenlei-2.png';
import baozhenfenlei from '@/assets/baozhenfenlei.png';
import jiaruwomen2 from '@/assets/jiaruwomen-2.png';
import jiaruwomen from '@/assets/jiaruwomen.png';

import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '/src/axios.js';

const userInfo = ref(null);
const router = useRouter();
const mobileMenuOpen = ref(false); // 移动端菜单状态
// 专业选择相关状态
const selectedMajor = ref(null);
const { appContext } = getCurrentInstance();
const emitter = appContext.config.globalProperties.emitter;
const showMajorModal = ref(false);
const categories = ref([]);
const loading = ref(false);

onMounted(() => {
  // 从localStorage加载已选择的专业
  const storedMajor = localStorage.getItem('selectedMajor');
  if (storedMajor) {
    try {
      selectedMajor.value = JSON.parse(storedMajor);
    } catch (e) {
      console.error('Failed to parse selectedMajor from localStorage', e);
      showMajorModal.value = true;
    }
  } else {
    showMajorModal.value = true;
  }

  // 预加载专业分类数据
  fetchCategories();

 // 检查本地存储中的用户信息
    const storedUser = localStorage.getItem('user');
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser);
  }
  // 监听窗口大小变化，关闭移动菜单
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenuOpen.value = false;
    }
  });
});

const handleLogout = () => {
  localStorage.removeItem('userInfo');
  userInfo.value = null;
  router.push('/login');
};

// 获取专业分类
const fetchCategories = () => {
  loading.value = true;
  axios.get('/category/list')
    .then(res => {
      categories.value = res || [];
    })
    .catch(err => {
      console.error('获取专业分类失败:', err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// 处理专业点击事件 - 始终显示弹窗以支持切换
  const handleMajorClick = () => {
      showMajorModal.value = true;
    };

// 选择专业
const selectCategory = (category) => {
    selectedMajor.value = category;
    localStorage.setItem('selectedMajor', JSON.stringify(category));
    showMajorModal.value = false;
    
    // 发射专业切换事件
    console.log('Navbar: 发射专业切换事件:', category.name);
    if (emitter) {
      emitter.emit('select-category', category.name);
    } else {
      console.warn('Navbar: emitter 不可用');
    }
    
    // 显示切换成功提示
    ElMessage.success(`已切换到 ${category.name} 专业`);
  };

const showNotDeveloped = () => {
  ElMessage.info('当前模块未开发');
};

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
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
  color: #666;
  text-decoration: none;
}

.auth-link:hover, .personal-link:hover {
  color: #42b983;
}

.logout-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.logout-button:hover {
  color: #42b983;
}

.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
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

.nav-link {
  text-decoration: none;
  color: #666;
}

.nav-link li, .nav-list li {
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-link li:hover, .nav-list li:hover {
  color: #42b983;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.menu-icon {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #333;
  position: relative;
}

.menu-icon::before, .menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: #333;
  left: 0;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  top: 8px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .header {
    padding: 8px 15px;
    font-size: 12px;
  }
  
  .header-left, .header-right {
    gap: 10px;
  }
  
  .main-nav {
    padding: 10px 15px;
  }
  
  .logo img {
    width: 32px;
    height: 32px;
  }
  
  .site-title {
    font-size: 16px;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .nav-list {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: white;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
    padding: 0;
    gap: 0;
    max-height: none;
    overflow: visible;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .nav-link {
    padding: 0 10px;
    height: 60px;
  }
  
  .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 5px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  transition: opacity 0.3s ease;
  /* 确保在所有设备上都显示 */
  visibility: visible !important;
  opacity: 1 !important;
}

.modal-overlay-enter-from, .modal-overlay-leave-to {
  opacity: 0;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  /* 确保在所有设备上都显示 */
  transform: none !important;
  opacity: 1 !important;
}

.modal-content-enter-from, .modal-content-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  color: #2c3e50;
  font-size: 22px;
  margin: 0;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s, transform 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #ff4d4f;
  background-color: #f5f5f5;
  transform: rotate(90deg);
}

.close-btn:hover {
  color: #ff4d4f;
}

.major-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.major-list::-webkit-scrollbar {
  width: 6px;
}

.major-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.major-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.major-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.major-item {
  padding: 14px 10px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  background-color: #fafafa;
}

.major-item:hover {
  border-color: #42b983;
  background-color: #f0f9f4;
  color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.15);
}

.major-item.selected {
  background-color: #f0f9f4;
  border-color: #42b983;
  color: #42b983;
  font-weight: 500;
}

.major-item:hover {
  border-color: #42b983;
  background-color: #f5fcf8;
  color: #42b983;
}

.loading, .no-data {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

.loading {
  position: relative;
}

.loading::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-content {
    width: 85%;
    padding: 20px;
  }

  .major-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .modal-title {
    font-size: 16px;
  }
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 3px;
  transition: transform 0.2s;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

}

@media (max-width: 768px) {
  .nav-link {
    padding: 0 8px;
  }
  .nav-icon {
    display: block;
  }
}

@media (min-width: 769px) {
  .nav-icon {
    display: none !important;
  }
  .nav-item {
    flex-direction: row;
  }
}



@media (max-width: 768px) {
    .nav-link {
      padding: 0 8px;
    }
    .nav-icon {
      display: block;
    }
  }

  @media (min-width: 769px) {
    .nav-icon {
      display: none !important;
    }
    .nav-item {
      flex-direction: row;
    }
  }

  @media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding: 8px 10px;
  }
  
  .header-right {
    margin-top: 5px;
  }
  
  .main-nav {
    padding: 8px 10px;
  }
  
  .logo img {
    width: 28px;
    height: 28px;
  }
  
  .site-title {
    font-size: 14px;
  }
  
  .nav-link li, .nav-list li {
    font-size: 13px;
  }
}
</style>