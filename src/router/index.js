import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Record from '../views/Record.vue'
import Categories from '../views/Categories.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表盘', icon: 'DashboardOutlined' }
  },
  {
    path: '/record',
    name: 'Record',
    component: Record,
    meta: { title: '记一笔', icon: 'PlusCircleOutlined' }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { title: '消费类型', icon: 'AppstoreOutlined' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '统计分析', icon: 'BarChartOutlined' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
