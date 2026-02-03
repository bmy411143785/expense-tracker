<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <a-row :gutter="[24, 24]" class="stat-cards">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card app-card">
          <div class="stat-header">
            <div class="stat-icon today"><CalendarOutlined /></div>
            <div class="stat-title">今日支出</div>
          </div>
          <div class="stat-value">{{ formatMoney(recordStore.todayTotal) }}</div>
          <div class="stat-footer">{{ recordStore.getTodayRecords.length }} 笔记录</div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card app-card">
          <div class="stat-header">
            <div class="stat-icon week"><WeekIcon /></div>
            <div class="stat-title">本周支出</div>
          </div>
          <div class="stat-value">{{ formatMoney(recordStore.weekTotal) }}</div>
          <div class="stat-footer">{{ recordStore.getWeekRecords.length }} 笔记录</div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card app-card">
          <div class="stat-header">
            <div class="stat-icon month"><BarChartOutlined /></div>
            <div class="stat-title">本月支出</div>
          </div>
          <div class="stat-value">{{ formatMoney(recordStore.monthTotal) }}</div>
          <div class="stat-footer">预算使用率 {{ budgetUsage }}%</div>
        </div>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card app-card quick-add" @click="$router.push('/record')">
          <div class="quick-add-content">
            <PlusOutlined class="quick-icon" />
            <div class="quick-text">记一笔</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 预算进度 -->
    <a-row class="budget-row">
      <a-col :span="24">
        <div class="budget-card app-card">
          <div class="budget-header">
            <span class="budget-title">本月预算</span>
            <a-button type="link" @click="showBudgetModal = true">设置预算</a-button>
          </div>
          <a-progress
            :percent="budgetUsage"
            :stroke-color="progressColor"
            :size="20"
            :format="() => `${formatMoney(recordStore.monthTotal)} / ${formatMoney(settingsStore.settings.monthlyBudget)}`"
          />
          <div v-if="budgetUsage >= 100" class="budget-warning">
            <ExclamationCircleOutlined /> 本月预算已超支！
          </div>
          <div v-else-if="budgetUsage >= 80" class="budget-caution">
            <InfoCircleOutlined /> 本月预算已使用 {{ budgetUsage }}%，注意控制
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 图表和最近记录 -->
    <a-row :gutter="[24, 24]" class="charts-row">
      <a-col :xs="24" :lg="16">
        <div class="chart-card app-card">
          <div class="card-title">近7天消费趋势</div>
          <v-chart class="trend-chart" :option="trendOption" autoresize />
        </div>
      </a-col>

      <a-col :xs="24" :lg="8">
        <div class="chart-card app-card">
          <div class="card-title">本月类别占比</div>
          <v-chart class="pie-chart" :option="pieOption" autoresize />
        </div>
      </a-col>
    </a-row>

    <!-- 最近记录 -->
    <a-row class="records-row">
      <a-col :span="24">
        <div class="records-card app-card">
          <div class="card-header">
            <span class="card-title">最近记录</span>
            <a-button type="link" @click="$router.push('/record')">查看全部</a-button>
          </div>
          
          <a-list
            :data-source="recentRecords"
            :pagination="false"
            class="recent-list"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="getCategoryName(item.type)"
                  :description="item.note || formatDate(item.date)"
                >
                  <template #avatar>
                    <div
                      class="category-avatar"
                      :style="{ backgroundColor: getCategoryColor(item.type) }"
                    >
                      <component :is="getCategoryIcon(item.type)"></component>
                    </div>
                  </template>
                </a-list-item-meta>
                
                <template #actions>
                  <span class="record-amount">-{{ formatMoney(item.amount) }}</span>
                </template>
              </a-list-item>
            </template>
            
            <template #empty>
              <a-empty description="暂无记录，快去记一笔吧" />
            </template>
          </a-list>
        </div>
      </a-col>
    </a-row>

    <!-- 预算设置弹窗 -->
    <a-modal
      v-model:open="showBudgetModal"
      title="设置月度预算"
      @ok="handleBudgetSubmit"
    >
      <a-form :model="budgetForm">
        <a-form-item label="月度预算">
          <a-input-number
            v-model:value="budgetForm.monthlyBudget"
            :min="0"
            :step="100"
            :formatter="value => `¥ ${value}`"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useRecordStore } from '../stores/records.js'
import { useCategoryStore } from '../stores/categories.js'
import { useSettingsStore } from '../stores/settings.js'
import { formatMoney, formatDate } from '../utils/storage.js'
import {
  CalendarOutlined,
  BarChartOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WalletOutlined
} from '@ant-design/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const WeekIcon = () => h('span', { style: { fontSize: '24px' } }, '📅')

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()

const showBudgetModal = ref(false)
const budgetForm = ref({
  monthlyBudget: settingsStore.settings.monthlyBudget
})

onMounted(() => {
  categoryStore.initCategories()
  recordStore.initRecords()
  settingsStore.initSettings()
})

const budgetUsage = computed(() => {
  const usage = (recordStore.monthTotal / settingsStore.settings.monthlyBudget) * 100
  return Math.min(Math.round(usage), 999)
})

const progressColor = computed(() => {
  if (budgetUsage.value >= 100) return '#f5222d'
  if (budgetUsage.value >= 80) return '#faad14'
  return '#52c41a'
})

const recentRecords = computed(() => {
  return recordStore.getAllRecords.slice(0, 5)
})

const getCategoryName = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  return cat?.name || '未知类型'
}

const getCategoryColor = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  return cat?.color || '#999'
}

const getCategoryIcon = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  // 简化处理，实际应根据图标名称动态导入
  return WalletOutlined
}

const handleBudgetSubmit = () => {
  settingsStore.setBudget(budgetForm.value.monthlyBudget)
  showBudgetModal.value = false
}

// 近7天趋势图
const trendOption = computed(() => {
  const dates = []
  const values = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    dates.push(dateStr.slice(5)) // 显示 MM-DD
    
    const dayRecords = recordStore.records.filter(r => r.date === dateStr)
    const dayTotal = dayRecords.reduce((sum, r) => sum + Number(r.amount), 0)
    values.push(dayTotal.toFixed(2))
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

// 类别饼图
const pieOption = computed(() => {
  const stats = recordStore.getCategoryStats(recordStore.getMonthRecords)
  const data = Object.entries(stats).map(([typeId, stat]) => {
    const cat = categoryStore.getCategoryById(typeId)
    return {
      name: cat?.name || '未知',
      value: stat.amount.toFixed(2),
      itemStyle: { color: cat?.color || '#999' }
    }
  }).sort((a, b) => b.value - a.value)
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
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
</script>

<style scoped>
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  height: 100%;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.today { background: rgba(24, 144, 255, 0.1); color: #1890ff; }
.stat-icon.week { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
.stat-icon.month { background: rgba(250, 173, 20, 0.1); color: #faad14; }

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.stat-footer {
  font-size: 12px;
  color: #8c8c8c;
}

.quick-add {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
}

.quick-add:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
}

.quick-add-content {
  text-align: center;
  color: #fff;
}

.quick-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.quick-text {
  font-size: 18px;
  font-weight: 500;
}

.budget-row {
  margin-bottom: 24px;
}

.budget-card {
  padding: 24px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.budget-title {
  font-size: 16px;
  font-weight: 500;
}

.budget-warning {
  margin-top: 12px;
  color: #f5222d;
  font-size: 14px;
}

.budget-caution {
  margin-top: 12px;
  color: #faad14;
  font-size: 14px;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  padding: 24px;
  height: 400px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.trend-chart, .pie-chart {
  height: 320px;
}

.records-card {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  color: #f5222d;
}

.recent-list :deep(.ant-list-item) {
  padding: 12px 0;
}
</style>
