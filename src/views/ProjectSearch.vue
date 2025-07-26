<template>
  <div class="project-search-container">
    <Navbar />
    <!-- 头部搜索栏 -->
    <div class="search-header">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索项目..." class="search-input">
        <button class="search-button" @click="fetchProjectList">搜索</button>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tags">
      <div v-for="category in categories" :key="category.id" :class="['tag-item', { 'active': activeCategory === category.name }]" @click="activeCategory = category.name">
        {{ category.name }}
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="latest-list">
        <div v-if="contentList.length === 0" class="empty-content">
          当前版块未上内容
        </div>
      <router-link v-for="item in contentList" :key="item.id" :to="'/content-detail/' + item.id" class="item-link">
        <div class="latest-item">
          <div class="item-cover">
            <img :src="item.cover" alt="项目封面" class="cover-img" />
            
          </div>
          <div class="item-content">
            <div class="item-header">
              <div class="item-tag">{{ item.category }}</div>
              <h3 class="item-title">{{ item.title }}</h3>
            </div>
            <p class="item-features">{{ item.features }}</p>
            <div class="item-meta">
              <span class="meta-item"><i class="el-icon-eye"></i> {{ item.views }}次浏览</span>
              <span class="meta-item"><i class="el-icon-date"></i> {{ formatDate(item.time) }}</span>
              <span class="meta-item"><i class="el-icon-comment"></i> 评论(0)</span>
              <span class="meta-item"><i class="el-icon-thumb"></i> 赞(0)</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Navbar from '/src/components/Navbar.vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from '../axios';

const router = useRouter();
const searchQuery = ref('');
const activeCategory = ref('全部');
const contentList = ref([]);

// 分类标签数据
const categories = ref([]);

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/category/list');
    // 过滤状态为1的分类并按sort排序
    const validCategories = response
      .filter(cat => cat.status === 1)
      .sort((a, b) => a.sort - b.sort);
    // 添加"全部"选项到开头
    categories.value = [{ id: 'all', name: '全部' }, ...validCategories];
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类失败，请稍后重试');
  }
};

// 页面加载时获取分类数据
fetchCategories();

// 过滤内容列表


// 日期格式化
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 获取内容列表数据
const currentPage = ref(1);
const total = ref(0);

// 获取项目列表数据
const fetchProjectList = async () => {
  try {
    // 构建查询参数
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('keyword', searchQuery.value);
    const selectedCategory = categories.value.find(cat => cat.name === activeCategory.value);
    if (selectedCategory && selectedCategory.id !== 'all') {
      params.append('category', selectedCategory.name);
    }
    params.append('page', currentPage.value);
    params.append('limit', 10);

    const response = await axios.get(`/content/list?${params.toString()}`);
    console.log(response)
    // 添加API响应数据检查
  
    
    contentList.value = response;
   
  } catch (error) {
    console.error('获取内容列表失败:', error);
    ElMessage.error('获取内容失败，请稍后重试');
  }
};

// 监听搜索条件变化，触发数据加载
watch([searchQuery, activeCategory], () => {
  // 重置页码为1
  currentPage.value = 1;
  fetchProjectList();
}, { immediate: true });

// 页面加载时获取数据
fetchProjectList();
</script>

<style scoped>
.project-search-container {
  margin-top: 110px;

  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
  text-align: center;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px 0 0 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #409eff;
}

.search-button {
  padding: 0 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #337ecc;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top:100px;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.tag-item {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  margin-right: 10px;
}

.tag-item.active {
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-2px);
}

.tag-item:hover:not(.active) {
  background-color: #e9e9e9;
  transform: translateY(-1px);
}

/* 空内容提示样式 */
.empty-content {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-size: 16px;
}

/* 复用Home.vue中的列表样式 */
.latest-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.item-link {
  text-decoration: none;
  color: inherit;
}

.latest-item {
  display: flex;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  transition: box-shadow 0.3s;
}

.latest-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.item-cover {
  width: 160px;
  height: 120px;
  flex-shrink: 0;
  margin-right: 20px;
}

.cover-img {
  width: 180px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}



.item-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #303133;
  transition: color 0.2s;
}

.item-title:hover {
  color: #409eff;
}

.item-features {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.latest-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.latest-item {
  display: flex;
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.item-cover {
  position: relative;
  flex-shrink: 0;
}

.item-tag {
  padding: 3px 10px;
  background-color: #f0f7ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.item-title {
  font-size: 18px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
}

.item-features {
  margin-top: 10px;
  font-size: 14px;
  color: #4e5969;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>