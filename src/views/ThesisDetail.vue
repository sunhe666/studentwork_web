<template>
  <div class="thesis-detail-container">
  <button class="back-button-top card-shadow" @click="goBack">
    <i class="icon-back"></i> 返回列表
  </button>
    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="thesis" class="thesis-content">
        <div class="thesis-header card-shadow">
          <h1 class="thesis-title">{{ thesis.title }}</h1>
          <div class="thesis-meta">
            <span class="meta-item"><i class="icon-author"></i> {{ thesis.publisher }}</span>
            <span class="meta-item"><i class="icon-time"></i> {{ formatDate(thesis.publish_time) }}</span>
            <span class="meta-item"><i class="icon-category"></i> {{ thesis.category_name }}</span>
          </div>
          <div class="thesis-stats">
            <div class="stat-item">
              <i class="icon-view"></i>
              <span class="stat-text">{{ thesis.views }}</span>
              <span class="stat-label">浏览</span>
            </div>
            <div class="stat-item interactive" @click="handleLike">
              <i :class="['icon-like', isLiked ? 'liked' : '']"></i>
              <span class="stat-text">{{ thesis.likes }}</span>
              <span class="stat-label">点赞</span>
            </div>
            <div class="stat-item interactive" @click="handleFavorite">
              <i :class="['icon-favorite', isFavorited ? 'favorited' : '']"></i>
              <span class="stat-text">{{ thesis.favorites }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>

        <div class="thesis-abstract">
          <h3>仅供参考，如有问题/答疑请联系作者<p>论文显示可能有点慢，让子弹再飞一会！</p></h3>
          <p>{{ thesis.abstract }}</p>
        </div>

        <!-- PDF预览区域 -->
        <div v-if="thesis.thesis_file" class="pdf-viewer-container">
          <h3>论文预览</h3>
          <div class="pdf-viewer">
            <VuePdfEmbed 
              :source="thesis.thesis_file"
              :page="currentPage"
              :scale="scale"
              @loaded="onPdfLoaded"
              @rendered="onPdfRendered"
              @error="onPdfError"
              @progress="onPdfProgress"
              class="pdf-embed"
            />
            <!-- PDF加载进度条 -->
            <div v-if="!pdfLoaded" class="pdf-loading-progress">
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: `${pdfLoadingProgress}%` }"></div>
              </div>
              <div class="progress-text">{{ pdfLoadingProgress > 0 ? `加载中... ${pdfLoadingProgress}%` : '准备加载PDF...' }}</div>
            </div>
          </div>
          <div class="pdf-controls" v-if="pdfLoaded">
            <button @click="currentPage > 1 ? currentPage-- : 1">上一页</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage < totalPages ? currentPage++ : totalPages">下一页</button>
            <button @click="scale += 0.1">放大</button>
            <button @click="scale > 0.2 ? scale -= 0.1 : 0.1">缩小</button>
          </div>
          <div v-if="!pdfLoaded" class="pdf-error-section">
            <p class="pdf-tip">{{ pdfErrorMessage || '提示：如果无法在线预览，请点击下方的下载按钮' }}</p>
            <div v-if="pdfErrorMessage" class="pdf-retry-buttons">
              <button @click="retryLoadPdf" class="retry-button">重新加载PDF</button>
              <button @click="downloadThesis" class="download-button">直接下载</button>
            </div>
          </div>
        </div>

        <div class="thesis-body" v-html="thesis.content"></div>

        <div class="thesis-references" v-if="thesis.references && thesis.references.length">
          <h3>参考文献</h3>
          <ul>
            <li v-for="(ref, index) in thesis.references" :key="index">{{ ref }}</li>
          </ul>
        </div>

        <div class="action-buttons">
          <button class="back-button" @click="goBack">返回列表</button>
          <button class="download-button" @click="downloadThesis" :disabled="!thesis.thesis_file">下载论文</button>
        </div>
      </div>
      <div v-else class="error">获取论文详情失败</div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '/src/components/Navbar.vue';
import axios from '../axios';
import { ElMessage } from 'element-plus';
import VuePdfEmbed from 'vue-pdf-embed';
import * as pdfjsLib from 'pdfjs-dist';

// 配置pdfjs-dist - 使用CDN路径或相对路径
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const route = useRoute();
const router = useRouter();
const thesis = ref(null);
const loading = ref(true);
const error = ref(false);
const pdfLoaded = ref(false);
const pdfErrorMessage = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const pdfInstance = ref(null);
const pdfLoadingProgress = ref(0); // 添加PDF加载进度变量
const progressTimer = ref(null); // 进度模拟定时器
const isLiked = ref(false);
const isFavorited = ref(false);

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// 确保URL使用HTTPS协议并通过代理访问阿里云OSS资源
const ensureHttps = (url) => {
  if (!url) return '';
  
  console.log('原始URL:', url);
  
  // 检查是否是代理路径
  if (url.startsWith('/api/proxy')) {
    // 根据当前环境选择基础URL
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://bishe.asia';
    const proxyUrl = baseUrl + url;
    console.log('代理路径URL:', proxyUrl);
    return proxyUrl;
  }
  
  // 检查是否是阿里云OSS路径
  if (url.includes('sunhe197428.oss-cn-beijing.aliyuncs.com')) {
    // 提取文件路径部分
    let filePath = '';
    try {
      const urlObj = new URL(url);
      filePath = urlObj.pathname; // 获取路径部分，如 /images/xxx.pdf
    } catch (e) {
      // 如果URL解析失败，尝试手动提取
      const pathMatch = url.match(/\/images\/.*$/);
      if (pathMatch) {
        filePath = pathMatch[0];
      } else {
        console.error('无法提取文件路径:', url);
        return url; // 返回原始URL作为备选
      }
    }
    
    // 构建代理URL
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://bishe.asia';
    const proxyUrl = `${baseUrl}/api/proxy${filePath}`;
    console.log('阿里云OSS转换后的代理URL:', proxyUrl);
    return proxyUrl;
  }
  
  // 其他路径只需转换HTTP为HTTPS
  const httpsUrl = url.replace(/^http:/, 'https:');
  console.log('转换为HTTPS的URL:', httpsUrl);
  return httpsUrl;
};

// 获取论文详情
const fetchThesisDetail = async () => {
  try {
    loading.value = true;
    const { id } = route.params;
    const res = await axios.get(`/thesis/${id}`);
    // 处理论文文件URL，确保使用HTTPS
    if (res.data && res.data.thesis_file) {
      res.data.thesis_file = ensureHttps(res.data.thesis_file);
      console.log('PDF文件URL:', res.data.thesis_file);
      // 验证URL是否有效
      try {
        const response = await fetch(res.data.thesis_file, { method: 'HEAD' });
        if (response.ok) {
          console.log('PDF文件可访问');
        } else {
          console.error('PDF文件不可访问，状态码:', response.status);
          ElMessage.warning('PDF文件可能无法访问，请尝试下载');
        }
      } catch (e) {
        console.error('验证PDF文件URL失败:', e);
      }
    }
    thesis.value = res.data;
    
    // 如果有PDF文件，启动进度模拟
    if (res.data && res.data.thesis_file) {
      console.log('开始模拟PDF加载进度');
      simulateProgress();
    }
    
    // 获取成功后更新阅读量
    updateViewCount(id);
    // 检查用户是否已登录
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;
    if (userId) {
      // 检查点赞和收藏状态
      await checkLikeStatus(id, userId);
      await checkFavoriteStatus(id, userId);
    }
  } catch (e) {
    console.error('获取论文详情失败:', e);
    ElMessage.error('获取论文详情失败，请重试');
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 检查点赞状态
const checkLikeStatus = async (thesisId, userId) => {
  try {
    const res = await axios.post(`/thesis/check-like/${thesisId}`, {
      user_id: userId
    });
    console.log(res)
    isLiked.value = res.isLiked;
  } catch (e) {
    console.error('检查点赞状态失败:', e);
  }
};

// 检查收藏状态
const checkFavoriteStatus = async (thesisId, userId) => {
  try {
    const res = await axios.post(`/thesis/check-favorite/${thesisId}`, {
      user_id: userId
    });
    isFavorited.value = res.isFavorited;
  } catch (e) {
    console.error('检查收藏状态失败:', e);
  }
};

// 处理点赞
const handleLike = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;
  if (!userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  const { id } = route.params;
  try {
    if (isLiked.value) {
      // 取消点赞
      await axios.put(`/thesis/unlike/${id}`, {
        user_id: userId
      });
      ElMessage.success('取消点赞成功');
      thesis.value.likes -= 1;
    } else {
      // 点赞
      await axios.put(`/thesis/like/${id}`, {
        user_id: userId
      });
      ElMessage.success('点赞成功');
      thesis.value.likes += 1;
    }
    isLiked.value = !isLiked.value;
  } catch (e) {
    console.error('点赞操作失败:', e);
    ElMessage.error('操作失败，请重试');
  }
};

// 处理收藏
const handleFavorite = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;
  if (!userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  const { id } = route.params;
  try {
    if (isFavorited.value) {
      // 取消收藏
      await axios.put(`/thesis/unfavorite/${id}`, {
        user_id: userId
      });
      ElMessage.success('取消收藏成功');
      thesis.value.favorites -= 1;
    } else {
      // 收藏
      await axios.put(`/thesis/favorite/${id}`, {
        user_id: userId
      });
      ElMessage.success('收藏成功');
      thesis.value.favorites += 1;
    }
    isFavorited.value = !isFavorited.value;
  } catch (e) {
    console.error('收藏操作失败:', e);
    ElMessage.error('操作失败，请重试');
  }
};

// 模拟PDF加载进度
const simulateProgress = () => {
  // 清除之前的定时器
  if (progressTimer.value) {
    clearInterval(progressTimer.value);
  }
  
  pdfLoadingProgress.value = 0;
  let progress = 0;
  
  progressTimer.value = setInterval(() => {
    if (progress < 90) {
      // 前90%比较快
      progress += Math.random() * 15 + 5;
    } else if (progress < 95) {
      // 90-95%慢一点
      progress += Math.random() * 3 + 1;
    } else {
      // 95%以后很慢，等待真实加载完成
      progress += Math.random() * 1;
    }
    
    pdfLoadingProgress.value = Math.min(Math.round(progress), 99);
    
    // 如果PDF已经加载完成，停止模拟
    if (pdfLoaded.value || progress >= 99) {
      clearInterval(progressTimer.value);
      progressTimer.value = null;
    }
  }, 200);
};

// PDF加载进度更新处理
const onPdfProgress = (progressData) => {
  console.log('PDF加载进度数据:', progressData);
  
  // 清除模拟进度定时器，使用真实进度
  if (progressTimer.value) {
    clearInterval(progressTimer.value);
    progressTimer.value = null;
  }
  
  if (progressData && typeof progressData === 'object') {
    const { loaded, total } = progressData;
    if (total > 0) {
      const progress = Math.round((loaded / total) * 100);
      pdfLoadingProgress.value = Math.min(progress, 99); // 最大99%，留1%给渲染完成
      console.log(`PDF真实加载进度: ${pdfLoadingProgress.value}% (${loaded}/${total})`);
    }
  } else if (typeof progressData === 'number') {
    // 如果直接传入数字进度
    pdfLoadingProgress.value = Math.min(Math.round(progressData), 99);
    console.log(`PDF加载进度: ${pdfLoadingProgress.value}%`);
  }
};

// PDF加载成功处理
const onPdfLoad = (instance) => {
  try {
    // 添加对instance是否为undefined的检查
    if (!instance) {
      throw new Error('PDF实例未定义');
    }
    
    pdfLoaded.value = true;
    pdfErrorMessage.value = '';
    
    // 检查instance是否有numPages属性
    if (instance.numPages !== undefined) {
      totalPages.value = instance.numPages;
      console.log('PDF加载成功，总页数:', totalPages.value);
    } else {
      console.warn('PDF实例没有numPages属性，可能是组件版本不兼容');
      // 尝试使用其他方式获取总页数
      if (instance.pdfDoc && instance.pdfDoc.numPages) {
        totalPages.value = instance.pdfDoc.numPages;
        console.log('通过pdfDoc获取总页数:', totalPages.value);
      }
    }
    
    pdfInstance.value = instance;
    console.log('PDF实例:', instance);
    
    // 尝试立即渲染第一页
    if (instance.renderPage) {
      instance.renderPage(1).then(() => {
        console.log('第一页渲染成功');
      }).catch(err => {
        console.error('渲染第一页失败:', err);
        ElMessage.error('PDF渲染失败，请重试');
      });
    } else if (instance.pdfDoc) {
      // 备选方案: 使用pdfDoc渲染第一页
      instance.pdfDoc.getPage(1).then(page => {
        console.log('通过pdfDoc获取第一页成功');
      }).catch(err => {
        console.error('通过pdfDoc获取第一页失败:', err);
      });
    }
  } catch (e) {
    console.error('PDF加载成功回调出错:', e);
    pdfLoaded.value = false;
    pdfErrorMessage.value = `PDF加载成功但处理时出错: ${e.toString()}`;
    ElMessage.error(pdfErrorMessage.value);
  }
};

// PDF加载完成处理 (获取实例)
const onPdfLoaded = (instance) => {
  try {
    if (!instance) {
      throw new Error('PDF实例未定义');
    }
    
    // 清除模拟进度定时器
    if (progressTimer.value) {
      clearInterval(progressTimer.value);
      progressTimer.value = null;
    }
    
    // 设置进度为100%
    pdfLoadingProgress.value = 100;
    console.log('PDF加载完成，进度设为100%');
    
    pdfInstance.value = instance;
    console.log('PDF加载完成，实例已保存:', instance);
    
    // 尝试获取总页数
    if (instance.numPages !== undefined) {
      totalPages.value = instance.numPages;
      console.log('PDF总页数:', totalPages.value);
    } else if (instance.pdfDoc && instance.pdfDoc.numPages) {
      totalPages.value = instance.pdfDoc.numPages;
      console.log('通过pdfDoc获取总页数:', totalPages.value);
    }
    
    // 延迟一点时间再隐藏进度条，让用户看到100%
    setTimeout(() => {
      pdfLoaded.value = true;
      pdfErrorMessage.value = '';
    }, 800);
    
  } catch (e) {
    console.error('PDF加载完成回调出错:', e);
    pdfLoaded.value = false;
    pdfLoadingProgress.value = 0;
    // 清除定时器
    if (progressTimer.value) {
      clearInterval(progressTimer.value);
      progressTimer.value = null;
    }
    pdfErrorMessage.value = `PDF加载失败: ${e.toString()}`;
    ElMessage.error(pdfErrorMessage.value);
  }
};

// PDF渲染完成处理
const onPdfRendered = () => {
  console.log('PDF渲染完成');
  // 可以在这里添加渲染完成后的逻辑
};

// PDF加载错误处理
const onPdfError = (event) => {
  pdfLoaded.value = false;
  console.error('PDF加载错误详情:', event);
  
  // 更友好的错误信息
  let errorMessage = 'PDF加载失败';
  if (event && typeof event === 'string') {
    if (event.includes('404')) {
      errorMessage = 'PDF文件不存在或已被移动';
    } else if (event.includes('403')) {
      errorMessage = 'PDF文件访问权限不足';
    } else if (event.includes('CORS')) {
      errorMessage = '正在尝试通过代理访问PDF文件...';
    } else if (event.includes('timeout')) {
      errorMessage = 'PDF文件加载超时，请稍后重试';
    } else {
      errorMessage = `PDF加载失败: ${event}`;
    }
  }
  
  pdfErrorMessage.value = errorMessage;
  
  // 如果是CORS错误，尝试自动重新加载使用代理URL
  if (event && event.toString().includes('CORS') && thesis.value && thesis.value.thesis_file) {
    console.log('检测到CORS错误，尝试重新加载PDF...');
    setTimeout(() => {
      const currentUrl = thesis.value.thesis_file;
      thesis.value.thesis_file = '';
      setTimeout(() => {
        thesis.value.thesis_file = ensureHttps(currentUrl);
        console.log('重新设置PDF URL:', thesis.value.thesis_file);
      }, 500);
    }, 1000);
  } else {
    ElMessage.error(errorMessage);
  }
};

// 重新加载PDF
const retryLoadPdf = () => {
  if (!thesis.value || !thesis.value.thesis_file) {
    ElMessage.warning('没有可重新加载的PDF文件');
    return;
  }
  
  console.log('用户手动重新加载PDF');
  pdfErrorMessage.value = '';
  pdfLoaded.value = false;
  pdfLoadingProgress.value = 0;
  
  // 强制重新加载PDF
  const originalUrl = thesis.value.thesis_file;
  thesis.value.thesis_file = '';
  
  setTimeout(() => {
    // 确保使用代理URL
    thesis.value.thesis_file = ensureHttps(originalUrl);
    console.log('重新加载PDF URL:', thesis.value.thesis_file);
    ElMessage.info('正在重新加载PDF，请稍候...');
  }, 300);
};

// 下载论文
const downloadThesis = () => {
  if (!thesis.value || !thesis.value.thesis_file) {
    ElMessage.warning('没有可下载的论文文件');
    return;
  }
  
  try {
    // 使用代理URL进行下载
    const downloadUrl = ensureHttps(thesis.value.thesis_file);
    console.log('下载PDF URL:', downloadUrl);
    
    // 创建一个临时链接来触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = thesis.value.thesis_file.split('/').pop() || 'thesis.pdf';
    link.target = '_blank'; // 在新标签页打开
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('开始下载论文文件');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

// 更新阅读量
const updateViewCount = async (id) => {
  try {
    await axios.put(`/thesis/view/${id}`);
    // 可以选择在这里更新本地的views计数
    if (thesis.value) {
      thesis.value.views = (thesis.value.views || 0) + 1;
    }
  } catch (e) {
    console.error('更新阅读量失败:', e);
    // 阅读量更新失败不提示用户，不影响主要功能
  }
};

// 返回列表
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  fetchThesisDetail();
});
</script>

<style scoped>
/* 论文标题区域样式美化 */
.thesis-header {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px 30px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.thesis-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.thesis-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 30px;
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  color: #409eff;
}

.thesis-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px dashed #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.stat-item i {
  font-size: 20px;
  color: #999;
}

.stat-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.stat-label {
  color: #999;
}

.stat-item.interactive {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item.interactive:hover {
  color: #409eff;
}

.stat-item.interactive:hover i {
  color: #409eff;
  transform: scale(1.1);
}

.stat-item.interactive:active {
  transform: translateY(1px);
}

.icon-like.liked {
  color: #f56c6c;
}

.icon-favorite.favorited {
  color: #e6a23c;
}

/* 返回按钮样式 */
.back-button-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.back-button-top i {
  font-size: 16px;
}

.back-button-top:hover {
  background-color: #337ecc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.back-button-top:active {
  transform: translateY(0);
}

.back-button-top .icon-back:before {
  content: '←';
  font-weight: bold;
}

.card-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.card-shadow:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .thesis-header {
    padding: 18px 20px;
    margin-bottom: 20px;
  }

  .thesis-title {
    font-size: 22px;
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .thesis-meta {
    gap: 12px 20px;
    margin-bottom: 18px;
    font-size: 13px;
  }

  .thesis-stats {
    gap: 16px;
    padding-top: 12px;
  }

  .stat-item {
    gap: 6px;
    font-size: 13px;
  }

  .stat-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .thesis-stats {
    flex-wrap: wrap;
  }

  .stat-item {
    margin-bottom: 8px;
  }
}

.thesis-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.error {
  color: #e74c3c;
}

.thesis-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.thesis-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.thesis-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #999;
  font-size: 14px;
  margin-bottom: 15px;
}

.thesis-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-view, .icon-like, .icon-favorite {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-view {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
}

.icon-like {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M12 20.85l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.04L12 20.85z"></path></svg>');
}

.icon-favorite {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>');
}

.thesis-abstract {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.thesis-abstract h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.thesis-abstract p {
  color: #666;
  line-height: 1.6;
}

.thesis-body {
  margin-bottom: 30px;
  line-height: 1.8;
  color: #333;
}

.thesis-body h2 {
  font-size: 20px;
  margin: 25px 0 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #42b983;
}

.thesis-body h3 {
  font-size: 18px;
  margin: 20px 0 10px;
  color: #333;
}

.thesis-body p {
  margin-bottom: 15px;
}

.thesis-body ul, .thesis-body ol {
  margin-bottom: 15px;
  padding-left: 25px;
}

.thesis-references {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.thesis-references h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.thesis-references ul {
  padding-left: 20px;
}

.thesis-references li {
  margin-bottom: 8px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.back-button, .download-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-button {
  background-color: #f0f0f0;
  color: #666;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.download-button {
  background-color: #42b983;
  color: white;
}

.download-button:hover:not(:disabled) {
  background-color: #359469;
}

.download-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .thesis-detail-container {
   
  }

  .main-content {
    padding: 15px;
  }

  .thesis-title {
    font-size: 20px;
  }

  .thesis-meta, .thesis-stats {
    flex-direction: column;
    gap: 5px;
  }
}

/* PDF预览区域样式 */
.pdf-viewer-container {
  margin: 30px 0;
}

.pdf-viewer-container h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.pdf-viewer {
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: auto;
  /* 设置PDF预览区域的高度为屏幕高度的70% */
  height: 70vh;
  /* 最小高度设置 */
  min-height: 500px;
  position: relative;
}

/* PDF加载进度条样式 */
.pdf-loading-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 500px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.progress-container {
  height: 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #52c993);
  transition: width 0.3s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.pdf-embed {
  /* 确保PDF填充整个容器 */
  width: 100%;
  height: 100%;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.pdf-controls button {
  padding: 5px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pdf-controls button:hover {
  background-color: #3aa876;
}

.pdf-controls span {
  line-height: 30px;
  color: #666;
}

.pdf-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 15px;
}

.pdf-error-section {
  text-align: center;
  padding: 20px;
}

.pdf-retry-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}

.retry-button {
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #337ecc;
}

.pdf-retry-buttons .download-button {
  padding: 8px 20px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.pdf-retry-buttons .download-button:hover {
  background-color: #529b2e;
}

.thesis-stats .stat-item {
  cursor: pointer;
  transition: color 0.3s;
}

.thesis-stats .stat-item:hover {
  color: #42b983;
}

.icon-like.liked {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c" stroke="%23e74c3c" stroke-width="2"><path d="M12 20.85l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.04L12 20.85z"></path></svg>');
}

.icon-favorite.favorited {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c" stroke="%23e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>');
}
</style>