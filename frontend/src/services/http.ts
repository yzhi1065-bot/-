import axios from 'axios'
import { message } from 'antd'
import { API_BASE_URL } from './api'

const request = axios.create({
  baseURL: '',
  timeout: 30000,
})

// 请求拦截器 - 添加Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail
    const responseData = error.response?.data

    // 打印详细错误到控制台
    console.error('API Error:', status, responseData)

    switch (status) {
      case 401:
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        message.error('登录已过期，请重新登录')
        break
      case 403:
        message.error('没有权限执行此操作')
        break
      case 404:
        message.error(detail || '请求的资源不存在')
        break
      case 422:
        console.warn('422 Error Detail:', responseData)
        message.error('输入数据格式有误: ' + (detail ? JSON.stringify(detail) : ''))
        break
      case 500:
        message.error('服务器内部错误，请稍后重试')
        break
      default:
        message.error(detail || '网络请求失败')
    }
    return Promise.reject(error)
  },
)

export default request
