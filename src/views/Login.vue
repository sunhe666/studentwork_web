<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">用户登录</h2>
        <p class="auth-subtitle">欢迎回来，请登录您的账号</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
  username: '',
  password: '',
  remember: false
});
const errors = ref({});

const validateForm = () => {
  const newErrors = {};
  if (!form.value.username.trim()) {
    newErrors.username = '用户名不能为空';
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
    // 这里使用模拟登录API，实际项目中替换为真实后端接口
    const response = await axios.post('/user/login', {
      username: form.value.username,
      password: form.value.password
    });
    // 存储token和用户信息
    // 存储用户信息
    localStorage.setItem('user', JSON.stringify(response.user));
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
   
      ElMessage.error('登录失败');

    errors.value.server = error.response?.message || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 0;
}

.auth-header {
  padding: 30px 0 0;
  text-align: center;
}

.auth-title {
  margin: 0 0 10px;
  font-size: 24px;
  color: #1d2129;
}

.auth-subtitle {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.auth-form {
  padding: 30px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #c9cdcf;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-input.is-invalid {
  border-color: #ff4d4f;
}

.error-message {
  margin-top: 5px;
  color: #ff4d4f;
  font-size: 12px;
}

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
  margin-right: 5px;
}

.forgot-password {
  color: #409eff;
  text-decoration: none;
}

.auth-button {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-button:hover:not(:disabled) {
  background-color: #337ecc;
}

.auth-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  padding: 0 0 30px;
  text-align: center;
  color: #4e5969;
  font-size: 14px;
}

.register-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}
</style>