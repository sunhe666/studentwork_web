<template>
  <div class="favorite-thesis-list">
    <Navbar />
    <main class="main-content">
      <h1 class="page-title">我的收藏</h1>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">获取收藏列表失败</div>
      <div v-else-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon"></div>
        <p class="empty-text">暂无收藏论文</p>
        <router-link to="/thesis-list" class="back-button">去浏览论文</router-link>
      </div>
      <div v-else class="thesis-grid">
        <div v-for="thesis in favorites" :key="thesis.id" class="thesis-card">
          <div class="thesis-title">{{ thesis.title }}</div>
          <div class="thesis-meta">
            <span>作者: {{ thesis.publisher }}</span>
            <span>发表时间: {{ formatDate(thesis.publish_time) }}</span>
          </div>
          <div class="thesis-stats">
            <span><i class="icon-view"></i> {{ thesis.views }} 浏览</span>
            <span><i class="icon-like"></i> {{ thesis.likes }} 点赞</span>
            <span><i class="icon-favorite favorited"></i> {{ thesis.favorites }} 收藏</span>
          </div>
          <div class="thesis-category">{{ thesis.category_name }}</div>
          <div class="action-buttons">
            <router-link :to="{ name: 'ThesisDetail', params: { id: thesis.id } }" class="view-button">查看详情</router-link>
            <button @click="handleUnfavorite(thesis.id)" class="unfavorite-button">取消收藏</button>
          </div>
        </div>
      </div>
      <div v-if="total > pageSize" class="pagination">
        <button @click="currentPage > 1 ? currentPage-- : 1" :disabled="currentPage === 1">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="currentPage < totalPages ? currentPage++ : totalPages" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '/src/components/Navbar.vue';
import { ElMessage } from 'element-plus';
import axios from '/src/axios.js';

const router = useRouter();
const favorites = ref([]);
const loading = ref(true);
const error = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = ref(0);

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    loading.value = true;
    error.value = false;
    // 获取用户ID
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }
    const userId = user.id;
    const res = await axios.get(`/thesis/favorites/${userId}`, {
      params: {
        page: currentPage.value,
        limit: pageSize.value
      }
    });
    favorites.value = res.list || [];
    total.value = res.total || 0;
    totalPages.value = Math.ceil(total.value / pageSize.value);
  } catch (e) {
    console.error('获取收藏列表失败:', e);
    error.value = true;
    ElMessage.error('获取收藏列表失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 取消收藏
const handleUnfavorite = async (thesisId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }
    const userId = user.id;
    await axios.put(`/thesis/unfavorite/${thesisId}`, {
      user_id: userId
    });
    ElMessage.success('取消收藏成功');
    // 重新获取收藏列表
    await fetchFavorites();
  } catch (e) {
    console.error('取消收藏失败:', e);
    ElMessage.error('取消收藏失败，请重试');
  }
};



onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorite-thesis-list {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top:50px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.error {
  color: #e74c3c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.back-button {
  padding: 8px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #359469;
}

.thesis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.thesis-card {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
  transition: transform 0.3s, box-shadow 0.3s;
}

.thesis-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.thesis-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.thesis-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.thesis-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.thesis-category {
  display: inline-block;
  padding: 3px 8px;
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  border-radius: 3px;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.view-button, .unfavorite-button {
  flex: 1;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  text-align: center;
  text-decoration: none;
}

.view-button {
  background-color: #42b983;
  color: white;
}

.view-button:hover {
  background-color: #359469;
}

.unfavorite-button {
  background-color: #f0f0f0;
  color: #666;
}

.unfavorite-button:hover {
  background-color: #e0e0e0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #666;
}

/* 图标样式 */
.icon-view, .icon-like, .icon-favorite {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 3px;
  vertical-align: middle;
}

.icon-view {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
}

.icon-like {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M12 20.85l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.04L12 20.85z"></path></svg>');
}

.icon-favorite.favorited {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c" stroke="%23e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>');
}

@media (max-width: 768px) {
  .favorite-thesis-list {
    padding-top: 100px;
  }

  .main-content {
    padding: 15px;
  }

  .thesis-grid {
    grid-template-columns: 1fr;
  }
}
</style>