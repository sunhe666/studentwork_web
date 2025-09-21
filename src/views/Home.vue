<template>
  <div class="home-container">
    <Navbar />
    <!-- 轮播图 -->
    <section class="banner">
      <div class="carousel-wrapper">
        <div v-if="banners.length" class="carousel">
          <div
            v-for="(item, idx) in banners"
            :key="item.id"
            class="carousel-item"
            :class="{ active: idx === currentIndex }"
            v-show="idx === currentIndex"
          >
            <img :src="item.image_url" :alt="item.title" class="carousel-img" />
            <div class="carousel-title">{{ item.title }}</div>
          </div>
         
          <button class="carousel-btn prev" @click="prev">‹</button>
          <button class="carousel-btn next" @click="next">›</button>
        </div>
        <div v-else class="carousel-loading">加载中...</div>
      </div>
    </section>
    <!-- 公告栏和会员中心 -->
    <section class="info-section">
      <div class="notice">
        <div class="notice-title">网站公告</div>
        <ul>
          <li v-for="(item, index) in announcements" :key="item.id" @click="viewAnnouncementDetail(item.id)">
            {{ item.title }}
          </li>
          <li v-if="!announcements.length" class="loading">加载中...</li>
        </ul>
      </div>
      <div class="member-center">
        <div class="member-title">本站项目售后答疑，全程护航你的毕设之路</div>
        <div class="member-desc">8年深耕毕设领域，从机械图纸到代码编程，从论文框架到实验数据分析<br/>不管你是工科生、文科生、医学生还是艺术生，这里都有专属解决方案<br/>点击下方按钮，随时找到懂你的毕设搭子～</div>
        <div class="member-links">
          <span @click="copyWechatId">微信</span> <span @click="copyQQId">QQ</span>
        </div>
      </div>
    </section>

    <!-- 最新发布 -->
    <section class="latest-section">
      <div class="latest-title">最新发布</div>
        <div>
          <div v-if="contentList.length" class="latest-list">
            <router-link v-for="item in contentList" :key="item.id" :to="'/content-detail/' + item.id" class="item-link">
            <div class="latest-item">
              <div class="item-cover">
                <img :src="item.cover" alt="项目封面" class="cover-img" />
              </div>
              <div class="item-content">
                <div class="item-header">
                  <div class="item-tag">{{ item.category }}</div>
                  <div class="item-title">{{ item.title }}</div>
                </div>
                <div class="item-meta">{{ formatDate(item.time) }} | 港城源码 | 评论(0) | 赞(0)</div>
                <div class="item-features">{{ item.features }}</div>
              </div>
            </div>
          </router-link>
          </div>
           <div v-else class="no-content">目前该专业暂未更新相关内容，我们正在全力补充完善中，敬请期待哦～</div>
        </div>
    </section>
    <!-- 底部横幅 -->
    <footer class="footer-banner">
      在这里，看见每一份毕业设计里的独特锋芒
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted,onUnmounted, getCurrentInstance } from 'vue';
import Navbar from '/src/components/Navbar.vue';
import { useRouter } from 'vue-router'
import axios from '../axios'

const banners = ref([])
const currentIndex = ref(0)
let timer = null
const { appContext } = getCurrentInstance()
const emitter = appContext.config.globalProperties.emitter
const contentList = ref([])
const userInfo = ref(null)
const announcements = ref([])
const router = useRouter()

const fetchBanners = async () => {
  try {
    const res = await axios.get('/banner/list')
    banners.value = res
  } catch (e) {
    console.error('获取轮播图失败:', e)
  }
}

const fetchContentList = async (category) => {
  try {
    let res;
    if(category){
   res = await axios.get('/content/list', { 
      params: { category } 
    })
    }else{
      const storedMajor = JSON.parse(localStorage.getItem('selectedMajor'));
      res = await axios.get('/content/list', { 
        params: { category: storedMajor?.name || '' } 
      })
    }
    
    contentList.value = res
  } catch (e) {
    console.error('获取内容列表失败:', e)
  }
}

const fetchAnnouncements = async () => {
  try {
    const res = await axios.get('/announcement/list')
    announcements.value = res.data
  } catch (e) {
    console.error('获取公告列表失败:', e)
  }
}

const viewAnnouncementDetail = (id) => {
  router.push(`/announcement/${id}`)
}

const formatDate = (time) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
}

const startTimer = () => {
  timer = setInterval(() => {
    next()
  }, 5000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  fetchBanners()
  fetchContentList()
  fetchAnnouncements()
  startTimer()

  emitter.on('select-category', (categoryId) => {
    fetchContentList(categoryId)
  })

  // 检查本地存储中的用户信息
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

onUnmounted(() => {
  stopTimer()
})

// 复制微信号到剪贴板
const copyQQId = () => {
  navigator.clipboard.writeText('1816137925').then(() => {
    alert('QQ号复制成功耶');
  });
};

const copyWechatId = () => {
  navigator.clipboard.writeText('my-name-sunhe')
    .then(() => {
      alert('微信号已复制成功耶')
    })
    .catch(err => {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制: sunhe-666')
    })
}
</script>

<style scoped>
.home-container {
  padding-top: 150px; /* 为导航栏留出空间 */
  min-height: 100vh;
}

/* 轮播图样式 */
.banner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

.carousel-wrapper {
  width: 100%;
  height: 400px;
  position: relative;
}

.carousel {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-item {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.5s;
  opacity: 0;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 15px 20px;
  font-size: 18px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;
}

.carousel-btn:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.carousel-loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
}

/* 公告栏和会员中心 */
.info-section {
  max-width: 1200px;
  margin: 30px auto;
  display: flex;
  gap: 20px;
}

.notice {
  flex: 2;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}

.notice-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.notice ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice li {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  cursor: pointer;
  transition: color 0.3s;
}

.notice li:hover {
  color: #42b983;
}

.member-center {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.member-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.member-desc {
  margin-bottom: 20px;
  color: #666;
}

.member-links {
  display: flex;
  gap: 15px;
}

.member-links span {
  cursor: pointer;
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.member-links span:hover {
  background-color: #359469;
}

/* 热门必读 */
.hot-section {
  max-width: 1200px;
  margin: 30px auto;
  background-color: #fff7e6;
  border-radius: 8px;
  padding: 25px;
}

.hot-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #e67e22;
}

.hot-desc {
  line-height: 1.6;
  color: #666;
}

/* 最新发布 */
.latest-section {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 15px;
}

.latest-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #42b983;
  display: inline-block;
}

.latest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.no-content {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin: 20px;
}

.item-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: calc((100% - 20px) / 2);
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.latest-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  height: 180px;
  width: 100%;
}

.latest-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.item-cover {
  width: 200px;
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.item-tag {
  background-color: #42b983;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 12px;
  color: #999;
  margin-top: auto;
  margin-bottom: 8px;
}

.item-features {
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部横幅 */
.footer-banner {
  max-width: 1200px;
  margin: 50px auto 0;
  background-color: #42b983;
  color: white;
  text-align: center;
  padding: 25px;
  font-size: 18px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 60px;
}

/* 响应式样式 */
@media (min-width: 1200px) {
  .latest-section {
    padding: 0;
  }
  .latest-list {
    gap: 25px;
  }
  .item-link {
    width: calc((100% - 25px) / 2);
  }
}

@media (min-width: 769px) and (max-width: 1199px) {
  .latest-list {
    gap: 20px;
  }
  .item-link {
    width: calc((100% - 20px) / 2);
  }
}

@media (max-width: 768px) {
  .home-container {
    padding-top: 130px;
  }
  
  .carousel-wrapper {
    height: 250px;
  }
  
  .carousel-title {
    font-size: 16px;
    padding: 12px 15px;
  }
  
  .carousel-btn {
    width: 30px;
    height: 30px;
    font-size: 18px;
  }
  
  .info-section {
    flex-direction: column;
  }
  
  .notice, .member-center {
    width: 100%;
  }
  
  .member-center {
    margin-top: 20px;
  }
  
  .hot-section {
    padding: 20px;
  }
  
  /* 最新发布列表响应式调整 */
  .latest-list {
    flex-direction: column;
    gap: 15px;
  }
  .item-link {
    width: 100%;
  }
  .latest-item {
    flex-direction: column;
    height: auto;
  }
  
  .item-cover {
    width: 100%;
    height: 160px;
  }
  
  .item-content {
    padding: 12px;
  }
  
  .item-title {
    font-size: 15px;
    margin-top: 8px;
    white-space: normal;
    overflow: visible;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
  }
  
  .item-features {
    font-size: 13px;
    -webkit-line-clamp: 3;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding-top: 110px;
  }
  
  .carousel-wrapper {
    height: 180px;
  }
  
  .latest-title {
    font-size: 18px;
  }
  
  .item-cover {
    height: 140px;
  }
  
  .item-title {
    font-size: 14px;
  }
  
  .item-features {
    font-size: 12px;
  }
}
</style>