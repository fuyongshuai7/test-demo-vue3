<template>
    <div class="snake-item">
        <div
            class="body"
            v-for="(item, index) in bodyList"
            :key="index"
            :style="{ top: item.yPos + 'px', left: item.xPos + 'px' }"
        >
            <div class="body_inner"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, defineExpose } from "vue"
import { PosType, ArrowCode } from '../types';

const bodyList: Ref<Array<PosType>> = ref([
    {
        yPos: 0,
        xPos: 0
    }
])

function getSnake(): Array<PosType> {
    return bodyList.value
}

function addBody(): void {
    const item: PosType = {
        ...bodyList.value[bodyList.value.length - 1],
    };
    bodyList.value.push(item);
}

function resetPos() {
    bodyList.value = [{ yPos: 0, xPos: 0 }]
}

function setBodyPos(direction: ArrowCode): void {
    for (let i = bodyList.value.length; i > 0; i--) {
        if (i - 1 === 0) {
            switch (direction) {
                case ArrowCode.ArrowUp:
                    bodyList.value[0].yPos -= 10;
                    break;
                case ArrowCode.ArrowDown:
                    bodyList.value[0].yPos += 10;
                    break;
                case ArrowCode.ArrowLeft:
                    bodyList.value[0].xPos -= 10;
                    break;
                case ArrowCode.ArrowRight:
                    bodyList.value[0].xPos += 10;
                    break
            }
            continue;
        }
        bodyList.value[i - 1].xPos = bodyList.value[i - 2].xPos
        bodyList.value[i - 1].yPos = bodyList.value[i - 2].yPos
    }
    // switch (direction) {
    //     case ArrowCode.ArrowUp:
    //         for (let i = bodyList.value.length; i > 0; i--) {
    //             if (i - 1 === 0) {
    //                 bodyList.value[0].yPos -= 10
    //             } else {
    //                 bodyList.value[i - 1].xPos = bodyList.value[i - 2].xPos
    //                 bodyList.value[i - 1].yPos = bodyList.value[i - 2].yPos
    //             }
    //         }
    //         break;
    //     case ArrowCode.ArrowDown:
    //         for (let i = bodyList.value.length; i > 0; i--) {
    //             if (i - 1 === 0) {
    //                 bodyList.value[0].yPos += 10
    //             } else {
    //                 bodyList.value[i - 1].xPos = bodyList.value[i - 2].xPos
    //                 bodyList.value[i - 1].yPos = bodyList.value[i - 2].yPos
    //             }
    //         }
    //         break;
    //     case ArrowCode.ArrowLeft:
    //         for (let i = bodyList.value.length; i > 0; i--) {
    //             if (i - 1 === 0) {
    //                 bodyList.value[0].xPos -= 10
    //             } else {
    //                 bodyList.value[i - 1].xPos = bodyList.value[i - 2].xPos
    //                 bodyList.value[i - 1].yPos = bodyList.value[i - 2].yPos
    //             }
    //         }
    //         break;
    //     case ArrowCode.ArrowRight:
    //         for (let i = bodyList.value.length; i > 0; i--) {
    //             if (i - 1 === 0) {
    //                 bodyList.value[0].xPos += 10
    //             } else {
    //                 bodyList.value[i - 1].xPos = bodyList.value[i - 2].xPos
    //                 bodyList.value[i - 1].yPos = bodyList.value[i - 2].yPos
    //             }
    //         }
    //         break;
    // }
}

defineExpose({
    getSnake,
    addBody,
    resetPos,
    setBodyPos
})

</script>
<style lang="scss" scoped>
.snake-item {
    width: 100%;
    height: 100%;
    background-color: #ddd;
    position: relative;
    .body {
        width: 10px;
        height: 10px;
        box-sizing: border-box;
        padding: 1px;
        position: absolute;
        margin: 0;
        .body_inner {
            width: 100%;
            height: 100%;
            background-color: #000;
        }
        &:first-child {
            .body_inner {
                background-color: red;
            }
        }
    }
}
</style>