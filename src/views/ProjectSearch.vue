<template>
  <div class="project-search-container">
    <Navbar />    <!-- 头部搜索栏 -->
    <div class="search-header">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索项目..." class="search-input">
        <button class="search-button" @click="fetchProjectList">搜索</button>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tags">
      <div v-for="category in displayedCategories" :key="category.id" :class="['tag-item', { 'active': activeCategory === category.name }]" @click="activeCategory = category.name">
        {{ category.name }}
      </div>
      <button v-if="categories.length > TAG_LIMIT" class="expand-btn" @click="toggleExpand">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
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
import { ref, onMounted, watch,computed } from 'vue';
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
    categories.value = [ ...validCategories];
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类失败，请稍后重试');
  }
};

// 页面加载时获取分类数据
fetchCategories();

// 页面挂载时设置默认分类
onMounted(() => {
  const storedMajor = localStorage.getItem('selectedMajor');
  if (storedMajor) {
    try {
      const selectedMajor = JSON.parse(storedMajor);
      if (selectedMajor && selectedMajor.name) {
        activeCategory.value = selectedMajor.name;
      }
    } catch (e) {
      console.error('解析专业数据失败:', e);
    }
  }
});

// 日期格式化
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 获取内容列表数据
const currentPage = ref(1);
const total = ref(0);

// 获取项目列表数据
const TAG_LIMIT = 5;
const isExpanded = ref(false);

const displayedCategories = computed(() => {
  if (isExpanded.value) return categories.value;
  return categories.value.slice(0, TAG_LIMIT);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const fetchProjectList = async () => {
  try {
    // 构建查询参数
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('keyword', searchQuery.value);
    // 优先使用用户选择的分类标签
    const selectedCategory = categories.value.find(cat => cat.name === activeCategory.value);
    if (selectedCategory && selectedCategory.id !== 'all') {
      params.append('category', selectedCategory.name);
    } else {
      // 否则使用选择的专业
      const selectedMajorStr = localStorage.getItem('selectedMajor');
      if (selectedMajorStr) {
        try {
          const selectedMajor = JSON.parse(selectedMajorStr);
          if (selectedMajor && selectedMajor.name) {
            params.append('category', selectedMajor.name);
          }
        } catch (e) {
          console.error('解析selectedMajor失败:', e);
        }
      }
    }
    params.append('page', currentPage.value);
    params.append('limit', 10);

    const response = await axios.get(`/content/list?${params.toString()}`);
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-top: 120px;
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
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}

.expand-btn {
   padding: 6px 8px;
   border: none;
   border-radius: 16px;
   background: #f0f0f0;
   color: #666;
   cursor: pointer;
   font-size: 14px;
   white-space: nowrap;
   transition: all 0.2s;
   margin-left: 8px;
}

.expand-btn:hover {
   background: #e0e0e0;
   color: #333;
   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.expand-btn:active {
   background: #d0d0d0;
}

.tag-item {
   padding: 6px 12px;
   border-radius: 16px;
   cursor: pointer;
   transition: all 0.2s;
   background: #f0f0f0;
   &.active {
     background: #409eff;
     color: white;
   }
   &:hover:not(.active) {
     background: #e0e0e0;
   }
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

/* 列表样式 */
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

/* 响应式样式 */
@media (max-width: 768px) {
  .project-search-container {
    padding: 15px;
  }
  
  .search-header {
    margin-top: 100px;
    margin-bottom: 20px;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .search-input {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .search-button {
    padding: 0 16px;
  }
  
  .category-tags {
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .tag-item {
    padding: 6px 12px;
    font-size: 12px;
    margin-right: 8px;
  }
  
  .latest-item {
    flex-direction: column;
    padding: 15px;
  }
  
  .item-cover {
    width: 100%;
    height: 180px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .cover-img {
    width: 100%;
    height: 100%;
  }
  
  .item-content {
    padding: 0;
  }
  
  .item-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .item-title {
    font-size: 16px;
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .project-search-container {
    padding: 10px;
  }
  
  .search-header {
    margin-top: 130px;
  }
  
  .search-input {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .search-button {
    padding: 0 12px;
    font-size: 13px;
  }
  
  .tag-item {
    padding: 5px 10px;
    font-size: 11px;
  }
  
  .empty-content {
    padding: 30px 0;
    font-size: 14px;
  }
  
  .item-cover {
    height: 150px;
  }
  
  .item-title {
    font-size: 15px;
  }
  
  .item-features {
    font-size: 13px;
  }
  
  .item-meta {
    font-size: 11px;
    gap: 8px;
  }
}
</style>