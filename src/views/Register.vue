<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">用户注册</h2>
        <p class="auth-subtitle">创建新账号，开始您的体验</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            class="form-input"
            :class="{ 'is-invalid': errors.username }"
            placeholder="请输入用户名"
          >
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-input"
            :class="{ 'is-invalid': errors.email }"
            placeholder="请输入邮箱"
          >
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-input"
            :class="{ 'is-invalid': errors.password }"
            placeholder="请输入密码"
          >
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="form-input"
            :class="{ 'is-invalid': errors.confirmPassword }"
            placeholder="请再次输入密码"
          >
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>
        
        <button type="submit" class="auth-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>注册</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <span>已有账号? </span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from '../axios';

const router = useRouter();
const loading = ref(false);
const form = ref({
  username: '',
  email: '',
  password: ''
});
const errors = ref({});

const validateForm = () => {
  const newErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!form.value.username.trim()) {
    newErrors.username = '用户名不能为空';
  } else if (form.value.username.length < 3 || form.value.username.length > 20) {
    newErrors.username = '用户名长度必须在3-20个字符之间';
  }

  if (!form.value.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!emailRegex.test(form.value.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
  
  if (!form.value.password) {
    newErrors.password = '密码不能为空';
  } else if (form.value.password.length < 6) {
    newErrors.password = '密码长度不能少于6个字符';
  }
  

  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  
  try {
    loading.value = true;
    // 这里使用模拟注册API，实际项目中替换为真实后端接口
    const response = await axios.post('/user/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    });
    
    // 注册成功后跳转到登录页
    // 存储用户信息
    localStorage.setItem('user', JSON.stringify(response.user));
    ElMessage.success('注册成功');
    router.push('/');
  } catch (error) {
    errors.value.server = error.response?.data?.message || '注册失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 基础样式重置与全局设置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 容器样式 */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
  
  /* 多层渐变背景 - 使用不同的色彩组合 */
  background: 
    radial-gradient(circle at 15% 85%, rgba(138, 43, 226, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 85% 15%, rgba(255, 20, 147, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 45% 45%, rgba(0, 191, 255, 0.8) 0%, transparent 50%),
    linear-gradient(135deg, #8a2be2 0%, #ff1493 50%, #00bfff 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%;
  animation: backgroundShift 25s ease-in-out infinite;
}

/* 背景动画 */
@keyframes backgroundShift {
  0%, 100% {
    background-position: 0% 50%, 100% 50%, 50% 0%, 0% 0%;
  }
  50% {
    background-position: 100% 50%, 0% 50%, 50% 100%, 100% 100%;
  }
}

/* 动态粒子背景 */
.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 2px, transparent 2px),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    radial-gradient(circle at 55% 15%, rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px),
    radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 120px 120px, 90px 90px, 140px 140px, 160px 160px;
  animation: particleFloat 35s linear infinite;
  pointer-events: none;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-120px) rotate(360deg);
  }
}

/* 流动光效 */
.auth-container::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 45deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent,
    rgba(255, 255, 255, 0.12),
    transparent
  );
  animation: rotate 25s linear infinite;
  pointer-events: none;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 卡片样式 */
.auth-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(25px);
  border-radius: 28px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.25);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 10;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(138, 43, 226, 0.05) 0%, 
    transparent 50%, 
    rgba(255, 20, 147, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.auth-card:hover {
  transform: translateY(-10px) scale(1.015);
  box-shadow: 
    0 35px 90px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.35);
}

.auth-card:hover::before {
  opacity: 1;
}

/* 头部样式 */
.auth-header {
  padding: 50px 36px 30px;
  text-align: center;
  background: linear-gradient(135deg, #8a2be2 0%, #ff1493 50%, #00bfff 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.auth-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.12), 
    transparent);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.auth-title {
  margin: 0 0 14px;
  font-size: 34px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.auth-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
  font-weight: 300;
  position: relative;
  z-index: 1;
}

/* 表单样式 */
.auth-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  background-color: white;
  transform: translateY(-1px);
}

.form-input.is-invalid {
  border-color: #ff4d4f;
}

/* 错误消息样式 */
.error-message {
  margin-top: 6px;
  color: #ff4d4f;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.error-message::before {
  content: '⚠️';
  margin-right: 5px;
  font-size: 14px;
}

/* 按钮样式 */
.auth-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s;
}

.auth-button:active::after {
  transform: translate(-50%, -50%) scale(1);
}

.auth-button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部样式 */
.auth-footer {
  padding: 0 30px 30px;
  text-align: center;
  color: #4e5969;
  font-size: 14px;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .auth-card {
    border-radius: 16px;
  }

  .auth-header {
    padding: 30px 20px 15px;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-form {
    padding: 20px;
  }

  .form-input {
    padding: 12px 15px;
  }

  .auth-button {
    padding: 12px;
  }
}
</style>