<template>
  <div class="announcement-detail-container">
    <Navbar />
    <div class="announcement-detail">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="announcement" class="announcement-content">
        <h1 class="title">{{ announcement.title }}</h1>
        <div class="meta">
          <span class="time">{{ formatDate(announcement.create_time) }}</span>
          <span class="author">发布人: {{ announcement.author || '管理员' }}</span>
        </div>
        <div class="content" v-html="announcement.content"></div>
        <div class="back-link" @click="goBack">返回列表</div>
      </div>
      <div v-else class="error">获取公告详情失败</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import axios from '../axios'
import Navbar from '/src/components/Navbar.vue';

const route = useRoute()
const router = useRouter()
const announcement = ref(null)
const loading = ref(true)
const error = ref(false)

const fetchAnnouncementDetail = async () => {
  try {
    loading.value = true
    const { id } = route.params
    const res = await axios.get(`/announcement/${id}`)
    announcement.value = res.data
  } catch (e) {
    console.error('获取公告详情失败:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

const formatDate = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchAnnouncementDetail()
})
</script>

<style scoped>
.announcement-detail-container {
  padding-top: 150px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.announcement-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.loading {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.error {
  text-align: center;
  padding: 50px 0;
  color: #e74c3c;
}

.announcement-content {
  line-height: 1.6;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.content {
  margin-bottom: 30px;
}

.content p {
  margin-bottom: 15px;
}

/* 使用深度选择器确保样式能应用到v-html中的内容 */
.content :deep(h2) {
  font-size: 20px !important;
  color: #333 !important;
  margin: 25px 0 15px !important;
  padding-bottom: 10px !important;
  border-bottom: 2px solid #42b983 !important;
}

.back-link {
  display: inline-block;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #359469;
}

@media (max-width: 768px) {
  .announcement-detail-container {
    padding-top: 130px;
  }

  .announcement-detail {
    padding: 20px;
  }

  .title {
    font-size: 20px;
  }
}
</style>