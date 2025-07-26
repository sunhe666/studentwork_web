<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">用户注册</h2>
        <p class="auth-subtitle">创建新账号，开始您的旅程</p>
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
    errors.value.server = error.response?.data?.message || '注册失败，请稍后重试';
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
  width: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-card {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 0;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.auth-header {
  padding: 30px 30px 0;
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
  padding: 30px;
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
  padding: 14px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
  background-color: white;
  transform: translateY(-1px);
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
.auth-button {
  width: 100%;
  padding: 14px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auth-button:hover {
  background-color: #3385ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
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
} display: flex;
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
  padding: 0 30px 30px;
  text-align: center;
  color: #4e5969;
  font-size: 14px;
}

.login-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}
</style>