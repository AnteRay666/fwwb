<template>
    <el-dialog :model-value="visible">

    </el-dialog>
</template>

<script>
import LoginPage from './LoginPage.vue'
import RegisterPage from './RegisterPage.vue'

export default {

    props: {
        visible: Boolean
    },

}

</script>
<script setup>
// 修正事件定义
defineEmits(['update:visible', 'success'])
</script>
<style>
.component-container {
    min-height: 300px;
    /* 保持内容高度稳定 */
}
</style>
