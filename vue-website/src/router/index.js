// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import GuoMan from '../components/GuoMan.vue'
import RiMan from '../components/RiMan.vue'
import Search from '../components/Search.vue'
import Detailed from '../components/detailed/Detailed.vue'
import GuoManHome from '../views/GuoManHome.vue'
import RiManHome from '../views/RiManHome.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { index: 0, title: '首页' }
  },
  {
    path: '/guoman-home',
    name: 'guoman-home',
    component: GuoManHome,
    meta: { index: 1, title: '国漫' }
  },
  {
    path: '/riman-home',
    name: 'riman-home',
    component: RiManHome,
    meta: { index: 2, title: '日漫' }
  },
  {
    path: '/guoman',
    name: 'GuoMan',
    component: GuoMan,
    meta: { index: 10, title: '国漫列表' }
  },
  {
    path: '/riman',
    name: 'RiMan',
    component: RiMan,
    meta: { index: 11, title: '日漫列表' }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { index: 12, title: '搜索' }
  },
  {
    path: '/detail/:type/:id',
    name: 'Detailed',
    component: Detailed,
    meta: { index: 13, title: '详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} | 动漫门户`
  }
  next()
})

export default router