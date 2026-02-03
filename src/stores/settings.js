import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS } from '../utils/storage.js'

const defaultSettings = {
  theme: 'light',
  currency: '¥',
  monthlyBudget: 5000,
  weekStartsOn: 1, // 1 = 周一
  language: 'zh-CN'
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({ ...defaultSettings })
  const isDark = computed(() => settings.value.theme === 'dark')

  // 初始化
  const initSettings = () => {
    const saved = storage.get(STORAGE_KEYS.SETTINGS)
    if (saved) {
      settings.value = { ...defaultSettings, ...saved }
    }
    applyTheme()
  }

  // 保存设置
  const saveSettings = () => {
    storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  // 更新设置
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const theme = settings.value.theme
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.style.backgroundColor = '#141414'
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.body.style.backgroundColor = '#f0f2f5'
    }
  }

  // 切换主题
  const toggleTheme = () => {
    settings.value.theme = settings.value.theme === 'dark' ? 'light' : 'dark'
    saveSettings()
    applyTheme()
  }

  // 设置月度预算
  const setBudget = (budget) => {
    settings.value.monthlyBudget = Number(budget)
    saveSettings()
  }

  return {
    settings,
    isDark,
    initSettings,
    updateSettings,
    toggleTheme,
    setBudget
  }
})
