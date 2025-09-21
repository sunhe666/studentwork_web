import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://bishe.asia', // 更新为新的后端API地址
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // 如果token存在，则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default instance