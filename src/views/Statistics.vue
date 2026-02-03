<template>
  <div class="statistics-page">
    <!-- 时间维度切换 -->
    <a-row class="tabs-row">
      <a-col :span="24">
        <div class="tabs-card app-card">
          <a-radio-group v-model:value="timeRange" size="large" button-style="solid">
            <a-radio-button value="week"><CalendarOutlined /> 本周</a-radio-button>
            <a-radio-button value="month"><BarChartOutlined /> 本月</a-radio-button>
            <a-radio-button value="year"><LineChartOutlined /> 本年</a-radio-button>
          </a-radio-group>

          <a-range-picker
            v-model:value="customDateRange"
            class="date-picker"
            @change="handleCustomDateChange"
          />
        </div>
      </a-col>
    </a-row>

    <!-- 统计概览 -->
    <a-row :gutter="[24, 24]" class="overview-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="overview-card app-card">
          <div class="overview-label">总支出</div>
          <div class="overview-value">{{ formatMoney(currentStats.total) }}</div>
          <div v-if="currentStats.compare !== null" class="overview-compare" :class="compareClass">
            <ArrowUpOutlined v-if="currentStats.compare > 0" />
            <ArrowDownOutlined v-else />
            {{ Math.abs(currentStats.compare).toFixed(1) }}% 较上期
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="overview-card app-card">
          <div class="overview-label">记录笔数</div>
          <div class="overview-value">{{ currentStats.count }} 笔</div>
          <div class="overview-sub">平均 {{ formatMoney(currentStats.avg) }}/笔</div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="overview-card app-card">
          <div class="overview-label">最高单笔</div>
          <div class="overview-value">{{ formatMoney(currentStats.max) }}</div>
          <div class="overview-sub">{{ currentStats.maxCategory }}</div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="overview-card app-card">
          <div class="overview-label">主要支出类型</div>
          <div class="overview-value" :style="{ fontSize: '20px', color: topCategoryColor }">
            {{ currentStats.topCategory }}
          </div>
          <div class="overview-sub">占比 {{ currentStats.topCategoryPercent }}%</div>
        </div>
      </a-col>
    </a-row>

    <!-- 图表区 -->
    <a-row :gutter="[24, 24]" class="charts-row">
      <!-- 趋势图 -->
      <a-col :xs="24" :lg="timeRange === 'year' ? 24 : 16">
        <div class="chart-card app-card">
          <div class="chart-header">
            <span class="chart-title">
              {{ timeRange === 'week' ? '本周每日' : timeRange === 'month' ? '本月每日' : '月度' }}消费趋势
            </span>
          </div>
          <v-chart class="trend-chart" :option="trendChartOption" autoresize />
        </div>
      </a-col>

      <!-- 饼图 -->
      <a-col :xs="24" :lg="timeRange === 'year' ? 12 : 8">
        <div class="chart-card app-card">
          <div class="chart-header">
            <span class="chart-title">类别占比</span>
          </div>
          <v-chart class="pie-chart" :option="pieChartOption" autoresize />
        </div>
      </a-col>

      <!-- 排行榜（仅年视图显示） -->
      <a-col v-if="timeRange === 'year'" :xs="24" :lg="12">
        <div class="chart-card app-card">
          <div class="chart-header">
            <span class="chart-title">月度对比</span>
          </div>
          <v-chart class="bar-chart" :option="monthBarOption" autoresize />
        </div>
      </a-col>
    </a-row>

    <!-- 类别明细 -->
    <a-row class="detail-row">
      <a-col :span="24">
        <div class="detail-card app-card">
          <div class="chart-header">
            <span class="chart-title"><ProfileOutlined /> 类别消费明细</span>
          </div>
          
          <a-table
            :columns="detailColumns"
            :data-source="categoryDetailList"
            :pagination="false"
            row-key="categoryId"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'category'">
                <div class="category-cell">
                  <div class="category-dot" :style="{ backgroundColor: record.color }"></div>
                  <span>{{ record.name }}</span>
                </div>
              </template>

              <template v-if="column.key === 'amount'">
                <span class="amount-text">{{ formatMoney(record.amount) }}</span>
              </template>

              <template v-if="column.key === 'percent'">
                <a-progress
                  :percent="record.percent"
                  :stroke-color="record.color"
                  :size="16"
                  :format="() => ''"
                />
                <span class="percent-text">{{ record.percent }}%</span>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useRecordStore } from '../stores/records.js'
import { useCategoryStore } from '../stores/categories.js'
import { formatMoney, formatDate } from '../utils/storage.js'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ProfileOutlined
} from '@ant-design/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
])

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()

const timeRange = ref('month')
const customDateRange = ref(null)

const detailColumns = [
  { title: '类别', key: 'category', width: 150 },
  { title: '笔数', dataIndex: 'count', width: 100 },
  { title: '金额', key: 'amount', width: 150 },
  { title: '占比', key: 'percent', width: 200 },
  { title: '平均', dataIndex: 'avg', width: 120 }
]

onMounted(() => {
  categoryStore.initCategories()
  recordStore.initRecords()
})

// 根据时间范围获取记录
const getRecordsByTimeRange = () => {
  const now = dayjs()
  
  switch (timeRange.value) {
    case 'week':
      return recordStore.getWeekRecords
    case 'month':
      return recordStore.getMonthRecords
    case 'year':
      return recordStore.getYearRecords
    default:
      return recordStore.getMonthRecords
  }
}

// 获取上期记录用于对比
const getCompareRecords = () => {
  const now = dayjs()
  
  switch (timeRange.value) {
    case 'week': {
      const lastWeekStart = now.subtract(1, 'week').startOf('week')
      const lastWeekEnd = now.subtract(1, 'week').endOf('week')
      return recordStore.getRecordsByDateRange(
        lastWeekStart.format('YYYY-MM-DD'),
        lastWeekEnd.format('YYYY-MM-DD')
      )
    }
    case 'month': {
      const lastMonthStart = now.subtract(1, 'month').startOf('month')
      const lastMonthEnd = now.subtract(1, 'month').endOf('month')
      return recordStore.getRecordsByDateRange(
        lastMonthStart.format('YYYY-MM-DD'),
        lastMonthEnd.format('YYYY-MM-DD')
      )
    }
    case 'year': {
      const lastYearStart = now.subtract(1, 'year').startOf('year')
      const lastYearEnd = now.subtract(1, 'year').endOf('year')
      return recordStore.getRecordsByDateRange(
        lastYearStart.format('YYYY-MM-DD'),
        lastYearEnd.format('YYYY-MM-DD')
      )
    }
    default:
      return []
  }
}

const currentStats = computed(() => {
  const records = getRecordsByTimeRange()
  const total = records.reduce((sum, r) => sum + Number(r.amount), 0)
  const count = records.length
  const avg = count > 0 ? total / count : 0
  
  // 找出最大单笔
  let max = 0
  let maxCategory = '-'
  records.forEach(r => {
    if (r.amount > max) {
      max = r.amount
      const cat = categoryStore.getCategoryById(r.type)
      maxCategory = cat?.name || '未知'
    }
  })
  
  // 类别统计
  const categoryStats = {}
  records.forEach(r => {
    if (!categoryStats[r.type]) {
      categoryStats[r.type] = { amount: 0, count: 0 }
    }
    categoryStats[r.type].amount += Number(r.amount)
    categoryStats[r.type].count += 1
  })
  
  // 找出主要支出类型
  let topCategory = '-'
  let topCategoryAmount = 0
  Object.entries(categoryStats).forEach(([typeId, stat]) => {
    if (stat.amount > topCategoryAmount) {
      topCategoryAmount = stat.amount
      const cat = categoryStore.getCategoryById(typeId)
      topCategory = cat?.name || '未知'
    }
  })
  
  const topCategoryPercent = total > 0 
    ? Math.round((topCategoryAmount / total) * 100) 
    : 0
  
  // 对比上期
  const compareRecords = getCompareRecords()
  const compareTotal = compareRecords.reduce((sum, r) => sum + Number(r.amount), 0)
  const compare = compareTotal > 0 
    ? ((total - compareTotal) / compareTotal) * 100 
    : null
  
  return {
    total,
    count,
    avg,
    max,
    maxCategory,
    topCategory,
    topCategoryPercent,
    compare
  }
})

const compareClass = computed(() => {
  if (currentStats.value.compare === null) return ''
  return currentStats.value.compare > 0 ? 'up' : 'down'
})

const topCategoryColor = computed(() => {
  const records = getRecordsByTimeRange()
  const categoryStats = {}
  records.forEach(r => {
    if (!categoryStats[r.type]) categoryStats[r.type] = 0
    categoryStats[r.type] += Number(r.amount)
  })
  
  let topType = null
  let topAmount = 0
  Object.entries(categoryStats).forEach(([type, amount]) => {
    if (amount > topAmount) {
      topAmount = amount
      topType = type
    }
  })
  
  if (topType) {
    const cat = categoryStore.getCategoryById(topType)
    return cat?.color || '#999'
  }
  return '#999'
})

// 类别明细列表
const categoryDetailList = computed(() => {
  const records = getRecordsByTimeRange()
  const total = records.reduce((sum, r) => sum + Number(r.amount), 0)
  const categoryStats = {}
  
  records.forEach(r => {
    if (!categoryStats[r.type]) {
      categoryStats[r.type] = { amount: 0, count: 0 }
    }
    categoryStats[r.type].amount += Number(r.amount)
    categoryStats[r.type].count += 1
  })
  
  return Object.entries(categoryStats)
    .map(([typeId, stat]) => {
      const cat = categoryStore.getCategoryById(typeId)
      return {
        categoryId: typeId,
        name: cat?.name || '未知',
        color: cat?.color || '#999',
        count: stat.count,
        amount: stat.amount.toFixed(2),
        percent: total > 0 ? Math.round((stat.amount / total) * 100) : 0,
        avg: (stat.amount / stat.count).toFixed(2)
      }
    })
    .sort((a, b) => b.amount - a.amount)
})

// 趋势图配置
const trendChartOption = computed(() => {
  const records = getRecordsByTimeRange()
  const dailyStats = {}
  
  records.forEach(r => {
    if (!dailyStats[r.date]) dailyStats[r.date] = 0
    dailyStats[r.date] += Number(r.amount)
  })
  
  let dates = []
  let values = []
  
  if (timeRange.value === 'year') {
    // 年视图显示月度数据
    const monthlyStats = {}
    records.forEach(r => {
      const month = r.date.slice(0, 7)
      if (!monthlyStats[month]) monthlyStats[month] = 0
      monthlyStats[month] += Number(r.amount)
    })
    dates = Object.keys(monthlyStats).sort()
    values = dates.map(d => monthlyStats[d].toFixed(2))
  } else {
    // 周/月视图显示日数据
    dates = Object.keys(dailyStats).sort()
    values = dates.map(d => dailyStats[d].toFixed(2))
    dates = dates.map(d => d.slice(5)) // 显示 MM-DD
  }
  
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value' },
    series: [{
      name: '支出',
      type: 'line',
      smooth: true,
      data: values,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      },
      lineStyle: { color: '#1890ff', width: 3 },
      itemStyle: { color: '#1890ff' }
    }]
  }
})

// 饼图配置
const pieChartOption = computed(() => {
  const records = getRecordsByTimeRange()
  const categoryStats = {}
  
  records.forEach(r => {
    if (!categoryStats[r.type]) categoryStats[r.type] = 0
    categoryStats[r.type] += Number(r.amount)
  })
  
  const data = Object.entries(categoryStats)
    .map(([typeId, amount]) => {
      const cat = categoryStore.getCategoryById(typeId)
      return {
        name: cat?.name || '未知',
        value: amount.toFixed(2),
        itemStyle: { color: cat?.color || '#999' }
      }
    })
    .sort((a, b) => b.value - a.value)
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      type: 'scroll'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data
    }]
  }
})

// 月度柱状图（年视图）
const monthBarOption = computed(() => {
  if (timeRange.value !== 'year') return {}
  
  const records = getRecordsByTimeRange()
  const monthlyStats = {}
  
  records.forEach(r => {
    const month = r.date.slice(0, 7)
    if (!monthlyStats[month]) monthlyStats[month] = 0
    monthlyStats[month] += Number(r.amount)
  })
  
  const months = Object.keys(monthlyStats).sort()
  const values = months.map(m => monthlyStats[m].toFixed(2))
  
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months.map(m => m.slice(5) + '月') },
    yAxis: { type: 'value' },
    series: [{
      name: '支出',
      type: 'bar',
      data: values,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#36cfc9' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }
})

const handleCustomDateChange = (dates) => {
  if (dates && dates.length === 2) {
    // 可以扩展自定义日期范围功能
    console.log('Custom date range:', dates)
  }
}

watch(timeRange, () => {
  customDateRange.value = null
})
</script>

<style scoped>
.tabs-card {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.date-picker {
  width: 280px;
}

.overview-row {
  margin-bottom: 24px;
}

.overview-card {
  padding: 24px;
  text-align: center;
}

.overview-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.overview-sub {
  font-size: 12px;
  color: #8c8c8c;
}

.overview-compare {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.overview-compare.up {
  color: #f5222d;
}

.overview-compare.down {
  color: #52c41a;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  padding: 24px;
  height: 420px;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
}

.trend-chart {
  height: 340px;
}

.pie-chart {
  height: 340px;
}

.bar-chart {
  height: 340px;
}

.detail-card {
  padding: 24px;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.amount-text {
  font-weight: 600;
  color: #f5222d;
}

.percent-text {
  margin-left: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .tabs-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-picker {
    width: 100%;
  }
}
</style>
