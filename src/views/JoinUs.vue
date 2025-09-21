<template>
  <div class="join-us-container">
    <Navbar />
    <main class="main-content">
      <h1 class="page-title">加入我们</h1>
      
      <section class="intro-section">
        <p>欢迎加入我们的团队！我们致力于为学生提供优质的毕业设计和论文指导服务。如果您有才华、有热情，欢迎成为我们的一员。</p>
      </section>
      
      <section class="benefits-section">
        <h2>为什么加入我们</h2>
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>专业成长</h3>
            <p>与优秀团队共事，提升专业技能和知识水平</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
              </svg>
            </div>
            <h3>灵活工作</h3>
            <p>享受灵活的工作时间和地点，平衡工作与生活</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>有竞争力的报酬</h3>
            <p>根据能力和贡献提供有竞争力的薪酬待遇</p>
          </div>
        </div>
      </section>
      
      <section class="positions-section">
        <h2>缺人！我们需要你！</h2>
       
        <div class="position-list" v-if="positions.length > 0">
          <div class="position-card" v-for="position in positions" :key="position.id">
            <div class="position-header">
              <h3>{{ position.position_name }}</h3>
              <span class="position-badge" :class="{ 'badge-fulltime': position.is_full_time === 1, 'badge-parttime': position.is_full_time === 0 }">{{ position.is_full_time === 1 ? '全职' : '兼职' }}</span>
              <span class="position-badge" :class="{ 'badge-active': position.is_closed === 0, 'badge-closed': position.is_closed === 1 }">{{ position.is_closed === 0 ? '招聘中' : '已停止' }}</span>
            </div>
            <p class="position-desc">{{ position.content }}</p>
            <div class="position-info">
              <p><span class="info-label">发布时间：</span>{{ formatDate(position.create_time) }}</p>
              <p><span class="info-label">发布人：</span>{{ position.publisher }}</p>
            </div>
            <div class="position-requirements">
              <h4>任职要求：</h4>
              <ul>
                <li v-for="(req, index) in position.requirements" :key="index">{{ req }}</li>
              </ul>
            </div>
            <button class="apply-button" :disabled="position.is_closed === 1" @click="applyForPosition(position.id, position.position_name)">
              {{ position.is_closed === 1 ? '已停止招聘' : '申请此职位' }}
            </button>
          </div>
        </div>
        <div class="no-result" v-else-if="!loading">
          没有找到符合条件的职位
        </div>
        <div class="loading-spinner" v-if="loading">
          加载中...
        </div>

        <div class="pagination" v-if="total > 0 && !loading">
          <button class="page-button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
          <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
          <button class="page-button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
        </div>
      </section>
      
    </main>
  </div>

  <!-- 遮罩层弹窗 -->
  <div class="modal-overlay" v-if="showApplicationForm" @click="showApplicationForm = false"></div>
  <div class="application-modal" v-if="showApplicationForm">
    <div class="modal-header">
      <h2>申请职位 - {{ selectedPositionName }}</h2>
      <button class="close-button" @click="showApplicationForm = false">×</button>
    </div>
    <div class="modal-body">
      <form class="application-form">
        <div class="form-group">
          <label for="name">姓名</label>
          <input type="text" id="name" name="name" v-model="formData.name" required>
        </div>
        
        <div class="form-group">
          <label for="phone">电话</label>
          <input type="tel" id="phone" name="phone" v-model="formData.phone" required>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="showApplicationForm = false" class="cancel-button">取消</button>
          <button type="button" @click="handleSubmit" class="submit-button">提交申请</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '../components/Navbar.vue';
import { ElMessage } from 'element-plus';
import axios from '../axios.js';

// 职位列表数据
const positions = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

// 搜索参数
const searchParams = ref({
  position_name: '',
  is_full_time: '',
  is_closed: ''
});

// 申请表单数据
const formData = ref({
  name: '',
  phone: ''
});

// 控制申请表单显示
const showApplicationForm = ref(false);
const selectedPositionId = ref(null);
const selectedPositionName = ref('');

// 获取职位列表
const fetchPositions = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchParams.value
    };

    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await axios.get('/recruitment/list', { params });
    positions.value = response.list;
    total.value = response.total;
    currentPage.value = response.page;
    pageSize.value = response.limit;
  } catch (error) {
    ElMessage.error('获取职位列表失败');
    console.error('获取职位列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchPositions();
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 申请职位
const applyForPosition = (id, name) => {
  selectedPositionId.value = id;
  selectedPositionName.value = name;
  showApplicationForm.value = true;

  // 重置表单
  formData.value = {
    name: '',
    phone: '',
    email: '',
    self_intro: '',
    resume_file: null
  };
};

// 提交申请
const handleSubmit = async () => {
  // 表单验证
  if (!formData.value.name || !formData.value.phone) {
    ElMessage.error('请填写必填项');
    return;
  }

  if (!selectedPositionName.value) {
    ElMessage.error('请选择要申请的职位');
    return;
  }

  loading.value = true;
  try {
    // 准备请求数据
    const requestData = {
      name: formData.value.name,
      phone: formData.value.phone,
      position: selectedPositionName.value
    };

    // 发送请求
    const response = await axios.post('/cooperation/apply', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 处理成功响应
    ElMessage.success(response.message);
    showApplicationForm.value = false;
  } catch (error) {
    // 处理错误
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('提交申请失败');
    }
    console.error('提交申请失败:', error);
  } finally {
    loading.value = false;
  }
};

// 初始加载职位列表
onMounted(() => {
  fetchPositions();
});
</script>

<style scoped>
.join-us-container {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin-top: 50px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.intro-section {
  margin-bottom: 40px;
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.benefits-section {
  margin-bottom: 40px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.benefit-card {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.benefit-card:hover {
  transform: translateY(-5px);
}

.benefit-icon {
  font-size: 24px;
  margin-bottom: 15px;
  color: #42b983;
}

.benefit-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.benefit-card p {
  color: #666;
  line-height: 1.5;
}

.positions-section {
  margin-bottom: 40px;
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-button {
  align-self: flex-end;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #359469;
}

.position-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.position-card {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.position-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.position-header h3 {
  font-size: 18px;
  margin: 0;
  color: #333;
  flex: 1;
}

.position-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-fulltime {
  background-color: #e6f7ff;
  color: #1890ff;
}

.badge-parttime {
  background-color: #fff7e6;
  color: #faad14;
}

.badge-active {
  background-color: #f0fff4;
  color: #52c41a;
}

.badge-closed {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.position-desc {
  margin-bottom: 15px;
  color: #666;
  line-height: 1.5;
}

.position-info {
  margin-bottom: 15px;
  font-size: 14px;
  color: #888;
}

.info-label {
  font-weight: 500;
  color: #555;
}

.position-requirements {
  margin-bottom: 20px;
  flex-grow: 1;
}

.position-requirements h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #444;
}

.position-requirements ul {
  padding-left: 20px;
  margin: 0;
}

.position-requirements li {
  margin-bottom: 5px;
  color: #666;
  line-height: 1.4;
}

.apply-button {
  padding: 10px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  width: 100%;
}

.apply-button:hover:not(:disabled) {
  background-color: #359469;
}

.apply-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 10px;
}

.page-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.page-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.no-result {
  text-align: center;
  padding: 30px;
  color: #999;
}

.loading-spinner {
  text-align: center;
  padding: 30px;
  color: #666;
}

.application-section {
  margin-top: 40px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.application-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit-button {
  padding: 10px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  flex: 1;
}

.submit-button:hover {
  background-color: #359469;
}

.cancel-button {
  padding: 10px 16px;
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  flex: 1;
}

.cancel-button:hover {
  background-color: #e9e9e9;
}

/* 遮罩层样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 弹窗样式 */
.application-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

/* 确保表单在弹窗中正确显示 */
.application-modal .application-form {
  margin-top: 0;
}

@media (max-width: 480px) {
  .application-modal {
    width: 95%;
  }
}


@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .search-button {
    align-self: stretch;
  }
  
  .position-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
    margin-top: 30px;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>