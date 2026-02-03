import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS, generateId } from '../utils/storage.js'

const defaultCategories = [
  { id: 'food', name: '餐饮', icon: 'CoffeeOutlined', color: '#ff6b6b', isDefault: true, sortOrder: 1 },
  { id: 'transport', name: '交通', icon: 'CarOutlined', color: '#4ecdc4', isDefault: true, sortOrder: 2 },
  { id: 'shopping', name: '购物', icon: 'ShoppingOutlined', color: '#45b7d1', isDefault: true, sortOrder: 3 },
  { id: 'entertainment', name: '娱乐', icon: 'SmileOutlined', color: '#f9ca24', isDefault: true, sortOrder: 4 },
  { id: 'housing', name: '住房', icon: 'HomeOutlined', color: '#6c5ce7', isDefault: true, sortOrder: 5 },
  { id: 'medical', name: '医疗', icon: 'MedicineBoxOutlined', color: '#fd79a8', isDefault: true, sortOrder: 6 },
  { id: 'education', name: '教育', icon: 'BookOutlined', color: '#00b894', isDefault: true, sortOrder: 7 },
  { id: 'communication', name: '通讯', icon: 'PhoneOutlined', color: '#e17055', isDefault: true, sortOrder: 8 },
  { id: 'social', name: '人情', icon: 'GiftOutlined', color: '#74b9ff', isDefault: true, sortOrder: 9 },
  { id: 'other', name: '其他', icon: 'MoreOutlined', color: '#a4b0be', isDefault: true, sortOrder: 10 }
]

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])

  // 初始化
  const initCategories = () => {
    const saved = storage.get(STORAGE_KEYS.CATEGORIES)
    if (saved && saved.length > 0) {
      categories.value = saved
    } else {
      categories.value = [...defaultCategories]
      saveCategories()
    }
  }

  // 保存到本地存储
  const saveCategories = () => {
    storage.set(STORAGE_KEYS.CATEGORIES, categories.value)
  }

  // 获取所有类型（按排序）
  const getAllCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder)
  })

  // 根据ID获取类型
  const getCategoryById = (id) => {
    return categories.value.find(c => c.id === id)
  }

  // 新增类型
  const addCategory = (category) => {
    const newCategory = {
      id: generateId(),
      ...category,
      isDefault: false,
      sortOrder: categories.value.length + 1,
      createdAt: new Date().toISOString()
    }
    categories.value.push(newCategory)
    saveCategories()
    return newCategory
  }

  // 更新类型
  const updateCategory = (id, updates) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
      saveCategories()
      return true
    }
    return false
  }

  // 删除类型
  const deleteCategory = (id) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1 && !categories.value[index].isDefault) {
      categories.value.splice(index, 1)
      saveCategories()
      return true
    }
    return false
  }

  // 重新排序
  const reorderCategories = (newOrder) => {
    categories.value = newOrder.map((cat, index) => ({
      ...cat,
      sortOrder: index + 1
    }))
    saveCategories()
  }

  return {
    categories,
    getAllCategories,
    initCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  }
})
