<template>
  <a-layout class="app-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      class="app-sider"
      :class="{ 'is-dark': settingsStore.isDark }"
    >
      <div class="logo">
        <WalletOutlined class="logo-icon" />
        <span v-if="!collapsed" class="logo-text">记账助手</span>
      </div>

      <a-menu
        :theme="settingsStore.isDark ? 'dark' : 'light'"
        mode="inline"
        :selected-keys="[route.path]"
        class="app-menu"
      >
        <a-menu-item key="/" @click="$router.push('/')">
          <DashboardOutlined />
          <span>仪表盘</span>
        </a-menu-item>
        
        <a-menu-item key="/record" @click="$router.push('/record')">
          <PlusCircleOutlined />
          <span>记一笔</span>
        </a-menu-item>
        
        <a-menu-item key="/categories" @click="$router.push('/categories')">
          <AppstoreOutlined />
          <span>消费类型</span>
        </a-menu-item>
        
        <a-menu-item key="/statistics" @click="$router.push('/statistics')">
          <BarChartOutlined />
          <span>统计分析</span>
        </a-menu-item>
      </a-menu>

      <div class="sider-footer">
        <a-button
          type="text"
          :icon="settingsStore.isDark ? h(SunOutlined) : h(MoonOutlined)"
          @click="settingsStore.toggleTheme"
        >
          {{ collapsed ? '' : (settingsStore.isDark ? '浅色' : '深色') }}
        </a-button>
      </div>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout class="app-content-layout">
      <a-layout-header class="app-header">
        <MenuFoldOutlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <MenuUnfoldOutlined
          v-else
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        
        <div class="header-title">
          {{ route.meta?.title || '记账助手' }}
        </div>
      </a-layout-header>

      <a-layout-content class="app-content">
        <div class="content-wrapper fade-in">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '../stores/settings.js'
import {
  DashboardOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WalletOutlined
} from '@ant-design/icons-vue'

// 主题切换图标
const MoonOutlined = () => h('span', { style: { fontSize: '16px' } }, '🌙')
const SunOutlined = () => h('span', { style: { fontSize: '16px' } }, '☀️')

const route = useRoute()
const settingsStore = useSettingsStore()
const collapsed = ref(false)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sider {
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
  z-index: 10;
}

.app-sider.is-dark {
  background: #141414;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-icon {
  font-size: 28px;
  color: #1890ff;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.app-menu {
  border-right: none;
  padding-top: 8px;
}

.sider-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.app-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  z-index: 5;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-title {
  margin-left: 24px;
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.app-content {
  margin: 24px;
  overflow: initial;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
