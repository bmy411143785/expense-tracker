import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS, generateId, formatDate } from '../utils/storage.js'

export const useRecordStore = defineStore('records', () => {
  const records = ref([])

  // 初始化
  const initRecords = () => {
    const saved = storage.get(STORAGE_KEYS.RECORDS)
    if (saved) {
      records.value = saved
    }
  }

  // 保存到本地存储
  const saveRecords = () => {
    storage.set(STORAGE_KEYS.RECORDS, records.value)
  }

  // 获取所有记录（按日期倒序）
  const getAllRecords = computed(() => {
    return [...records.value].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
  })

  // 根据ID获取记录
  const getRecordById = (id) => {
    return records.value.find(r => r.id === id)
  }

  // 新增记录
  const addRecord = (record) => {
    const newRecord = {
      id: generateId(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    records.value.push(newRecord)
    saveRecords()
    return newRecord
  }

  // 更新记录
  const updateRecord = (id, updates) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value[index] = { 
        ...records.value[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveRecords()
      return true
    }
    return false
  }

  // 删除记录
  const deleteRecord = (id) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value.splice(index, 1)
      saveRecords()
      return true
    }
    return false
  }

  // 批量删除
  const batchDelete = (ids) => {
    records.value = records.value.filter(r => !ids.includes(r.id))
    saveRecords()
  }

  // ========== 统计查询 ==========

  // 获取今日记录
  const getTodayRecords = computed(() => {
    const today = formatDate(new Date())
    return records.value.filter(r => r.date === today)
  })

  // 获取本周记录
  const getWeekRecords = computed(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() || 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek + 1)
    weekStart.setHours(0, 0, 0, 0)
    
    return records.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= weekStart
    })
  })

  // 获取本月记录
  const getMonthRecords = computed(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return records.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= monthStart
    })
  })

  // 获取本年记录
  const getYearRecords = computed(() => {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    
    return records.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= yearStart
    })
  })

  // 按日期范围查询
  const getRecordsByDateRange = (startDate, endDate) => {
    return records.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
    })
  }

  // 计算总支出
  const calculateTotal = (recordList) => {
    return recordList.reduce((sum, r) => sum + Number(r.amount), 0)
  }

  // 今日支出
  const todayTotal = computed(() => calculateTotal(getTodayRecords.value))
  
  // 本周支出
  const weekTotal = computed(() => calculateTotal(getWeekRecords.value))
  
  // 本月支出
  const monthTotal = computed(() => calculateTotal(getMonthRecords.value))
  
  // 本年支出
  const yearTotal = computed(() => calculateTotal(getYearRecords.value))

  // 按类型分组统计
  const getCategoryStats = (recordList) => {
    const stats = {}
    recordList.forEach(r => {
      if (!stats[r.type]) {
        stats[r.type] = { amount: 0, count: 0 }
      }
      stats[r.type].amount += Number(r.amount)
      stats[r.type].count += 1
    })
    return stats
  }

  // 按日期分组（用于趋势图）
  const getDailyStats = (recordList) => {
    const stats = {}
    recordList.forEach(r => {
      if (!stats[r.date]) {
        stats[r.date] = 0
      }
      stats[r.date] += Number(r.amount)
    })
    return stats
  }

  return {
    records,
    getAllRecords,
    initRecords,
    getRecordById,
    addRecord,
    updateRecord,
    deleteRecord,
    batchDelete,
    getTodayRecords,
    getWeekRecords,
    getMonthRecords,
    getYearRecords,
    getRecordsByDateRange,
    todayTotal,
    weekTotal,
    monthTotal,
    yearTotal,
    getCategoryStats,
    getDailyStats
  }
})
