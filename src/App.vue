<template>
  <Layout></Layout>
</template>

<script setup>
import Layout from './components/Layout.vue'
import { onMounted } from 'vue'
import { useCategoryStore } from './stores/categories.js'
import { useRecordStore } from './stores/records.js'
import { useSettingsStore } from './stores/settings.js'

const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  // 初始化所有 store
  settingsStore.initSettings()
  categoryStore.initCategories()
  recordStore.initRecords()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
