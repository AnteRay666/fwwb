<!-- ContextMenu.vue -->
<template>
    <div v-show="visible" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }" @click.stop>
        <div v-for="item in menuItems" :key="item.command" class="menu-item" @click="handleSelect(item.command)">
            {{ item.label }}
        </div>
    </div>
</template>

<script setup>
defineProps({
    visible: Boolean,
    x: Number,
    y: Number,
    menuItems: Array
})

const emit = defineEmits(['select'])

const handleSelect = (command) => {
    emit('select', command)
}
</script>

<style scoped>
.context-menu {
    position: fixed;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    z-index: 9999;
}

.menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.menu-item:hover {
    background: #f5f7fa;
}
</style>