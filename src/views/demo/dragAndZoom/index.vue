<template>
    <div class="drag-and-zoom">
        <img ref="dragRef" src="https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg"
            alt="just-very-cute">

        <div class="operation-group">
            <button @click="zoom('up', 0.3)">放大</button>
            <button @click="zoom('down', 0.3)">缩小</button>
            <button @click="remove">dispose</button>
            <button>rebind</button>
            <button>reset</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DragAndZoom from '@/utils/dragAndZoom'

const dragRef = ref<HTMLImageElement>()

let instance: DragAndZoom
onMounted(() => {
    if (dragRef.value) {
        dragRef.value.onload = () => {
            instance = new DragAndZoom(dragRef.value as HTMLImageElement)
        }
    }
})

let currentZoomSize: number = 1
const zoom = (type: 'up' | 'down', step: number) => {
    switch (type) {
        case 'up': {
            currentZoomSize += step
            break
        }
        case 'down': {
            currentZoomSize -= step
            break
        }
    }
    instance.zoom(currentZoomSize)
}

const remove = () => {
    instance.dispose()
}
</script>
<style lang="scss" scoped>
.drag-and-zoom {
    border: 1px solid red;
    width: 200px;
    height: 500px;
    overflow: hidden;
    position: relative;

    img {
        border: 1px solid green;
    }

    .operation-group {
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 0;
        left: 0;

        button {
            &+button {
                margin-left: 10px;
            }
        }
    }
}
</style>