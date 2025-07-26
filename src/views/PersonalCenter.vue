<template>
  <Navbar />
  <div class="personal-center-container">
    <div class="personal-header">
      <h2>个人中心</h2>
    </div>

    <!-- 用户信息展示区域 -->
    <div class="info-section">
      <h3>用户信息</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="info-card">
        <div class="info-item">
          <span class="label">用户名:</span>
          <span class="value">{{ userInfo.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">邮箱:</span>
          <span class="value">{{ userInfo.email }}</span>
        </div>
        <button class="edit-btn" @click="showEditForm = true">编辑信息</button>
      </div>
    </div>

    <!-- 编辑用户信息表单 -->
    <el-dialog v-model="showEditForm" title="编辑用户信息" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditForm = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码表单 -->
    <div class="password-section">
      <h3>修改密码</h3>
      <h3>账户管理</h3>
      <button @click="handleDeleteAccount" class="delete-btn">注销账户</button>
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="150px" class="password-form">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import Navbar from '/src/components/Navbar.vue';
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, ElForm, ElFormItem, ElInput, ElButton, ElDialog } from 'element-plus'
import axios from '../axios'
import { useRouter } from 'vue-router'

// 状态管理
const userInfo = ref(null)
const loading = ref(true)
const error = ref('')
const showEditForm = ref(false)
const router = useRouter()

// 表单数据
const editForm = reactive({
  username: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: ''
})

// 表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

// 引用
const editFormRef = ref(null)
const passwordFormRef = ref(null)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    loading.value = true
  
    const storedUser = localStorage.getItem('user')
  
    if (!storedUser) {
      router.push('/login')
      return
    }
    const user = JSON.parse(storedUser)

    const res = await axios.get(`/user/info/${user.id}`)
    console.log(res)
    userInfo.value = res.data
    // 初始化编辑表单
    editForm.username = userInfo.value.username
    editForm.email = userInfo.value.email
  } catch (err) {
    error.value = '获取用户信息失败，请重试'
    console.error('获取用户信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 更新用户信息
const handleUpdate = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    const res = await axios.put(`/user/update/${userInfo.value.id}`, {
      username: editForm.username,
      email: editForm.email
    })

    userInfo.value = res.user
    localStorage.setItem('user', JSON.stringify(userInfo.value))
    showEditForm.value = false
    ElMessage.success('用户信息更新成功')
  } catch (err) {
    ElMessage.error('更新失败，请检查输入信息')
    console.error('更新用户信息失败:', err)
  }
}

// 修改密码
  const handleChangePassword = async () => {
    if (!passwordFormRef.value) return

    try {
      await passwordFormRef.value.validate()
      await axios.put(`/user/changepassword/${userInfo.value.id}`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })

      ElMessage.success('密码修改成功，请重新登录')
      // 清除本地存储并跳转登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } catch (err) {
      ElMessage.error('密码修改失败，请检查旧密码是否正确')
      console.error('修改密码失败:', err)
    }
  }

  // 注销账户
  const handleDeleteAccount = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要注销账户吗？此操作不可恢复！',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await axios.delete(`/user/delete/${userInfo.value.id}`)
      ElMessage.success('注销成功')
      // 清除本地存储并跳转登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } catch (err) {
      if (err === 'cancel') {
        ElMessage.info('已取消注销')
        return
      }
      ElMessage.error('注销失败，请重试')
      console.error('注销账户失败:', err)
    }
  }

// 页面加载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.personal-center-container {

  max-width: 1000px;
  margin: 0 auto;
  margin-top:120px;
  padding: 20px;
}

.personal-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.info-section,
.password-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.info-section h3,
.password-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.loading,
.error-message {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #f56c6c;
}

.info-card {
  padding: 20px;
}

.info-item {
  margin-bottom: 15px;
  padding: 10px;
  border-bottom: 1px dashed #eee;
}

.label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.value {
  color: #303133;
}

.delete-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #f78989;
}

.edit-btn:hover {
  background: #66b1ff;
}

.password-form {
  max-width: 600px;
}
</style>