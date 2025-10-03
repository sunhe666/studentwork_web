<template>
  <div class="ai-assistant-container">
    <Navbar />
    <main class="main-content">
      <h1 class="page-title">AI助手</h1>
      <p class="page-description">选择您需要的AI助手服务</p>
      
      <div class="service-grid">
        <!-- 论文指导 -->
        <div class="service-card" @click="navigateToService('thesis-guidance')">
          <div class="service-icon thesis-guidance">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3 class="service-title">论文指导</h3>
          <p class="service-description">
            AI智能论文写作指导，帮助您完成高质量的学术论文。提供论文结构建议、写作技巧指导、内容优化建议等全方位支持。
          </p>
          <div class="service-features">
            <span class="feature-tag">写作指导</span>
            <span class="feature-tag">结构优化</span>
            <span class="feature-tag">内容建议</span>
          </div>
          <div class="service-action">
            <span>开始使用</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </div>
        </div>

        <!-- 论文降重 -->
        <div class="service-card" @click="navigateToService('thesis-reduction')">
          <div class="service-icon thesis-reduction">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
            </svg>
          </div>
          <h3 class="service-title">论文降重</h3>
          <p class="service-description">
            智能论文降重服务，帮助您降低论文重复率。通过AI技术进行同义词替换、句式改写、段落重组等，保持原意的同时有效降重。
          </p>
          <div class="service-features">
            <span class="feature-tag">智能降重</span>
            <span class="feature-tag">同义替换</span>
            <span class="feature-tag">句式改写</span>
          </div>
          <div class="service-action">
            <span>开始使用</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="usage-guide">
        <h3>使用说明</h3>
        <div class="guide-content">
          <div class="guide-item">
            <div class="guide-number">1</div>
            <div class="guide-text">选择您需要的AI助手服务类型</div>
          </div>
          <div class="guide-item">
            <div class="guide-number">2</div>
            <div class="guide-text">根据页面提示输入相关内容或问题</div>
          </div>
          <div class="guide-item">
            <div class="guide-number">3</div>
            <div class="guide-text">AI将为您提供专业的建议和帮助</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';

const router = useRouter();

const navigateToService = (serviceType) => {
  if (serviceType === 'thesis-guidance') {
    router.push('/thesis-guidance-chat');
  } else if (serviceType === 'thesis-reduction') {
    router.push('/thesis-reduction');
  }
};
</script>

<style scoped>
.ai-assistant-container {
  padding-top: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.page-description {
  font-size: 18px;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 50px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #42b983;
}

.service-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.service-icon.thesis-guidance {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.service-icon.thesis-reduction {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.service-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 15px;
}

.service-description {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
}

.feature-tag {
  background: #ecf0f1;
  color: #34495e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.service-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #42b983;
  font-weight: 600;
  font-size: 16px;
}

.service-action svg {
  transition: transform 0.3s ease;
}

.service-card:hover .service-action svg {
  transform: translateX(5px);
}

.usage-guide {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.usage-guide h3 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
}

.guide-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.guide-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.guide-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.guide-text {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .ai-assistant-container {
    padding-top: 100px;
  }

  .main-content {
    padding: 20px 15px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-description {
    font-size: 16px;
    margin-bottom: 30px;
  }

  .service-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .service-card {
    padding: 25px;
  }

  .service-title {
    font-size: 20px;
  }

  .service-description {
    font-size: 14px;
  }

  .usage-guide {
    padding: 25px;
  }

  .guide-content {
    flex-direction: column;
    gap: 25px;
  }

  .guide-item {
    min-width: auto;
  }
}
</style>
