<template>
  <div class="categories-page">
    <a-row :gutter="[24, 24]">
      <!-- 类型列表 -->
      <a-col :xs="24" :lg="16">
        <div class="list-card app-card">
          <div class="card-header">
            <div class="card-title">
              <AppstoreOutlined /> 消费类型管理
            </div>
            <a-button type="primary" @click="showAddModal">
              <PlusOutlined /> 新增类型
            </a-button>
          </div>

          <a-table
            :columns="columns"
            :data-source="categoryStore.getAllCategories"
            :pagination="false"
            row-key="id"
            class="category-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'icon'">
                <div
                  class="table-icon"
                  :style="{ backgroundColor: record.color + '20', color: record.color }"
                >
                  <component :is="getIconComponent(record.icon)"></component>
                </div>
              </template>

              <template v-if="column.key === 'color'">
                <div class="color-preview" :style="{ backgroundColor: record.color }" />
              </template>

              <template v-if="column.key === 'budget'">
                <span v-if="record.budget">{{ formatMoney(record.budget) }}/月</span>
                <span v-else class="text-muted">未设置</span>
              </template>

              <template v-if="column.key === 'isDefault'">
                <a-tag v-if="record.isDefault" color="blue">系统</a-tag>
                <a-tag v-else>自定义</a-tag>
              </template>

              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="text" @click="handleEdit(record)">
                    <EditOutlined /> 编辑
                  </a-button>
                  
                  <a-popconfirm
                    v-if="!record.isDefault"
                    title="确定删除该类型？"
                    description="删除后历史记录将保留但无法新建此类记录"
                    @confirm="handleDelete(record.id)"
                  >
                    <a-button type="text" danger>
                      <DeleteOutlined /> 删除
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>

      <!-- 提示卡片 -->
      <a-col :xs="24" :lg="8">
        <div class="tips-card app-card">
          <div class="card-title"><InfoCircleOutlined /> 使用说明</div>
          
          <a-timeline>
            <a-timeline-item>
              <p><strong>系统预设类型</strong>无法删除，但可以编辑名称和颜色</p>
            </a-timeline-item>
            
            <a-timeline-item>
              <p><strong>自定义类型</strong>可随时删除，删除后历史记录仍会保留</p>
            </a-timeline-item>
            
            <a-timeline-item>
              <p>建议为常用类型设置<strong>月度预算</strong>，便于控制开支</p>
            </a-timeline-item>
            
            <a-timeline-item>
              <p>类型颜色将用于<strong>统计图表</strong>展示，建议选择辨识度高的颜色</p>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-col>
    </a-row>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑类型' : '新增类型'"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="form" layout="vertical" :rules="rules" ref="formRef">
        <a-form-item label="类型名称" name="name">
          <a-input
            v-model:value="form.name"
            placeholder="如：零食、健身、宠物..."
            :maxlength="10"
            show-count
          />
        </a-form-item>

        <a-form-item label="图标" name="icon">
          <div class="icon-selector">
            <div
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              <component :is="getIconComponent(icon)"></component>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="主题色" name="color">
          <div class="color-selector">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ active: form.color === color }"
              @click="form.color = color"
            >
              <CheckOutlined v-if="form.color === color" class="check-icon" />
            </div>
            <a-input
              v-model:value="form.color"
              class="color-input"
              placeholder="或输入自定义颜色 #1890ff"
            />
          </div>
        </a-form-item>

        <a-form-item label="月度预算（可选）" name="budget">
          <a-input-number
            v-model:value="form.budget"
            style="width: 100%"
            :min="0"
            :step="100"
            :formatter="value => `¥ ${value}`"
            placeholder="设置该类别的月度预算上限"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useCategoryStore } from '../stores/categories.js'
import { formatMoney } from '../utils/storage.js'
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckOutlined,
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
  WalletOutlined,
  SkinOutlined,
  RocketOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CameraOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue'

const categoryStore = useCategoryStore()
const modalVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)

const iconOptions = [
  'CoffeeOutlined', 'CarOutlined', 'ShoppingOutlined', 'SmileOutlined',
  'HomeOutlined', 'MedicineBoxOutlined', 'BookOutlined', 'PhoneOutlined',
  'GiftOutlined', 'WalletOutlined', 'SkinOutlined', 'RocketOutlined',
  'HeartOutlined', 'StarOutlined', 'TrophyOutlined', 'FireOutlined',
  'ThunderboltOutlined', 'BulbOutlined', 'CameraOutlined', 'MoreOutlined'
]

const colorOptions = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
  '#fd79a8', '#00b894', '#e17055', '#74b9ff', '#a4b0be',
  '#ff7675', '#00cec9', '#0984e3', '#fdcb6e', '#d63031',
  '#e84393', '#00b894', '#e17055', '#636e72', '#2d3436'
]

const columns = [
  { title: '图标', key: 'icon', width: 80, align: 'center' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '颜色', key: 'color', width: 80, align: 'center' },
  { title: '预算', key: 'budget', width: 120 },
  { title: '类型', key: 'isDefault', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

const form = ref({
  name: '',
  icon: 'WalletOutlined',
  color: '#1890ff',
  budget: null
})

const rules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标' }],
  color: [{ required: true, message: '请选择颜色' }]
}

const iconMap = {
  CoffeeOutlined, CarOutlined, ShoppingOutlined, SmileOutlined,
  HomeOutlined, MedicineBoxOutlined, BookOutlined, PhoneOutlined,
  GiftOutlined, MoreOutlined, WalletOutlined, SkinOutlined,
  RocketOutlined, HeartOutlined, StarOutlined, TrophyOutlined,
  FireOutlined, ThunderboltOutlined, BulbOutlined, CameraOutlined,
  CustomerServiceOutlined, DesktopOutlined, GlobalOutlined
}

const getIconComponent = (iconName) => {
  return iconMap[iconName] || WalletOutlined
}

onMounted(() => {
  categoryStore.initCategories()
})

const showAddModal = () => {
  isEdit.value = false
  editId.value = null
  form.value = {
    name: '',
    icon: 'WalletOutlined',
    color: '#1890ff',
    budget: null
  }
  modalVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  editId.value = record.id
  form.value = {
    name: record.name,
    icon: record.icon,
    color: record.color,
    budget: record.budget
  }
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const data = {
      name: form.value.name,
      icon: form.value.icon,
      color: form.value.color,
      budget: form.value.budget
    }
    
    if (isEdit.value) {
      await categoryStore.updateCategory(editId.value, data)
      message.success('修改成功！')
    } else {
      await categoryStore.addCategory(data)
      message.success('添加成功！')
    }
    
    modalVisible.value = false
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    const success = await categoryStore.deleteCategory(id)
    if (success) {
      message.success('删除成功！')
    } else {
      message.error('系统预设类型无法删除')
    }
  } catch (error) {
    message.error('删除失败：' + error.message)
  }
}
</script>

<style scoped>
.list-card, .tips-card {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-table :deep(.ant-table-cell) {
  vertical-align: middle;
}

.table-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin: 0 auto;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin: 0 auto;
  border: 1px solid #d9d9d9;
}

.text-muted {
  color: #8c8c8c;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
}

.icon-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.icon-option:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.icon-option.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px #1890ff;
}

.check-icon {
  color: #fff;
  font-size: 16px;
}

.color-input {
  width: 180px;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .icon-selector {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
