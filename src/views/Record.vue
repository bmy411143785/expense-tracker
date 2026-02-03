<template>
  <div class="record-page">
    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :lg="12">
        <div class="form-card app-card">
          <div class="card-title"><PlusOutlined /> 记一笔</div>
          
          <a-form
            :model="formState"
            layout="vertical"
            @finish="handleSubmit"
          >
            <!-- 金额输入 -->
            <a-form-item label="金额" name="amount" :rules="[{ required: true, message: '请输入金额' }]">
              <div class="amount-input-wrapper">
                <span class="currency-symbol">{{ settingsStore.settings.currency }}</span>
                <a-input-number
                  v-model:value="formState.amount"
                  class="amount-input"
                  :min="0.01"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  size="large"
                  @pressEnter="handleSubmit"
                />
              </div>
              
              <!-- 快捷金额 -->
              <div class="quick-amounts">
                <a-button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  size="small"
                  @click="formState.amount = amount"
                >
                  {{ amount }}
                </a-button>
              </div>
            </a-form-item>

            <!-- 消费类型 -->
            <a-form-item label="消费类型" name="type" :rules="[{ required: true, message: '请选择类型' }]">
              <div class="category-grid">
                <div
                  v-for="cat in categoryStore.getAllCategories"
                  :key="cat.id"
                  class="category-item"
                  :class="{ active: formState.type === cat.id }"
                  @click="formState.type = cat.id"
                  :style="{ '--cat-color': cat.color }"
                >
                  <div class="cat-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                    <component :is="getIconComponent(cat.icon)"></component>
                  </div>
                  <div class="cat-name">{{ cat.name }}</div>
                </div>
              </div>
            </a-form-item>

            <!-- 日期 -->
            <a-form-item label="日期" name="date" :rules="[{ required: true }]">
              <a-date-picker
                v-model:value="formState.date"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>

            <!-- 支付方式 -->
            <a-form-item label="支付方式" name="paymentMethod">
              <a-select v-model:value="formState.paymentMethod" placeholder="选择支付方式">
                <a-select-option v-for="method in paymentMethods" :key="method.value" :value="method.value">
                  {{ method.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <!-- 备注 -->
            <a-form-item label="备注" name="note">
              <a-textarea
                v-model:value="formState.note"
                :rows="3"
                placeholder="添加备注（选填）"
                :maxlength="100"
                show-count
              />
            </a-form-item>

            <!-- 提交按钮 -->
            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" block :loading="submitting">
                <SaveOutlined /> 保存记录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-col>

      <a-col :xs="24" :lg="12">
        <div class="recent-card app-card">
          <div class="card-header">
            <span class="card-title"><HistoryOutlined /> 今日记录</span>
            <span class="card-subtitle">共 {{ todayRecords.length }} 笔，{{ formatMoney(todayTotal) }}</span>
          </div>

          <a-list
            :data-source="todayRecords"
            class="today-list"
            :pagination="{ pageSize: 8 }"
          >
            <template #renderItem="{ item }">
              <a-list-item class="record-item">
                <a-list-item-meta
                  :title="getCategoryName(item.type)"
                  :description="item.note || formatDateTime(item.createdAt)"
                >
                  <template #avatar>
                    <div
                      class="record-avatar"
                      :style="{ backgroundColor: getCategoryColor(item.type) }"
                    >
                      <component :is="getIconComponent(getCategoryIcon(item.type))"></component>
                    </div>
                  </template>
                </a-list-item-meta>
                
                <template #actions>
                  <a-space>
                    <span class="record-amount">-{{ formatMoney(item.amount) }}</span>
                    <a-button type="text" size="small" @click="handleEdit(item)">
                      <EditOutlined />
                    </a-button>
                    <a-popconfirm
                      title="确定删除这条记录？"
                      @confirm="handleDelete(item.id)"
                    >
                      <a-button type="text" danger size="small">
                        <DeleteOutlined />
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-list-item>
            </template>

            <template #empty>
              <a-empty description="今日暂无记录" />
            </template>
          </a-list>
        </div>
      </a-col>
    </a-row>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑记录"
      @ok="handleEditSubmit"
      :confirm-loading="editSubmitting"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="金额">
          <a-input-number
            v-model:value="editForm.amount"
            :min="0.01"
            :precision="2"
            style="width: 100%"
            :formatter="value => `¥ ${value}`"
          />
        </a-form-item>

        <a-form-item label="消费类型">
          <a-select v-model:value="editForm.type">
            <a-select-option v-for="cat in categoryStore.getAllCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="日期">
          <a-date-picker
            v-model:value="editForm.date"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model:value="editForm.note" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { useRecordStore } from '../stores/records.js'
import { useCategoryStore } from '../stores/categories.js'
import { useSettingsStore } from '../stores/settings.js'
import { formatMoney, formatDate } from '../utils/storage.js'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  SaveOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  CarOutlined,
  ShoppingOutlined,
  SmileOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  PhoneOutlined,
  GiftOutlined,
  MoreOutlined,
  WalletOutlined
} from '@ant-design/icons-vue'

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()

const submitting = ref(false)
const editModalVisible = ref(false)
const editSubmitting = ref(false)
const currentEditId = ref(null)

const quickAmounts = [10, 20, 50, 100, 200, 500]

const paymentMethods = [
  { value: 'cash', label: '现金' },
  { value: 'wechat', label: '微信支付' },
  { value: 'alipay', label: '支付宝' },
  { value: 'credit', label: '信用卡' },
  { value: 'debit', label: '借记卡' },
  { value: 'other', label: '其他' }
]

const formState = ref({
  amount: undefined,
  type: '',
  date: dayjs().format('YYYY-MM-DD'),
  paymentMethod: 'wechat',
  note: ''
})

const editForm = ref({
  amount: 0,
  type: '',
  date: '',
  note: ''
})

const today = formatDate(new Date())

const todayRecords = computed(() => {
  return recordStore.getAllRecords.filter(r => r.date === today)
})

const todayTotal = computed(() => {
  return todayRecords.value.reduce((sum, r) => sum + Number(r.amount), 0)
})

onMounted(() => {
  categoryStore.initCategories()
  recordStore.initRecords()
  settingsStore.initSettings()
  
  // 默认选中第一个类型
  if (categoryStore.getAllCategories.length > 0 && !formState.value.type) {
    formState.value.type = categoryStore.getAllCategories[0].id
  }
})

const iconMap = {
  'CoffeeOutlined': CoffeeOutlined,
  'CarOutlined': CarOutlined,
  'ShoppingOutlined': ShoppingOutlined,
  'SmileOutlined': SmileOutlined,
  'HomeOutlined': HomeOutlined,
  'MedicineBoxOutlined': MedicineBoxOutlined,
  'BookOutlined': BookOutlined,
  'PhoneOutlined': PhoneOutlined,
  'GiftOutlined': GiftOutlined,
  'MoreOutlined': MoreOutlined,
  'WalletOutlined': WalletOutlined
}

const getIconComponent = (iconName) => {
  return iconMap[iconName] || WalletOutlined
}

const getCategoryName = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  return cat?.name || '未知'
}

const getCategoryColor = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  return cat?.color || '#999'
}

const getCategoryIcon = (typeId) => {
  const cat = categoryStore.getCategoryById(typeId)
  return cat?.icon || 'WalletOutlined'
}

const formatDateTime = (isoString) => {
  return dayjs(isoString).format('HH:mm')
}

const handleSubmit = async () => {
  if (!formState.value.amount || formState.value.amount <= 0) {
    message.error('请输入有效金额')
    return
  }
  if (!formState.value.type) {
    message.error('请选择消费类型')
    return
  }

  submitting.value = true
  try {
    await recordStore.addRecord({
      amount: Number(formState.value.amount),
      type: formState.value.type,
      date: formState.value.date,
      paymentMethod: formState.value.paymentMethod,
      note: formState.value.note
    })
    
    message.success('记录添加成功！')
    
    // 重置表单（保留日期和支付方式）
    formState.value.amount = undefined
    formState.value.note = ''
  } catch (error) {
    message.error('保存失败：' + error.message)
  } finally {
    submitting.value = false
  }
}

const handleEdit = (item) => {
  currentEditId.value = item.id
  editForm.value = {
    amount: item.amount,
    type: item.type,
    date: item.date,
    note: item.note || ''
  }
  editModalVisible.value = true
}

const handleEditSubmit = async () => {
  editSubmitting.value = true
  try {
    await recordStore.updateRecord(currentEditId.value, editForm.value)
    message.success('修改成功！')
    editModalVisible.value = false
  } catch (error) {
    message.error('修改失败：' + error.message)
  } finally {
    editSubmitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await recordStore.deleteRecord(id)
    message.success('删除成功！')
  } catch (error) {
    message.error('删除失败：' + error.message)
  }
}
</script>

<style scoped>
.form-card, .recent-card {
  padding: 24px;
  height: 100%;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency-symbol {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.amount-input {
  flex: 1;
}

.amount-input :deep(.ant-input-number-input) {
  font-size: 32px;
  font-weight: 600;
  height: 56px;
}

.quick-amounts {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.category-item.active {
  border-color: var(--cat-color);
  background-color: var(--cat-color) + '10';
}

.cat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 4px;
}

.cat-name {
  font-size: 12px;
  color: #595959;
}

.today-list {
  max-height: 600px;
  overflow-y: auto;
}

.record-item {
  padding: 12px 0;
}

.record-avatar {
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

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
