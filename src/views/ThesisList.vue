<template>
  <div class="thesis-list-container">
    <Navbar />
    <main class="main-content">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索论文..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">搜索</button>
        </div>
      </div>

      <div class="filter-container">
        <div class="filter-title">分类筛选</div>
        <div class="category-list">
          <button
            :class="{ 'active': selectedCategoryName === '' }"
            @click="selectCategory('')"
            class="category-btn"
          >
            全部
          </button>
          <div v-if="categoryLoading" class="loading">加载分类中...</div>
<div v-else-if="categoryError" class="category-error">{{ categoryError }}</div>
<div v-else-if="categories.length === 0" class="no-categories">暂无分类数据</div>
<div v-else-if="showAllCategories" class="expanded-categories">
  <button
    v-for="category in categories"
    :key="category.id"
    :class="{ 'active': selectedCategoryName === category.name }"
    @click="selectCategory(category.name)"
    class="category-btn"
  >
    {{ category.name }}
  </button>
            <button
              class="expand-btn" 
              :class="{ 'active': showAllCategories }"
              @click="toggleCategories"
            >
              收起 <i class="arrow-icon"></i>
            </button>
          </div>
          <div v-else class="collapsed-categories">
  <button
    v-for="category in visibleCategories"
    :key="category.id"
    :class="{ 'active': selectedCategoryName === category.name }"
    @click="selectCategory(category.name)"
    class="category-btn"
  >
    {{ category.name }}
  </button>
            <button
              class="expand-btn"
              :class="{ 'active': showAllCategories }"
              @click="toggleCategories"
            >
              更多 <i class="arrow-icon"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="thesis-list-section">
        <div class="section-title">论文写作参考库<p style="color:red;font-size:12px">注:“仅供学习研究使用，禁止直接抄袭或提交”</p></div>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="theses.length === 0" class="no-data">暂无数据</div>
        <ul class="thesis-items">
          <li
            v-for="thesis in theses"
            :key="thesis.id"
            class="thesis-item"
          >
            <div class="thesis-title" @click="viewThesisDetail(thesis.id)">{{ thesis.title }}</div>
            <div class="thesis-meta">
              <span>{{ thesis.publisher }}</span>
              <span>{{ formatDate(thesis.publish_time) }}</span>
              <span>{{ thesis.category_name }}</span>
            </div>
            <div class="thesis-abstract">{{ thesis.abstract }}</div>
            <div class="thesis-stats">
              <span class="stat-item"><i class="icon-view"></i> {{ thesis.views }} 浏览</span>
              <span class="stat-item"><i class="icon-like"></i> {{ thesis.likes }} 点赞</span>
              <span class="stat-item"><i class="icon-favorite"></i> {{ thesis.favorites }} 收藏</span>
            </div>
            <div class="thesis-actions">
              <button class="action-btn view-btn" @click.stop="viewThesisDetail(thesis.id)">查看详情</button>
              <button class="action-btn download-btn" @click.stop="downloadThesis(thesis.thesis_file)">下载论文</button>
            </div>
          </li>
        </ul>

        <div class="pagination" v-if="total > 0">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '/src/components/Navbar.vue';
import axios from '../axios';
import { ElMessage } from 'element-plus';


const router = useRouter();
const theses = ref([]);
const loading = ref(false);
const searchKeyword = ref('');

// 获取事件总线
const { appContext } = getCurrentInstance();
const emitter = appContext.config.globalProperties.emitter;

const categories = ref([]);
const categoryLoading = ref(false);
const categoryError = ref(null);

// 从后端API获取分类数据
const fetchCategories = async () => {
  categoryLoading.value = true;
  categoryError.value = null;
  try {
    const response = await axios.get('/category/list');
    // 按sort字段排序分类
    categories.value = response.sort((a, b) => a.sort - b.sort);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    categoryError.value = '获取分类失败，请刷新页面重试';
    ElMessage.error('获取分类列表失败');
  } finally {
    categoryLoading.value = false;
  }
};

const selectedCategoryName = ref(''); // 空字符串表示全部
const currentPage = ref(1);
const limit = ref(10); // 每页数量，对应接口的limit
const total = ref(0);
const totalPages = ref(0);
const showAllCategories = ref(false);
const initialVisibleCount = 8; // 默认显示的分类数量

// 计算可见的分类（默认只显示一部分）
const visibleCategories = computed(() => {
  return categories.value.slice(0, initialVisibleCount);
});

// 切换分类展开/折叠状态
const toggleCategories = () => {
  showAllCategories.value = !showAllCategories.value;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 获取论文列表
const fetchTheses = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: limit.value,
      title:searchKeyword.value
    };

    // 添加搜索关键词
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    // 添加分类筛选
    if (selectedCategoryName.value) {
      params.category_name = selectedCategoryName.value;
    }

    const res = await axios.get('/thesis/list', { params });
    theses.value = res.list || []; // 接口返回的列表在list字段中
    total.value = res.total || 0;
    totalPages.value = Math.ceil(total.value / limit.value);
  } catch (e) {
    console.error('获取论文列表失败:', e);
    ElMessage.error('获取论文列表失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 搜索论文
const handleSearch = () => {
  currentPage.value = 1;
  fetchTheses();
};

// 选择分类
const selectCategory = (categoryName) => {
  console.log('选择分类:', categoryName);
  selectedCategoryName.value = categoryName;
  currentPage.value = 1;
  fetchTheses();
};

// 切换页码
const changePage = (page) => {
  currentPage.value = page;
  fetchTheses();
};

// 查看论文详情
const viewThesisDetail = (id) => {
  router.push(`/thesis-detail/${id}`);
};

// 下载论文
const downloadThesis = (fileUrl) => {
  if (!fileUrl) {
    ElMessage.warning('论文文件不存在');
    return;
  }
  // 创建一个临时链接来触发下载
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileUrl.split('/').pop() || 'thesis.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 监听专业切换事件
const handleMajorChange = (majorName) => {
  console.log('ThesisList: 收到专业切换事件:', majorName);
  
  // 重新获取分类数据
  fetchCategories().then(() => {
    // 设置新的选中分类
    selectedCategoryName.value = majorName;
    console.log('ThesisList: 设置选中分类为:', selectedCategoryName.value);
    // 重置页码并重新获取数据
    currentPage.value = 1;
    fetchTheses();
  });
};

onMounted(async () => {
  await fetchCategories();
  
  // 监听专业切换事件
  if (emitter) {
    emitter.on('select-category', handleMajorChange);
  }
  
  // 从localStorage获取当前选择的专业
  const selectedMajorStr = localStorage.getItem('selectedMajor');
  if (selectedMajorStr) {
    try {
      const selectedMajor = JSON.parse(selectedMajorStr);
      // 如果存在选择的专业且分类已加载完成
      if (selectedMajor && selectedMajor.name && categories.value.length > 0) {
        // 查找是否存在匹配的分类
        const matchedCategory = categories.value.find(cat => cat.name === selectedMajor.name);
        if (matchedCategory) {
          selectedCategoryName.value = selectedMajor.name;
        }
      }
    } catch (e) {
      console.error('解析selectedMajor失败:', e);
    }
  }
  fetchTheses();
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  if (emitter) {
    emitter.off('select-category', handleMajorChange);
  }
});
</script>

<style scoped>
.thesis-list-container {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  margin-top:50px;
}

.search-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-input-wrapper {
  display: flex;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  outline: none;
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.search-button {
  padding: 0 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.2s;
}

.search-button:hover {
  background-color: #359469;
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(0);
}

.filter-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.filter-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.category-btn {
  padding: 8px 16px;
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  color: #555;
  position: relative;
  overflow: hidden;
}

.category-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.category-btn:hover::before {
  left: 100%;
}

.category-btn:hover:not(.active) {
  background-color: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border-color: #d0d0d0;
}

.loading, .category-error, .no-categories {
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
}

.category-error {
  color: #f56c6c;
}

.no-categories {
  color: #909399;
}

.category-btn.active {
  background-color: #42b983 !important;
  color: white !important;
  border-color: #42b983 !important;
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.3) !important;
  transform: translateY(-1px) !important;
}

.category-btn.active:hover {
  background-color: #359469 !important;
  color: white !important;
  border-color: #359469 !important;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4) !important;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.expanded-categories, .collapsed-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

.expand-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.expand-btn:hover::before {
  left: 100%;
}

.expand-btn:hover {
  background-color: #359469;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.3);
}

.expand-btn:active {
  transform: translateY(0);
}

.arrow-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid white;
  transition: transform 0.3s ease;
}

/* 展开时旋转箭头 */
.expand-btn.active .arrow-icon {
  transform: rotate(180deg);
}

.thesis-list-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.loading, .no-data {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.thesis-items {
  list-style: none;
  padding: 0;
}

.thesis-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.thesis-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.thesis-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s;
}

.thesis-title:hover {
  color: #42b983;
}

.thesis-meta {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 14px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.thesis-abstract {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}

.thesis-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-view, .icon-like, .icon-favorite {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-view {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
}

.icon-like {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M12 20.85l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.04L12 20.85z"></path></svg>');
}

.icon-favorite {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>');
}

.thesis-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  border: none;
}

.view-btn {
  background-color: #42b983;
  color: white;
}

.view-btn:hover {
  background-color: #359469;
}

.download-btn {
  background-color: #f0f0f0;
  color: #666;
}

.download-btn:hover {
  background-color: #e0e0e0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-btn {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.07);
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  color: #666;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }

  .thesis-list-container {
    padding-top: 100px;
  }

  .filter-container {
    overflow-x: auto;
  }

  .category-list {
    width: max-content;
    min-width: 100%;
  }

  .thesis-meta {
    flex-direction: column;
    gap: 5px;
  }

  .thesis-stats {
    flex-wrap: wrap;
  }

  .thesis-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>