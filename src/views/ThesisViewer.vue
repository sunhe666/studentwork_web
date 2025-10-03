<template>
  <div class="thesis-viewer-container">
    <div class="viewer-header">
      <h2>论文浏览<p style="font-size:12px;color:red">推荐使用电脑端浏览，体验更佳</p></h2>
      <router-link to="/" class="back-btn">返回列表</router-link>
    </div>
    
    <!-- PDF预览区域 -->
    <div class="pdf-viewer-container">
      <div class="pdf-viewer">
        <VuePdfEmbed 
          v-if="pdfUrl"
          :source="pdfUrl"
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
      <div v-if="!pdfLoaded && error" class="pdf-error-section">
        <p class="pdf-tip">{{ error || '提示：如果无法在线预览，请联系管理员' }}</p>
        <div class="pdf-retry-buttons">
          <button @click="retryLoadPdf" class="retry-button">重新加载PDF</button>
          <button @click="downloadPdf" class="download-button">直接下载</button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-spinner">加载中...</div>
  </div>
</template>

<script setup>
import Navbar from '/src/components/Navbar.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import VuePdfEmbed from 'vue-pdf-embed';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios'; // 使用原生axios，避免响应拦截器影响blob响应

// 配置pdfjs-dist - 使用CDN路径或相对路径
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const pdfUrl = ref('');
const pdfLoaded = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const pdfInstance = ref(null);
const pdfLoadingProgress = ref(0);
const progressTimer = ref(null);

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

// 初始化PDF文件
const initializePdf = () => {
  try {
    loading.value = true;
    error.value = null;

    const filePath = route.params.filePath;
    if (!filePath) {
      throw new Error('未找到论文文件路径');
    }

    // 处理PDF文件URL，确保使用HTTPS和代理
    const processedUrl = ensureHttps(filePath);
    console.log('PDF文件URL:', processedUrl);
    
    pdfUrl.value = processedUrl;
    
    // 启动进度模拟
    simulateProgress();
    
  } catch (err) {
    console.error('初始化PDF失败:', err);
    error.value = err.message || '初始化PDF时发生错误';
    loading.value = false;
  }
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

// PDF加载完成处理
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
      loading.value = false;
      error.value = null;
    }, 800);
    
  } catch (e) {
    console.error('PDF加载完成回调出错:', e);
    pdfLoaded.value = false;
    pdfLoadingProgress.value = 0;
    loading.value = false;
    // 清除定时器
    if (progressTimer.value) {
      clearInterval(progressTimer.value);
      progressTimer.value = null;
    }
    error.value = `PDF加载失败: ${e.toString()}`;
    ElMessage.error(error.value);
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
  loading.value = false;
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
  
  error.value = errorMessage;
  ElMessage.error(errorMessage);
};

// 重新加载PDF
const retryLoadPdf = () => {
  if (!pdfUrl.value) {
    ElMessage.warning('没有可重新加载的PDF文件');
    return;
  }
  
  console.log('用户手动重新加载PDF');
  error.value = null;
  pdfLoaded.value = false;
  pdfLoadingProgress.value = 0;
  loading.value = true;
  
  // 强制重新加载PDF
  const originalUrl = pdfUrl.value;
  pdfUrl.value = '';
  
  setTimeout(() => {
    // 确保使用代理URL
    pdfUrl.value = ensureHttps(originalUrl);
    console.log('重新加载PDF URL:', pdfUrl.value);
    simulateProgress();
    ElMessage.info('正在重新加载PDF，请稍候...');
  }, 300);
};

// 下载PDF
const downloadPdf = () => {
  if (!pdfUrl.value) {
    ElMessage.warning('没有可下载的PDF文件');
    return;
  }
  
  try {
    console.log('下载PDF URL:', pdfUrl.value);
    
    // 创建一个临时链接来触发下载
    const link = document.createElement('a');
    link.href = pdfUrl.value;
    link.download = 'thesis.pdf';
    link.target = '_blank'; // 在新标签页打开
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('开始下载PDF文件');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

onMounted(async () => {
  try {
    // 检查用户登录状态
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      ElMessage.warning('请先登录后再浏览论文');
      router.push('/login');
      return;
    }

    // 初始化PDF
    initializePdf();
  } catch (err) {
    error.value = err.message || '加载论文时发生错误';
    loading.value = false;
  }
});

onUnmounted(() => {
  // 清除定时器
  if (progressTimer.value) {
    clearInterval(progressTimer.value);
    progressTimer.value = null;
  }
});

// 禁止右键菜单
// document.addEventListener('contextmenu', (e) => e.preventDefault());
// 禁止复制操作
// document.addEventListener('copy', (e) => e.preventDefault());
// 禁止剪切操作
// document.addEventListener('cut', (e) => e.preventDefault());
// 禁止选择文本
// document.addEventListener('selectstart', (e) => e.preventDefault());
</script>

<style scoped>
.thesis-viewer-container {
  margin-top: 110px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
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

/* PDF预览区域样式 */
.pdf-viewer-container {
  margin: 30px 0;
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

/* 响应式样式 */
@media (max-width: 768px) {
  .thesis-viewer-container {
    margin-top: 80px;
    padding: 15px;
  }
  
  .viewer-header {
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .pdf-viewer {
    height: 60vh;
    min-height: 400px;
  }
}

@media (max-width: 480px) {
  .thesis-viewer-container {
    margin-top: 60px;
    padding: 10px;
  }
  
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  h2 {
    font-size: 1.2rem;
  }
  
  .back-btn {
    padding: 5px 10px;
    font-size: 0.85rem;
    width: 100%;
    text-align: center;
  }
  
  .pdf-viewer {
    height: 50vh;
    min-height: 300px;
  }
  
  .pdf-controls {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pdf-controls button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

/* 响应式样式 */
@media (min-width: 1200px) {
  .thesis-viewer-container {
    max-width: 1000px;
  }
}

@media (max-width: 480px) {
  .loading-spinner {
    padding: 30px 10px;
    font-size: 16px;
  }
}
</style>