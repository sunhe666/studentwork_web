<template>

  <div class="thesis-viewer-container">
    <div class="viewer-header">
      <h2>论文浏览</h2>
      <router-link to="/" class="back-btn">返回列表</router-link>
    </div>
    <div ref="docxContainer" class="thesis-content protected-content"></div>
    <div v-if="loading" class="loading-spinner">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import Navbar from '/src/components/Navbar.vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { renderAsync } from 'docx-preview';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const docxContainer = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // 检查用户登录状态
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      ElMessage.warning('请先登录后再浏览论文');
      router.push('/login');
      return;
    }
    // 获取文件路径参数
    const filePath = route.params.filePath;
    if (!filePath) {
      throw new Error('未找到论文文件路径');
    }

    // 加载并转换docx文件
    // 使用代理服务器解决CORS问题
    const proxyFilePath = filePath.replace('http://sunhe197428.oss-cn-beijing.aliyuncs.com', '/api/proxy');
    const response = await fetch(proxyFilePath);
    if (!response.ok) {
      throw new Error('无法加载论文文件');
    }
    const blob = await response.blob();
    await renderAsync(blob, docxContainer.value, null, { className: 'docx-content' });
  } catch (err) {
    error.value = err.message || '加载论文时发生错误';
  } finally {
    loading.value = false;
  }
});

// 禁止右键菜单
document.addEventListener('contextmenu', (e) => e.preventDefault());
// 禁止复制操作
document.addEventListener('copy', (e) => e.preventDefault());
// 禁止剪切操作
document.addEventListener('cut', (e) => e.preventDefault());
// 禁止选择文本
document.addEventListener('selectstart', (e) => e.preventDefault());
</script>

<style scoped>
.thesis-viewer-container {
  margin-top: 110px;

  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #359469;
}

.thesis-content {
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 600px;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #ff4444;
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

/* 保护内容样式 */
.protected-content {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  pointer-events: none !important;
}

/* 防止打印 */
@media print {
  body * {
    visibility: hidden;
  }
  .thesis-viewer-container, .thesis-viewer-container * {
    visibility: hidden;
  }
}
</style>