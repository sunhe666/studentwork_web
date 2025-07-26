<template>


  <div class="content-detail">
    <div class="detail-header">
      <button @click="goBack" class="back-btn">← 返回列表</button>
      <h1 class="detail-title">{{ content.title }}</h1>
    </div>
    <div class="detail-meta">
      <span class="category">{{ content.category }}</span>
      <span class="time">{{ formatDate(content.time) }}</span>
      <span class="author">孙猴子源码</span>
            <span>浏览量：{{ content.views }}</span>
    </div>
    <div class="detail-cover">
      <img :src="content.cover" alt="项目封面" class="cover-img" />
    </div>
    <div class="detail-content">
      <div class="section-title">项目介绍</div>
      <div class="content-text">{{ content.content }}</div>
    </div>
    <div class="detail-features">
      <div class="section-title">功能特点</div>
      <div class="features-text" v-html="formatFeatures(content.features)"></div>
    </div>
    <div class="detail-technologies">
      <div class="section-title">技术栈</div>
      <div class="tech-tags">
        <span v-for="tech in (content.technologies || '').split(',')" :key="tech.trim()" class="tech-tag">{{ tech.trim() }}</span>
      </div>
    </div>
    <div class="detail-screenshots">
      <div class="section-title">项目截图</div>
      <div class="screenshot-grid">
        <img v-for="(img, idx) in content.screenshots" :key="idx" :src="img" alt="项目截图" class="screenshot-img" />
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comment-section">
      <div class="section-title">用户评论</div>
      
      <!-- 评论表单 -->
      <div v-if="user" class="comment-form">
        <textarea v-model="newComment.content" placeholder="写下您的评论..." class="comment-input content-input"></textarea>
        <button @click="submitComment" class="submit-comment">提交评论</button>
      </div>
      <div v-else class="login-prompt">
        <p>请先<a href="/login" class="login-link">登录</a>后再发表评论</p>
      </div>
      
      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-if="loadingComments" class="loading-comments">加载中...</div>
        <div v-else-if="comments.length === 0" class="no-comments">暂无评论，来发表第一条评论吧~</div>
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user_name }}</span>
            <span class="comment-time">{{ formatDate(comment.time) }}</span>
            <button @click="deleteComment(comment.id)" class="delete-comment">删除</button>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <button v-if="user" @click="toggleReplyForm(comment.id)" class="reply-btn">回复 ({{ comment.reply_count }})</button>
            
            <!-- 回复表单 -->
            <div v-if="showReplyForm === comment.id" class="reply-form">
              <textarea v-model="replyComment.content" placeholder="写下您的回复..." class="reply-input content-input"></textarea>
              <button @click="submitReply(comment.id)" class="submit-reply">提交回复</button>
            </div>
            
            <!-- 回复列表 -->
            <div class="replies-list" v-if="comment.replies && comment.replies.length">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.user_name }}</span>
                  <span class="reply-time">{{ formatDate(reply.time) }}</span>
                  <button @click="deleteComment(reply.id)" class="delete-reply">删除</button>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
                <button v-if="user" @click="toggleReplyForm(reply.id, comment.id)" class="reply-to-reply">回复</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="horizontal-layout">
      <div class="detail-actions">
        <router-link v-if="content.thesis_file" :to="{ name: 'ThesisViewer', params: { filePath: content.thesis_file } }" class="thesis-btn">浏览论文</router-link>
        <div v-else class="thesis-btn disabled-btn">暂无论文文件</div>
      </div>
      <div class="amount-section">
        <div class="amount">
          <span class="amount-value">{{ content.amount }}</span>
          <span class="amount-unit">猫币</span>
        </div>
        <button class="buy-button" @click="showWechatDialog = true">
          <i class="icon-shopping"></i> 点击➕微，获取资料
        </button>

        <el-dialog v-model="showWechatDialog" title="联系我们" width="30%">
          <div class="wechat-container">
            <p class="wechat-title">微信号：<span class="wechat-value">sun-he</span></p>
            <div class="copy-button-container">
              <el-button type="primary" @click="copyWechat">复制微信号</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>

</template>

<script setup>
import Navbar from '/src/components/Navbar.vue';
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../axios';
import { ElDialog, ElButton, ElMessage } from 'element-plus';

const showWechatDialog = ref(false);

const copyWechat = () => {
  navigator.clipboard.writeText('sun-he').then(() => {
    ElMessage({ message: '微信号复制成功', type: 'success' });
    showWechatDialog.value = false;
  }).catch(() => {
    ElMessage({ message: '复制失败，请手动复制', type: 'error' });
  });
}

// 格式化特征文本，数字加点前缀单独成行
const formatFeatures = (text) => {
  if (!text) return '';
  // 匹配数字加点前缀的模式，添加换行
  // 添加换行并移除开头可能的空行
  return text.replace(/(\d+\.\s*|###\s*)/g, '<br>$1').replace(/^<br>/, '');
};

const route = useRoute()
const router = useRouter()
const content = ref({})
const loading = ref(true)
const error = ref(null)
const showImagePreview = ref(false)
const previewImage = ref('')

const openImagePreview = (img) => {
  previewImage.value = img
  showImagePreview.value = true
  document.body.style.overflow = 'hidden'
}

const closeImagePreview = () => {
  showImagePreview.value = false
  document.body.style.overflow = 'auto'
}

// 评论相关状态
const comments = ref([]);
const loadingComments = ref(false);
const user = JSON.parse(localStorage.getItem('user'));
const newComment = ref({ content: '' ,nickname:user?.username||null});
const replyComment = ref({ content: '' });
const showReplyForm = ref(null);
const replyToParentId = ref(null);

// 获取评论列表
const fetchComments = async () => {
  try {
    loadingComments.value = true;
     const id = route.params.id
    const res = await axios.get(`/comment/list/${id}`);
    comments.value = res;
  } catch (err) {
    console.error('获取评论失败:', err);
    error.value = '获取评论失败，请重试';
  } finally {
    loadingComments.value = false;
  }
};

// 提交评论
const submitComment = async () => {
  if (!user) {
    ElMessage.warning('请先登录后再评论');
    router.push('/login');
    return;
  }
  // 移除昵称验证
  if (!newComment.value.content) {
    alert('请填写评论内容');
    return;
  }
  
  try {
    await axios.post('/comment/add', {
      content_id: content.value.id,
      // 使用当前登录用户昵称
      user_name: newComment.value.nickname,
      content: newComment.value.content,
      time: new Date().toISOString()
    });
    
    // 重置表单并刷新评论
    newComment.value.content = '';
    fetchComments();
  } catch (err) {
    console.error('提交评论失败:', err);
    alert('评论提交失败，请重试');
  }
};

// 提交回复
const submitReply = async (parentId) => {
  if (!user) {
    ElMessage.warning('请先登录后再回复');
    router.push('/login');
    return;
  }
  // 移除昵称验证
  if (!replyComment.value.content) {
    alert('请填写回复内容');
    return;
  }
  
  try {
    await axios.post('/comment/add', {
      content_id: content.value.id,
      // 使用当前登录用户昵称
      user_name: newComment.value.nickname,
      content: replyComment.value.content,
      time: new Date().toISOString(),
      parent_id: parentId
    });
    
    // 重置表单并刷新评论
    replyComment.value.content = '';
    showReplyForm.value = null;
    replyToParentId.value = null;
    fetchComments();
  } catch (err) {
    console.error('提交回复失败:', err);
    alert('回复提交失败，请重试');
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return;
  
  try {
    await axios.delete(`/comment/delete/${commentId}`);
    fetchComments();
  } catch (err) {
    console.error('删除评论失败:', err);
    alert('删除评论失败，请重试');
  }
};

// 显示/隐藏回复表单
const toggleReplyForm = (commentId, parentId = null) => {
  if (showReplyForm.value === commentId) {
    showReplyForm.value = null;
    replyToParentId.value = null;
  } else {
    showReplyForm.value = commentId;
    replyToParentId.value = parentId || commentId;
  }
};

const fetchContentDetail = async () => {
  try {
    const id = route.params.id
    const res = await axios.get(`/content/${id}`)
    content.value = res
    loading.value = false
  } catch (err) {
    console.error('Failed to fetch content detail:', err)
    error.value = '获取内容失败，请重试'
    loading.value = false
  }
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchContentDetail();
  fetchComments();
})
</script>

<style scoped>
.amount-section {
  display: flex;
  width:40%;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.amount {
  display: flex;
  align-items: baseline;
}

.amount-value {
  font-size: 28px;
  font-weight: bold;
  color: #e63946;
  margin-right: 8px;
}

.amount-unit {
  color: #666;
  font-size: 16px;
}

.buy-button {
  background-color: #457b9d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background-color: #1d3557;
}

.icon-shopping {
  font-size: 18px;
}
</style>

<style scoped>
/* 论文查看器样式 */
.thesis-viewer-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.protected-content {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
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

<style scoped>
* {
  box-sizing: border-box;
}

.content-detail {
  margin-top: 110px;

  width:1880px;
  max-width: 100%;
  margin: 0 auto;
  padding: 24px;
  margin-left:20%
}

@media (min-width: 768px) {
  .content-detail {
    max-width: 85%;
  }
}

@media (min-width: 1200px) {
  .content-detail {
    max-width: 1000px;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
  margin-right: 16px;
  padding: 8px;
  width:100px;
}

.detail-title {
  font-size: clamp(1.4rem, 5vw, 2rem);
  margin: 0;
  color: #333;
  line-height: 1.3;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.category {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-cover {
  width: 100%;
  margin-bottom: 32px;
  border-radius: 8px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;
}

.detail-content,
.detail-features {
  margin-bottom: 32px;
}

.detail-features {
  margin-bottom: 32px;
  background-color:rgb(237, 236, 236);
  padding: 16px;
}

.content-text,
.features-text {
  line-height: 1.8;
  color: #444;
  font-size: 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.tech-tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}



.screenshot-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.2s;
}

.screenshot-img:hover {
  transform: scale(1.02);
}

/* 图片预览模态框样式 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 5px 10px;
}

.close-btn:hover {
  opacity: 0.8;
}

.detail-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.horizontal-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 20px 0;
}

.horizontal-layout > div {
  margin: 0;
}

.thesis-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.3s;
}

.thesis-btn:hover {
  background: #337ecc;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .back-btn {
    margin-bottom: 16px;
  }
  .screenshot-img {
    height: 150px;
  }
  .content-text,
  .features-text {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .content-detail {
    padding: 16px;
  }
  .detail-meta {
    gap: 8px;
    font-size: 13px;
  }
  .screenshot-grid {
    grid-template-columns: 1fr;
  }
  .replies-list {
    margin-left: 20px;
  }
}

/* 评论区样式 */
.comment-section {
  margin: 40px 0;
}

.comment-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.comment-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.username-input {
  margin-bottom: 10px;
}

.content-input {
  height: 100px;
  resize: vertical;
}

.submit-comment {
  background-color: #457b9d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-comment:hover {
  background-color: #1d3557;
}

.comments-list {
  margin-top: 20px;
}

.loading-comments {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: #999;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.reply-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 0;
}

.delete-comment {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 14px;
}

.replies-list {
  margin-left: 40px;
  margin-top: 15px;
}

.reply-item {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.reply-author {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.reply-time {
  color: #999;
  font-size: 12px;
}

.reply-content {
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-form {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.reply-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.submit-reply {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.reply-to-reply {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 12px;
  padding: 3px 0;
}

.delete-reply {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
}
</style>

<style scoped>
  .login-prompt {
    text-align: center;
    padding: 20px;
    color: #666;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 30px;
  }
  .login-link {
    color: #409eff;
    text-decoration: none;
  }
  .login-link:hover {
    text-decoration: underline;
  }
</style>