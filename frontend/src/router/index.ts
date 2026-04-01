import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import UserLoginPage from '@/views/user/UserLoginPage.vue'
import UserRegisterPage from '@/views/user/UserRegisterPage.vue'
import UserManagePage from '@/views/admin/UserManagePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
    },
    {
      path: '/create',
      name: '创作文章',
      component: () => import('@/views/article/ArticleCreatePage.vue'),
    },
    {
      path: '/article/list',
      name: '文章列表',
      component: () => import('@/views/article/ArticleListPage.vue'),
    },
    {
      path: '/article/:taskId',
      name: '文章详情',
      component: () => import('@/views/article/ArticleDetailPage.vue'),
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },
    {
      path: '/admin/statistics',
      name: '数据分析',
      component: () => import('@/views/admin/StatisticsPage.vue'),
    },
    {
      path: '/vip',
      name: '会员购买',
      component: () => import('@/views/VipPage.vue'),
    },
  ],
})

export default router
