<template>

  <div class="thesis-viewer-container">
    <div class="viewer-header">
      <h2>论文浏览<p style="font-size:12px;color:red">推荐使用电脑端浏览，体验更佳</p></h2>
      <router-link to="/" class="back-btn">返回列表</router-link>
    </div>
    <div ref="docxContainer" class="thesis-content protected-content"></div>
    <div v-if="loading" class="loading-spinner">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import Navbar from '/src/components/Navbar.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { renderAsync } from 'docx-preview';
import { ElMessage } from 'element-plus';
import axios from 'axios'; // 使用原生axios，避免响应拦截器影响blob响应

const route = useRoute();
const router = useRouter();
const docxContainer = ref(null);
const loading = ref(true);
const error = ref(null);
const renderOptions = ref({
  className: 'docx-content',
  inWrapper: true,
  ignoreWidth: window.innerWidth < 768,
  ignoreHeight: false,
  pageNumber: false,
  scale: window.innerWidth < 480 ? 0.9 : 1,
  wrap: window.innerWidth < 480
});

// 处理屏幕尺寸变化
const handleResize = () => {
  const newWidth = window.innerWidth;
  const newOptions = {
    ...renderOptions.value,
    ignoreWidth: newWidth < 768,
    scale: newWidth < 480 ? 0.9 : 1,
    wrap: newWidth < 480
  };

  // 只有当选项发生变化时才更新
  if (JSON.stringify(newOptions) !== JSON.stringify(renderOptions.value)) {
    renderOptions.value = newOptions;
    // 重新渲染文档
    if (docxContainer.value && !loading.value && !error.value) {
      loadAndRenderDocument();
    }
  }
};

// 提取加载和渲染文档的逻辑为单独函数
const loadAndRenderDocument = async () => {
  try {
    loading.value = true;
    error.value = null;

    const filePath = route.params.filePath;
    if (!filePath) {
      throw new Error('未找到论文文件路径');
    }

    let requestUrl = filePath;

    // 在所有环境中将HTTP协议替换为HTTPS
    requestUrl = requestUrl.replace(/^http:/, 'https:');

    // 在所有环境中都使用后端代理来避免CORS问题
    if (requestUrl.includes('sunhe197428.oss-cn-beijing.aliyuncs.com')) {
      // 使用后端代理接口
      const encodedUrl = encodeURIComponent(requestUrl);
      requestUrl = `/api/proxy?url=${encodedUrl}`;
    }
    
    console.log('请求URL:', requestUrl);

    // 获取token用于认证
    const token = localStorage.getItem('token');
    
    // 使用原生axios，包含完整配置
    const response = await axios({
      method: 'GET',
      url: requestUrl,
      baseURL: 'https://bishe.asia', // 使用完整的API地址
      responseType: 'blob',
      timeout: 30000, // 30秒超时
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*',
        ...(token && { 'Authorization': `Bearer ${token}` }) // 添加认证token
      }
    });

    // 检查响应是否成功
    if (!response || !response.data) {
      throw new Error('服务器返回了空的响应，请稍后重试');
    }

    const blob = response.data;
    
    // 验证blob是否为有效的docx文件
    if (!blob || typeof blob.size === 'undefined') {
      throw new Error('服务器返回的文件数据无效');
    }
    
    if (blob.size === 0) {
      throw new Error('文件内容为空，请检查文件是否存在');
    }

    // 检查文件类型
    if (blob.type && !blob.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') && 
        !blob.type.includes('application/octet-stream')) {
      console.warn('文件类型可能不正确:', blob.type);
    }

    // 清空容器并重新渲染
    if (docxContainer.value) {
      docxContainer.value.innerHTML = '';
      
      // 添加更详细的渲染选项
      const extendedOptions = {
        ...renderOptions.value,
        debug: false,
        experimental: true,
        trimXmlDeclaration: true,
        useBase64URL: false,
        useMathMLPolyfill: true,
        showChanges: false,
        renderChanges: false,
        renderFootnotes: true,
        renderEndnotes: true,
        renderHeaders: true,
        renderFooters: true
      };

      try {
        await renderAsync(blob, docxContainer.value, null, extendedOptions);
      } catch (renderError) {
        console.error('docx-preview渲染失败:', renderError);
        
        // 如果是zip相关错误，尝试备用方案
        if (renderError.message.includes('zip') || renderError.message.includes('central directory')) {
          throw new Error('文件格式不支持或已损坏。支持的格式：.docx文件');
        } else {
          // 其他渲染错误，显示通用错误信息
          docxContainer.value.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
              <h3>文档渲染失败</h3>
              <p>无法显示此文档，可能的原因：</p>
              <ul style="text-align: left; display: inline-block;">
                <li>文件格式不受支持</li>
                <li>文件已损坏</li>
                <li>网络连接问题</li>
              </ul>
              <p>请尝试刷新页面或联系管理员。</p>
              <button onclick="location.reload()" style="
                padding: 8px 16px; 
                background-color: #42b983; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                margin-top: 10px;
              ">刷新页面</button>
            </div>
          `;
          throw renderError;
        }
      }
    } else {
      throw new Error('文档容器未找到');
    }
  } catch (err) {
    console.error('加载文档时出错:', err);
    
    // 提供更具体的错误信息
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      error.value = '文件加载超时，请检查网络连接后重试';
    } else if (err.message.includes('404')) {
      error.value = '文件未找到，可能已被删除或移动';
    } else if (err.message.includes('403')) {
      error.value = '没有权限访问该文件';
    } else if (err.message.includes('zip') || err.message.includes('central directory')) {
      error.value = '文件格式错误或文件已损坏，请联系管理员';
    } else {
      error.value = err.message || '加载论文时发生错误，请稍后重试';
    }
  } finally {
    loading.value = false;
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

    // 添加resize事件监听
    window.addEventListener('resize', handleResize);

    // 加载并渲染文档
    await loadAndRenderDocument();
  } catch (err) {
    error.value = err.message || '加载论文时发生错误';
    loading.value = false;
  }
});

onUnmounted(() => {
  // 移除resize事件监听
  window.removeEventListener('resize', handleResize);
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

.thesis-content {
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 600px;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
}

/* 在768px断点下 */
@media (max-width: 768px) {
  .thesis-content {
    padding: 15px;
    font-size: 14px;
    min-height: 400px;
    line-height: 1.5;
  }
}

/* 在480px断点下 */
@media (max-width: 480px) {
  .thesis-content {
    padding: 10px;
    font-size: 13px;
    min-height: 300px;
    line-height: 1.4;
  }
  
  /* 优化小屏幕上的文档内容显示 */
  .docx-content {
    transform-origin: top left;
    max-width: 100%;
  }
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

/* 响应式样式 */
@media (min-width: 1200px) {
  .thesis-viewer-container {
    max-width: 1000px;
  }
}

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
  
  .thesis-content {
    padding: 15px;
    font-size: 14px;
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
  
  .thesis-content {
    padding: 10px;
    font-size: 13px;
    min-height: 300px;
  }
  
  .loading-spinner,
  .error-message {
    padding: 30px 10px;
    font-size: 16px;
  }
}

/* 添加docx文档预览的响应式样式 */
.thesis-content {
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.docx-content {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  transform-origin: top left;
  overflow-wrap: break-word;
  word-break: break-all;
}

/* 增强响应式样式 */
@media (max-width: 768px) {
  .docx-content {
    padding: 10px;
    font-size: 14px;
    transform: scale(0.95);
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .docx-content {
    padding: 5px;
    font-size: 12px;
    transform: scale(0.9);
    transform-origin: top left;
    line-height: 1.4;
    letter-spacing: 0.5px;
  }
}
</style>