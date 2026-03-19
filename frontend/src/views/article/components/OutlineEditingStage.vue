<template>
  <div class="outline-editing-stage">
    <div class="stage-header">
      <h2 class="stage-title">编辑文章大纲</h2>
      <p class="stage-subtitle">您可以对大纲进行调整，确认后 AI 将开始撰写正文</p>
    </div>

    <div class="outline-list">
      <div
        v-for="(item, index) in localOutline"
        :key="item.section"
        class="outline-item"
        :class="{ editing: editingIndex === index }"
      >
        <!-- 章节头部 -->
        <div class="item-header">
          <div class="item-left">
            <HolderOutlined class="drag-icon" />
            <span class="section-number">{{ index + 1 }}</span>
            <div v-if="editingIndex !== index" class="section-title-display" @click="startEdit(index)">
              {{ item.title }}
              <EditOutlined class="edit-hint" />
            </div>
            <a-input
              v-else
              v-model:value="item.title"
              class="section-title-input"
              @blur="stopEdit"
              @keyup.enter="stopEdit"
              ref="titleInputRef"
            />
          </div>
          <a-button
            type="text"
            danger
            size="small"
            class="delete-btn"
            @click="removeSection(index)"
            :disabled="localOutline.length <= 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <!-- 要点列表 -->
        <div class="points-list">
          <div v-for="(point, pIdx) in item.points" :key="pIdx" class="point-item">
            <span class="point-dot">•</span>
            <a-input
              v-model:value="item.points[pIdx]"
              size="small"
              class="point-input"
              placeholder="输入要点..."
            />
            <a-button
              type="text"
              size="small"
              danger
              class="point-delete"
              @click="removePoint(index, pIdx)"
              :disabled="item.points.length <= 1"
            >
              <CloseOutlined />
            </a-button>
          </div>
          <a-button type="dashed" size="small" class="add-point-btn" @click="addPoint(index)">
            <PlusOutlined />
            添加要点
          </a-button>
        </div>
      </div>
    </div>

    <!-- 添加章节 -->
    <a-button type="dashed" block class="add-section-btn" @click="addSection">
      <PlusOutlined />
      添加章节
    </a-button>

    <!-- 确认按钮 -->
    <div class="actions">
      <a-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!canConfirm"
        @click="handleConfirm"
        class="confirm-btn"
      >
        <template #icon>
          <CheckOutlined />
        </template>
        确认大纲，开始撰写
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  HolderOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue'

interface OutlineItem {
  section: number
  title: string
  points: string[]
}

interface Props {
  outline: OutlineItem[]
  loading?: boolean
  taskId?: string
}

interface Emits {
  (e: 'confirm', outline: OutlineItem[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  taskId: '',
})

const emit = defineEmits<Emits>()

// 深拷贝大纲数据，避免直接修改 props
const localOutline = ref<OutlineItem[]>([])

watch(
  () => props.outline,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      localOutline.value = newVal.map((item, idx) => ({
        section: idx + 1,
        title: item.title || '',
        points: item.points ? [...item.points] : [''],
      }))
    }
  },
  { immediate: true, deep: true },
)

// 当前正在编辑的章节索引
const editingIndex = ref<number | null>(null)
const titleInputRef = ref()

const startEdit = (index: number) => {
  editingIndex.value = index
  nextTick(() => {
    titleInputRef.value?.[0]?.focus()
  })
}

const stopEdit = () => {
  editingIndex.value = null
}

// 删除章节
const removeSection = (index: number) => {
  if (localOutline.value.length <= 1) return
  localOutline.value.splice(index, 1)
  // 重新编号
  localOutline.value.forEach((item, idx) => {
    item.section = idx + 1
  })
}

// 添加章节
const addSection = () => {
  const newSection = localOutline.value.length + 1
  localOutline.value.push({
    section: newSection,
    title: `第${newSection}章`,
    points: ['请输入要点'],
  })
}

// 添加要点
const addPoint = (sectionIndex: number) => {
  localOutline.value[sectionIndex].points.push('')
}

// 删除要点
const removePoint = (sectionIndex: number, pointIndex: number) => {
  if (localOutline.value[sectionIndex].points.length <= 1) return
  localOutline.value[sectionIndex].points.splice(pointIndex, 1)
}

// 是否可以确认
const canConfirm = computed(() => {
  if (localOutline.value.length === 0) return false
  return localOutline.value.every(
    (item) => item.title.trim() && item.points.length > 0 && item.points.some((p) => p.trim()),
  )
})

// 确认大纲
const handleConfirm = () => {
  const result = localOutline.value.map((item, idx) => ({
    section: idx + 1,
    title: item.title.trim(),
    points: item.points.filter((p) => p.trim()),
  }))
  emit('confirm', result)
}
</script>

<style scoped lang="scss">
.outline-editing-stage {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stage-header {
  text-align: center;
  margin-bottom: 40px;
}

.stage-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--color-text);
}

.stage-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.outline-item {
  background: var(--color-background-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.2s;

  &.editing {
    border-color: var(--color-primary);
    background: rgba(34, 197, 94, 0.04);
  }

  &:hover {
    border-color: var(--color-primary-light, #86efac);
  }
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.drag-icon {
  color: var(--color-text-muted);
  cursor: grab;
  font-size: 16px;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
}

.section-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.section-title-display {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  &:hover .edit-hint {
    opacity: 1;
  }
}

.edit-hint {
  font-size: 13px;
  color: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s;
}

.section-title-input {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.delete-btn {
  flex-shrink: 0;
}

.points-list {
  padding-left: 48px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.point-dot {
  color: var(--color-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.point-input {
  flex: 1;
  font-size: 14px;
}

.point-delete {
  flex-shrink: 0;
}

.add-point-btn {
  margin-top: 4px;
  font-size: 13px;
  width: auto;
  color: var(--color-text-muted);
  border-color: var(--color-border);

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.add-section-btn {
  margin-bottom: 32px;
  height: 44px;
  font-size: 14px;
  border-color: var(--color-border);
  color: var(--color-text-secondary);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

.actions {
  display: flex;
  justify-content: center;
}

.confirm-btn {
  height: 48px;
  padding: 0 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3) !important;

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4) !important;
  }

  &:disabled {
    background: var(--color-border) !important;
    box-shadow: none !important;
    opacity: 0.6;
  }
}
</style>
