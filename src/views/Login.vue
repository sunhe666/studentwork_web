<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">用户登录</h2>
        <p class="auth-subtitle">欢迎回来，请登录您的账号</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember"> 记住我
          </label>
          <router-link to="/forgot-password" class="forgot-password">忘记密码?</router-link>
        </div>
        
        <button type="submit" class="auth-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <span>还没有账号? </span>
        <router-link to="/register" class="register-link">立即注册</router-link>
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
  email: '',
  password: '',
  remember: false
});
const errors = ref({});

const validateForm = () => {
  const newErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!form.value.email.trim()) {
    newErrors.email = '邮箱不能为空';
  } else if (!emailRegex.test(form.value.email)) {
    newErrors.email = '请输入有效的邮箱地址';
  }
  
  if (!form.value.password) {
    newErrors.password = '密码不能为空';
  } else if (form.value.password.length < 6) {
    newErrors.password = '密码长度不能少于6位';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleLogin = async () => {
  if (!validateForm()) return;
  
  try {
    loading.value = true;
    const response = await axios.post('/user/login', {
      email: form.value.email,
      password: form.value.password
    });
    // 存储token和用户信息
    // 存储用户信息
    localStorage.setItem('user', JSON.stringify(response.user));
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
   
      ElMessage.error('登录失败');

    errors.value.server = error.response?.data?.message || '登录失败，请检查用户名和密码';
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
  
  /* 多层渐变背景 */
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.8) 0%, transparent 50%),
    linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%;
  animation: backgroundShift 20s ease-in-out infinite;
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
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px),
    radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.25) 1px, transparent 1px);
  background-size: 100px 100px, 80px 80px, 120px 120px, 150px 150px;
  animation: particleFloat 30s linear infinite;
  pointer-events: none;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
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
    from 0deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: rotate 20s linear infinite;
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
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.2);
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
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.auth-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 32px 80px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.auth-card:hover::before {
  opacity: 1;
}

/* 头部样式 */
.auth-header {
  padding: 48px 36px 28px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
    rgba(255, 255, 255, 0.1), 
    transparent);
  animation: shimmer 3s infinite;
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
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.auth-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
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

/* 表单选项样式 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #4e5969;
}

.remember-me input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #764ba2;
  text-decoration: underline;
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

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.register-link:hover {
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