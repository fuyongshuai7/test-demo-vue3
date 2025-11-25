<template>
    <div class="test">
        <div ref="dragRef" :style="{ width: '80px', height: '80px', background: 'red'}"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"

const dragRef = ref<HTMLImageElement>()
const isMouseDown = ref(false)
const downPointer = reactive({
    x: 0,
    y: 0
})

const movingTranslate = reactive({
    x: 0,
    y: 0
})

const lastTranslate = reactive({
    x: 0,
    y: 0
})
onMounted(() => {
    dragRef.value.addEventListener('mouseup', mouseUpHandler)
    dragRef.value.addEventListener('mousemove', mouseMoveHandler)
    dragRef.value.addEventListener('mousedown', mouseDownHandler)
})

const mouseUpHandler = () => {
    isMouseDown.value = false
}
const mouseMoveHandler = (e: MouseEvent) => {
    if(!isMouseDown.value) return

    e.preventDefault()
    e.stopPropagation()

    const movePointer = {
        x: e.clientX,
        y: e.clientY
    }

    const movingX = movePointer.x - downPointer.x
    const movingY = movePointer.y - downPointer.y

    movingTranslate.x = movingX + lastTranslate.x
    movingTranslate.y = movingY + lastTranslate.y;
    setTransform(movingTranslate.x, movingTranslate.y, false)
}

const mouseDownHandler = (e: MouseEvent) => {
    isMouseDown.value = true
    downPointer.x = e.clientX
    downPointer.y = e.clientY
}

const setTransform = (x: number, y: number, setLastTransform = true) => {
    dragRef.value.style.transform = `translate(${x}px, ${y}px) scale(1)`

    if (setLastTransform) {
        lastTranslate.x = x
        lastTranslate.y = y
    }
}

</script>
<style lang="scss" scoped>
</style>