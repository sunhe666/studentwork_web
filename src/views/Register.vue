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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 卡片样式 */
.auth-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* 头部样式 */
.auth-header {
  padding: 40px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.auth-title {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 700;
}

.auth-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
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