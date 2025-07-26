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
          <li>什么？我们的毕业设计成品你还不会用？购买成品必看</li>
          <li>好消息：学习源码分享群，你值得进入</li>
          <li>100套计算机专业毕业设计指导，免费获取</li>
          <li>计算机毕业设计论文写作技巧【精华总结】</li>
          <li>计算机毕业设计防骗指南</li>
        </ul>
      </div>
      <div class="member-center">
        <div class="member-title">本站项目 提供项目售后答疑</div>
        <div class="member-desc">孙猴子源码<br/>专注毕业设计8年，做优质的毕业设计指南<br/>如有需要，可点击下方任意方式找到我们</div>
        <div class="member-links">
          <span>微信</span> <span>QQ</span> <span>GitHub</span> <span>B站</span>
        </div>
      </div>
    </section>
    <!-- 热门必读 -->
    <section class="hot-section">
      <div class="hot-title">【热门必读】什么？我们的毕业设计成品你还不会用？购买成品必看</div>
      <div class="hot-desc">计算机毕业设计的成品不能用成品，该如何使用成品，很多同学没有概念，或者理解不全，今天我们就详细聊一下。另外不管你是不是购买过我们的系统，只要你是在做毕业设计，都可以借鉴。</div>
    </section>
    <!-- 最新发布 -->
    <section class="latest-section">
      <div class="latest-title">最新发布</div>
      <div class="latest-list">
        <router-link v-for="item in contentList" :key="item.id" :to="'/content-detail/' + item.id" class="item-link">
          <div class="latest-item">
            <div class="item-cover">
              <img :src="item.cover" alt="项目封面" class="cover-img" />
            </div>
            <div>
              <div style='display:flex;flex-direction:row;justify-content:space-between'>
                <div style='display:flex'>
                  <div class="item-tag">{{ item.category }}</div>
                  <div class="item-title">{{ item.title }}</div>
                </div>
                <div class="item-meta">{{ formatDate(item.time) }} | 孙猴子源码 | 评论(0) | 赞(0)</div>
              </div>
              <div class="item-features">{{ item.features }}</div>
            </div>
          </div>
        </router-link>
      </div>
    </section>
    <!-- 底部横幅 -->
    <footer class="footer-banner">
      成品+代码讲解视频+演示视频+远程调试成功+软件，堪比定做。
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '/src/components/Navbar.vue';
import { useRouter } from 'vue-router'
import axios from '../axios'

const banners = ref([])
const currentIndex = ref(0)
let timer = null
const contentList = ref([])
const userInfo = ref(null)
const router = useRouter()

const fetchBanners = async () => {
  try {
    const res = await axios.get('/banner/list')
    console.log(res)

    banners.value = res
  } catch (e) {
    banners.value = []
  }
}

const fetchContentList = async () => {
  try {
    const res = await axios.get('/content/list')
    console.log(res)
    contentList.value = res
  } catch (e) {
    console.error('Failed to fetch content list:', e)
    contentList.value = []
  }
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toISOString().split('T')[0]
}

const next = () => {
  if (!banners.value.length) return
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
}
const prev = () => {
  if (!banners.value.length) return
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
}

const startAutoPlay = () => {
  timer = setInterval(next, 3000)
}
const stopAutoPlay = () => {
  if (timer) clearInterval(timer)
}

const handleLogout = () => {
  // 清除本地存储

  localStorage.removeItem('user')
  userInfo.value = null
  // 清除axios默认headers
  delete axios.defaults.headers.common['Authorization']
  // 重定向到登录页
  router.push('/login')
}

onMounted(() => {
  fetchBanners()
  fetchContentList()
  startAutoPlay()
  // 从localStorage获取用户信息
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})
</script>

<style scoped>
.home-container {
  margin-top: 110px;

  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background: #f7f8fa;
  color: #333;
  width: 100vw;
  min-width: 0;
  max-width: 100vw;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  padding: 8px 32px;
  font-size: 14px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.header .auth-link {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

.auth-link:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 8px;
  color: #ccc;
}
.main-nav {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16px 32px;
  border-bottom: 1px solid #eee;
}
.logo {
  display: flex;
  align-items: center;
}
.logo img {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}
.site-title {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
}
.nav-list {
  display: flex;
  margin-left: 40px;
  list-style: none;
  gap: 32px;
}
.nav-list li {
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: color 0.2s;
}
.nav-list li:hover {
  color: #409eff;
}
.banner {
  background: #ffb84d;
  padding: 32px 0 24px 0;
  display: flex;
  justify-content: center;
}
.carousel-wrapper {
  width: 700px;
  min-height: 220px;
  position: relative;
  background: #222d4a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel {
  width: 100%;
  height: 100%;
  position: relative;
}
.carousel-item {
  width: 100%;
  height: 100%;
  position: relative;
}
.carousel-item {
  width: 100%;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 1;
}
.carousel-item.active {
  opacity: 1;
  z-index: 2;
}
.carousel-img {
  width: 650px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.carousel-title {
  color: #fff;
  margin-top: 8px;
  font-size: 16px;
  text-align: center;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 22px;
  cursor: pointer;
  z-index: 3;
  transition: background 0.2s;
}
.carousel-btn:hover {
  background: rgba(0,0,0,0.5);
}
.carousel-btn.prev {
  left: 12px;
}
.carousel-btn.next {
  right: 12px;
}
.carousel-loading {
  color: #fff;
  font-size: 18px;
  text-align: center;
  width: 100%;
}
.info-section {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 24px 0;
}
.notice, .member-center {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  min-width: 320px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.notice-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #409eff;
}
.notice ul {
  padding-left: 18px;
  font-size: 14px;
  color: #666;
}
.member-title {
  color: #b48be7;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 16px;
}
.member-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.member-links span {
  margin-right: 10px;
  color: #409eff;
  cursor: pointer;
}
.hot-section {
  background: #fff;
  margin: 0 32px 24px 32px;
  border-radius: 8px;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.hot-title {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}
.hot-desc {
  color: #666;
  font-size: 14px;
}
.latest-section {
  background: #fff;
  margin: 0 32px 24px 32px;
  border-radius: 8px;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.latest-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.latest-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.latest-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #eee;
  gap: 16px;
}
.item-cover {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.item-tag {
  display: inline-block;
  margin-right: 8px;
  padding: 4px 8px;
  background: #f0f2f5;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}
.item-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}
.item-meta {
  font-size: 12px;
  color: #999;
}
.item-features {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}
.item-desc {
  font-size: 14px;
  color: #666;
}
.footer-banner {
  background: #4d9aff;
  color: #fff;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  margin-top: 24px;
  border-radius: 0 0 8px 8px;
}
</style>