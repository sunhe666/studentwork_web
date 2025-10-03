<template>
  <div class="thesis-reduction-container">
    <Navbar />
    <main class="main-content">
      <div class="header-section">
        <h1 class="page-title">论文降重 - AI助手</h1>
        <p class="page-subtitle">智能降重，保持原意，提升论文质量</p>
      </div>

      <div class="content-wrapper">
        <!-- 左侧输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <h3>原文输入</h3>
            <div class="word-count">字数: {{ originalText.length }}</div>
          </div>
          <textarea
            v-model="originalText"
            placeholder="请粘贴需要降重的论文内容..."
            class="text-input"
            :disabled="isProcessing"
          ></textarea>
          
          <div class="control-panel">
            <div class="reduction-level">
              <label>降重强度:</label>
              <select v-model="reductionLevel" :disabled="isProcessing">
                <option value="light">轻度降重</option>
                <option value="medium">中度降重</option>
                <option value="heavy">深度降重</option>
              </select>
            </div>
            <button 
              @click="startReduction" 
              :disabled="!originalText.trim() || isProcessing"
              class="reduction-btn"
            >
              <span v-if="isProcessing">处理中...</span>
              <span v-else>开始降重</span>
            </button>
          </div>
        </div>

        <!-- 右侧结果区域 -->
        <div class="result-section">
          <div class="section-header">
            <h3>降重结果</h3>
            <div class="word-count" v-if="reducedText">字数: {{ reducedText.length }}</div>
          </div>
          
          <div v-if="isProcessing" class="processing-indicator">
            <div class="loading-spinner"></div>
            <p>AI正在为您进行智能降重，请稍候...</p>
          </div>
          
          <div v-else-if="reducedText" class="result-content">
            <div class="result-text">{{ reducedText }}</div>
            <div class="result-actions">
              <button @click="copyResult" class="action-btn copy-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                复制结果
              </button>
              <button @click="downloadResult" class="action-btn download-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                下载文档
              </button>
            </div>
          </div>
          
          <div v-else class="empty-result">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
              <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
            </svg>
            <p>降重结果将在这里显示</p>
          </div>
        </div>
      </div>

      <!-- 功能说明 -->
      <div class="feature-info">
        <h3>功能特点</h3>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h4>智能同义替换</h4>
            <p>AI智能识别关键词，进行精准的同义词替换，保持语义不变</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </div>
            <h4>句式重构</h4>
            <p>通过调整句子结构和表达方式，有效降低重复率</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h4>质量保证</h4>
            <p>保持原文的学术性和逻辑性，确保降重后的质量</p>
          </div>
        </div>
      </div>

      <!-- 一键全文降重 -->
      <div class="full-document-section">
        <h3>一键全文降重</h3>
        <p class="section-description">上传完整论文文件，AI将自动进行全文降重处理，保持原始格式不变</p>
        
        <div class="upload-area" :class="{ 'dragover': isDragOver }" 
             @drop="handleFileDrop" 
             @dragover.prevent="isDragOver = true" 
             @dragleave="isDragOver = false"
             @click="triggerFileInput">
          <input 
            ref="fileInput" 
            type="file" 
            accept=".docx,.doc,.pdf,.txt" 
            @change="handleFileSelect" 
            style="display: none;"
          >
          
          <div v-if="!selectedFile && !isFullDocProcessing" class="upload-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <p>点击或拖拽文件到此处上传</p>
            <p class="file-types">支持格式：DOCX、DOC、PDF、TXT</p>
          </div>
          
          <div v-else-if="selectedFile && !isFullDocProcessing" class="file-info">
            <div class="file-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div class="file-details">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button @click.stop="removeFile" class="remove-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
          
          <div v-else-if="isFullDocProcessing" class="processing-status">
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: fullDocProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ fullDocProgress }}% - {{ fullDocProgressText }}</div>
            </div>
            <p class="processing-note">正在处理您的论文，请耐心等待...</p>
          </div>
        </div>
        
        <div class="full-doc-controls" v-if="selectedFile && !isFullDocProcessing">
          <div class="reduction-settings">
            <label>降重强度:</label>
            <select v-model="fullDocReductionLevel">
              <option value="light">轻度降重</option>
              <option value="medium">中度降重</option>
              <option value="heavy">深度降重</option>
            </select>
          </div>
          <button @click="startFullDocumentReduction" class="full-doc-btn">
            开始全文降重
          </button>
        </div>
      </div>

      <!-- 降重历史记录 -->
      <div class="reduction-history-section">
        <div class="history-header">
          <h3>降重历史记录</h3>
          <div class="history-controls">
            <select v-model="historyFilter" @change="loadReductionHistory">
              <option value="">全部状态</option>
              <option value="completed">已完成</option>
              <option value="processing">处理中</option>
              <option value="failed">失败</option>
            </select>
            <button @click="loadReductionHistory" class="refresh-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              刷新
            </button>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="history-loading">
          <div class="loading-spinner"></div>
          <p>加载历史记录中...</p>
        </div>

        <div v-else-if="reductionHistory.length === 0" class="history-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <p>暂无降重记录</p>
        </div>

        <div v-else class="history-list">
          <div 
            v-for="record in reductionHistory" 
            :key="record.id" 
            class="history-item"
            :class="{ 'processing': record.status === 'processing', 'failed': record.status === 'failed' }"
          >
            <div class="history-item-header">
              <div class="file-info">
                <h4 class="filename">{{ record.original_filename }}</h4>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(record.file_size) }}</span>
                  <span class="reduction-level">{{ getReductionLevelText(record.reduction_level) }}</span>
                  <span class="status" :class="record.status">{{ getStatusText(record.status) }}</span>
                </div>
              </div>
              <div class="history-actions">
                <button 
                  v-if="record.status === 'completed' && record.file_url" 
                  @click="downloadHistoryFile(record)"
                  class="action-btn download-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  下载
                </button>
                <button 
                  @click="deleteHistoryRecord(record.id)"
                  class="action-btn delete-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  删除
                </button>
              </div>
            </div>

            <div v-if="record.status === 'completed'" class="history-stats">
              <div class="stat-item">
                <span class="stat-label">原文字数:</span>
                <span class="stat-value">{{ record.original_length?.toLocaleString() || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">降重后字数:</span>
                <span class="stat-value">{{ record.reduced_length?.toLocaleString() || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">降重率:</span>
                <span class="stat-value highlight">{{ record.reduction_rate || 0 }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">处理时长:</span>
                <span class="stat-value">{{ record.processing_time || 0 }}秒</span>
              </div>
            </div>

            <div v-if="record.status === 'failed' && record.error_message" class="error-info">
              <span class="error-label">错误信息:</span>
              <span class="error-message">{{ record.error_message }}</span>
            </div>

            <div class="history-time">
              <span>创建时间: {{ formatDateTime(record.created_at) }}</span>
              <span v-if="record.updated_at !== record.created_at">
                更新时间: {{ formatDateTime(record.updated_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ pagination.page }} 页 / 共 {{ pagination.totalPages }} 页
          </span>
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="usage-tips">
        <h3>使用提示</h3>
        <ul>
          <li>建议每次输入500-2000字的文本段落，效果更佳</li>
          <li>轻度降重适合重复率较低的文本，深度降重适合重复率较高的文本</li>
          <li>降重后请仔细检查内容，确保语义准确无误</li>
          <li>建议结合人工校对，确保论文的学术质量</li>
          <li><strong>全文降重功能</strong>：支持完整论文文件处理，自动保持原始格式</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../axios.js';

const originalText = ref('');
const reducedText = ref('');
const isProcessing = ref(false);
const reductionLevel = ref('medium');

// 全文降重相关状态
const selectedFile = ref(null);
const isDragOver = ref(false);
const isFullDocProcessing = ref(false);
const fullDocProgress = ref(0);
const fullDocProgressText = ref('');
const fullDocReductionLevel = ref('medium');
const fileInput = ref(null);
const processedFileUrl = ref('');
const processedFileName = ref('');

// 降重历史相关状态
const reductionHistory = ref([]);
const isLoadingHistory = ref(false);
const historyFilter = ref('');
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});

// 开始降重
const startReduction = async () => {
  if (!originalText.value.trim()) {
    ElMessage.warning('请输入需要降重的文本');
    return;
  }

  isProcessing.value = true;
  reducedText.value = '';

  try {
    // 构建降重提示词
    const reductionPrompts = {
      light: '请对以下文本进行轻度降重，主要通过同义词替换和简单的句式调整来降低重复率，保持原文的表达风格：',
      medium: '请对以下文本进行中度降重，通过同义词替换、句式重构和表达方式调整来有效降低重复率，同时保持原意：',
      heavy: '请对以下文本进行深度降重，通过全面的同义词替换、句式重构、段落重组等方式大幅降低重复率，确保语义完整：'
    };

    const prompt = reductionPrompts[reductionLevel.value] + '\n\n' + originalText.value;

    const response = await axios.post('/ai/chat', {
      messages: [
        {
          role: 'system',
          content: '你是一个专业的论文降重助手。请根据用户要求对文本进行降重处理，保持原文的学术性和逻辑性，确保降重后的内容准确、流畅、符合学术规范。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      apiKey: ''
    });

    reducedText.value = response.content || '';
    ElMessage.success('降重完成！');
  } catch (error) {
    console.error('降重失败:', error);
    ElMessage.error('降重失败，请稍后重试');
  } finally {
    isProcessing.value = false;
  }
};

// 复制结果
const copyResult = async () => {
  if (!reducedText.value) return;
  
  try {
    await navigator.clipboard.writeText(reducedText.value);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败，请手动复制');
  }
};

// 下载结果
const downloadResult = () => {
  if (!reducedText.value) return;
  
  const blob = new Blob([reducedText.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '降重结果.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  ElMessage.success('文件下载成功');
};

// 文件上传相关函数
const triggerFileInput = () => {
  if (!isFullDocProcessing.value) {
    fileInput.value?.click();
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleFileDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    validateAndSetFile(files[0]);
  }
};

const validateAndSetFile = (file) => {
  // 检查文件类型
  const allowedTypes = ['.docx', '.doc', '.pdf', '.txt'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    ElMessage.error('不支持的文件格式，请上传 DOCX、DOC、PDF 或 TXT 文件');
    return;
  }
  
  // 检查文件大小（限制为50MB）
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB');
    return;
  }
  
  // 检查文件名是否包含特殊字符
  const invalidChars = /[<>:"/\\|?*]/g;
  if (invalidChars.test(file.name)) {
    console.warn('文件名包含特殊字符:', file.name);
  }
  
  selectedFile.value = file;
  console.log('选择的文件:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });
  ElMessage.success('文件上传成功');
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 全文降重处理
const startFullDocumentReduction = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传论文文件');
    return;
  }
  
  isFullDocProcessing.value = true;
  fullDocProgress.value = 0;
  fullDocProgressText.value = '准备处理文件...';
  
  let progressInterval = null;
  
  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('reductionLevel', fullDocReductionLevel.value);
    
    console.log('准备发送的数据:', {
      fileName: selectedFile.value.name,
      fileSize: selectedFile.value.size,
      fileType: selectedFile.value.type,
      reductionLevel: fullDocReductionLevel.value
    });
    
    // 模拟进度更新
    progressInterval = setInterval(() => {
      if (fullDocProgress.value < 90) {
        fullDocProgress.value += Math.random() * 10;
        updateProgressText();
      }
    }, 1000);
    
    // 发送文件到后端处理
    console.log('开始发送文件到后端...');
    const response = await axios.post('/ai/document-reduction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const uploadProgress = Math.round((progressEvent.loaded * 30) / progressEvent.total);
        fullDocProgress.value = Math.max(fullDocProgress.value, uploadProgress);
        fullDocProgressText.value = '上传文件中...';
      }
    });
    
    console.log('后端响应数据:', response);
    
    clearInterval(progressInterval);
    fullDocProgress.value = 100;
    fullDocProgressText.value = '处理完成！';
    
    // 检查响应数据（注意：axios拦截器已经返回了response.data）
    if (!response) {
      throw new Error('服务器返回空响应');
    }
    
    // 保存处理后的文件信息（response已经是data部分了）
    processedFileUrl.value = response.fileUrl || '';
    processedFileName.value = response.reducedFileName || '';
    
    console.log('提取的文件信息:', {
      fileUrl: processedFileUrl.value,
      fileName: processedFileName.value
    });
    
    // 显示完成提示
    setTimeout(() => {
      showDownloadDialog();
    }, 500);
    
    // 刷新历史记录
    loadReductionHistory();
    
  } catch (error) {
    console.error('全文降重失败:', error);
    
    // 清理进度定时器
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    // 检查错误类型并显示相应提示
    let errorMessage = '全文降重失败，请稍后重试';
    
    console.log('错误对象:', error);
    
    if (error.response) {
      // 服务器返回了错误响应
      console.log('服务器错误响应:', error.response);
      errorMessage = error.response.data?.message || error.response.message || `服务器错误 (${error.response.status})`;
    } else if (error.request) {
      // 请求发送了但没有收到响应
      console.log('网络请求错误:', error.request);
      errorMessage = '网络连接失败，请检查网络连接';
    } else {
      // 其他错误
      console.log('其他错误:', error.message);
      errorMessage = error.message || '处理过程中发生未知错误';
    }
    
    ElMessage.error(errorMessage);
    isFullDocProcessing.value = false;
    fullDocProgress.value = 0;
    fullDocProgressText.value = '';
  }
};

const updateProgressText = () => {
  const progress = fullDocProgress.value;
  if (progress < 20) {
    fullDocProgressText.value = '解析文件结构...';
  } else if (progress < 40) {
    fullDocProgressText.value = '提取文本内容...';
  } else if (progress < 60) {
    fullDocProgressText.value = 'AI智能降重中...';
  } else if (progress < 80) {
    fullDocProgressText.value = '重构文档格式...';
  } else if (progress < 100) {
    fullDocProgressText.value = '生成最终文件...';
  }
};

const showDownloadDialog = () => {
  // 使用Element Plus的确认对话框
  ElMessageBox.confirm(
    '论文降重已完成！是否需要下载降重后的论文文件？',
    '降重完成',
    {
      confirmButtonText: '下载文件',
      cancelButtonText: '稍后下载',
      type: 'success',
    }
  ).then(() => {
    downloadProcessedFile();
  }).catch(() => {
    ElMessage.info('您可以稍后在结果区域下载文件');
    resetFullDocumentState();
  });
};

const downloadProcessedFile = () => {
  if (processedFileUrl.value) {
    // 构建完整的下载URL
    const downloadUrl = `${axios.defaults.baseURL || ''}${processedFileUrl.value}`;
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = processedFileName.value || `降重后_${selectedFile.value.name}`;
    a.target = '_blank'; // 在新窗口打开，避免页面跳转
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    ElMessage.success('文件下载成功');
  } else {
    ElMessage.error('文件下载链接不存在');
  }
  
  resetFullDocumentState();
};

const resetFullDocumentState = () => {
  isFullDocProcessing.value = false;
  fullDocProgress.value = 0;
  fullDocProgressText.value = '';
  selectedFile.value = null;
  processedFileUrl.value = '';
  processedFileName.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 加载降重历史记录
const loadReductionHistory = async () => {
  isLoadingHistory.value = true;
  
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    });
    
    if (historyFilter.value) {
      params.append('status', historyFilter.value);
    }
    
    const response = await axios.get(`/ai/reduction-history?${params}`);
    
    reductionHistory.value = response.data || [];
    pagination.value = response.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    };
    
    console.log('加载历史记录成功:', response);
    
  } catch (error) {
    console.error('加载历史记录失败:', error);
    ElMessage.error('加载历史记录失败');
  } finally {
    isLoadingHistory.value = false;
  }
};

// 下载历史文件
const downloadHistoryFile = (record) => {
  if (!record.file_url) {
    ElMessage.error('文件下载链接不存在');
    return;
  }
  
  const downloadUrl = `${axios.defaults.baseURL || ''}${record.file_url}`;
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = record.reduced_filename || record.original_filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  ElMessage.success('开始下载文件');
};

// 删除历史记录
const deleteHistoryRecord = async (recordId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条降重记录吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await axios.delete(`/ai/reduction-history/${recordId}`);
    ElMessage.success('删除成功');
    
    // 重新加载历史记录
    loadReductionHistory();
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 切换页面
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    loadReductionHistory();
  }
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取降重强度文本
const getReductionLevelText = (level) => {
  const levelMap = {
    light: '轻度降重',
    medium: '中度降重',
    heavy: '深度降重'
  };
  return levelMap[level] || level;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  };
  return statusMap[status] || status;
};

// 页面加载时初始化
onMounted(() => {
  loadReductionHistory();
});
</script>

<style scoped>
.thesis-reduction-container {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 18px;
  color: #7f8c8d;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
}

.input-section,
.result-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.section-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.word-count {
  font-size: 14px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 4px 12px;
  border-radius: 20px;
}

.text-input {
  width: 100%;
  height: 300px;
  padding: 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
}

.text-input:focus {
  border-color: #42b983;
}

.text-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.reduction-level {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reduction-level label {
  font-weight: 500;
  color: #2c3e50;
}

.reduction-level select {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s;
}

.reduction-level select:focus {
  border-color: #42b983;
}

.reduction-btn {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.reduction-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.3);
}

.reduction-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-content {
  height: 100%;
}

.result-text {
  background: #f8f9fa;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  padding: 15px;
  height: 300px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-wrap;
}

.result-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #42b983;
  background: white;
  color: #42b983;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #42b983;
  color: white;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #bdc3c7;
}

.empty-result svg {
  margin-bottom: 15px;
}

.feature-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.feature-info h3 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.feature-item h4 {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.feature-item p {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

.usage-tips {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.usage-tips h3 {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
}

.usage-tips ul {
  list-style: none;
  padding: 0;
}

.usage-tips li {
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
  color: #7f8c8d;
  position: relative;
  padding-left: 25px;
}

.usage-tips li:before {
  content: "•";
  color: #42b983;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.usage-tips li:last-child {
  border-bottom: none;
}

/* 全文降重功能样式 */
.full-document-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.full-document-section h3 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.section-description {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 25px;
  font-size: 16px;
}

.upload-area {
  border: 3px dashed #ecf0f1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #42b983;
  background: #f0f9f4;
}

.upload-area.dragover {
  border-color: #42b983;
  background: #e8f5e8;
  transform: scale(1.02);
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-placeholder svg {
  color: #bdc3c7;
  margin-bottom: 15px;
}

.upload-placeholder p {
  margin: 10px 0;
  font-size: 16px;
}

.file-types {
  font-size: 14px;
  color: #95a5a6;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: #e8f5e8;
  border-radius: 8px;
  margin: 0 auto;
  max-width: 400px;
}

.file-icon {
  color: #42b983;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
  word-break: break-all;
}

.file-size {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background: #c0392b;
}

.processing-status {
  padding: 30px;
}

.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983 0%, #359469 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
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
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.processing-note {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin: 0;
}

.full-doc-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reduction-settings {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reduction-settings label {
  font-weight: 500;
  color: #2c3e50;
}

.reduction-settings select {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s;
}

.reduction-settings select:focus {
  border-color: #42b983;
}

.full-doc-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.full-doc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
}

/* 降重历史记录样式 */
.reduction-history-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.history-header h3 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.history-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-controls select {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s;
}

.history-controls select:focus {
  border-color: #42b983;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background: #359469;
}

.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.history-loading .loading-spinner {
  margin-bottom: 15px;
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #bdc3c7;
}

.history-empty svg {
  margin-bottom: 15px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-item {
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: #42b983;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.1);
}

.history-item.processing {
  border-color: #f39c12;
  background: #fef9e7;
}

.history-item.failed {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.file-info {
  flex: 1;
}

.filename {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
  word-break: break-all;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
}

.file-size,
.reduction-level {
  color: #7f8c8d;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.status.processing {
  background: #fff3cd;
  color: #856404;
}

.status.failed {
  background: #f8d7da;
  color: #721c24;
}

.history-actions {
  display: flex;
  gap: 10px;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.highlight {
  color: #42b983;
}

.error-info {
  padding: 12px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  margin-bottom: 15px;
}

.error-label {
  font-weight: 500;
  color: #721c24;
}

.error-message {
  color: #721c24;
  margin-left: 8px;
}

.history-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #95a5a6;
  border-top: 1px solid #ecf0f1;
  padding-top: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.page-btn {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #359469;
}

.page-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .thesis-reduction-container {
    padding-top: 100px;
  }

  .main-content {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .input-section,
  .result-section {
    padding: 20px;
  }

  .text-input,
  .result-text {
    height: 250px;
  }

  .control-panel {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .result-actions {
    flex-direction: column;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  /* 移动端全文降重样式 */
  .full-document-section {
    padding: 20px;
  }

  .full-document-section h3 {
    font-size: 20px;
  }

  .section-description {
    font-size: 14px;
  }

  .upload-area {
    padding: 30px 15px;
  }

  .upload-placeholder p {
    font-size: 14px;
  }

  .file-info {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }

  .file-details {
    text-align: center;
  }

  .full-doc-controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .reduction-settings {
    justify-content: center;
  }

  .full-doc-btn {
    width: 100%;
  }

  .progress-text {
    font-size: 14px;
  }

  /* 移动端历史记录样式 */
  .reduction-history-section {
    padding: 20px;
  }

  .history-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .history-header h3 {
    font-size: 20px;
    text-align: center;
  }

  .history-controls {
    justify-content: center;
  }

  .history-item {
    padding: 15px;
  }

  .history-item-header {
    flex-direction: column;
    gap: 15px;
  }

  .history-actions {
    justify-content: center;
  }

  .history-stats {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .history-time {
    flex-direction: column;
    gap: 5px;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
