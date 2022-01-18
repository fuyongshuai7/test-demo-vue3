<template>
    <div class="bpmn">
        <LinkBlock :data="linkData"></LinkBlock>
        <div>
            <button type="button" @click="createDiagram">新建图表</button>
        </div>
        <div ref="jsCanvasRef" class="js-canvas"></div>
        <div ref="jsPropertiesPanelRef" class="js-properties-panel"></div>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted } from 'vue';
import LinkBlock, { DataType } from '@/components/LinkBlock/index.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BpmnPropertiesPanelModule from 'bpmn-js-properties-panel'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BpmnPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import diagramXML from './resources/newDiagram.js'

// 链接列表
const linkData: DataType[] = [
    {
        href: "https://bpmn.io/toolkit/bpmn-js/examples/",
        label: "官网"
    },
    {
        href: "https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel",
        label: "bpmn-js Modeler + Properties Panel Example (github)"
    }
]

const jsCanvasRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>()
const jsPropertiesPanelRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>()

let bpmnModeler: any = null
onMounted(() => {
    initBpmnModeler()
})

function initBpmnModeler() {
    bpmnModeler = new BpmnModeler({
        container: jsCanvasRef.value,
        propertiesPanel: {
            parent: jsPropertiesPanelRef.value
        },
        additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule
        ]
    })
}

async function createDiagram() {
    openDiagram(diagramXML)
}

async function openDiagram(xml: any) {
    try {
        await bpmnModeler.importXML(xml);
    } catch (err) {
        console.error(err);
    }
}

</script>
<style lang="scss" scoped>
.bpmn {
    height: 100%;
    .js-canvas {
        height: 500px;
    }
    .js-properties-panel {
    }
}
</style>