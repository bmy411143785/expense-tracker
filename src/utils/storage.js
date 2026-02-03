const STORAGE_KEYS = {
  SETTINGS: 'expense_tracker_settings',
  CATEGORIES: 'expense_tracker_categories',
  RECORDS: 'expense_tracker_records',
  VERSION: 'expense_tracker_version'
}

const CURRENT_VERSION = '1.0.0'

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Storage get error:', e)
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('Storage remove error:', e)
      return false
    }
  },

  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
      return true
    } catch (e) {
      console.error('Storage clear error:', e)
      return false
    }
  }
}

export { STORAGE_KEYS, CURRENT_VERSION }

// 格式化金额
export const formatMoney = (amount, currency = '¥') => {
  return `${currency}${Number(amount).toFixed(2)}`
}

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
}
