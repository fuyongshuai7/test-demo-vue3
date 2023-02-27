<template>
    <div class="bpmn">
        <LinkBlock :data="linkData"></LinkBlock>
        <div class="tool-wrapper">
            <div>
                <button @click="createDiagram">新建图表</button>
                <button @click="improtFile">导入图表</button>
                <input ref="importFileRef" style="display: none;" type="file" name="xml" id="xml" accept=".bpmn" />
            </div>
            <div>
                <span>download：</span>
                <button @click="download('svg')">.svg</button>
                <button @click="download('bpmn')">.bpmn</button>
            </div>
        </div>
        <div class="bpmn-wrapper">
            <div ref="jsCanvasRef" class="js-canvas"></div>
            <div ref="jsPropertiesPanelRef" class="js-properties-panel"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted } from 'vue';
import LinkBlock, { DataType } from '@/components/LinkBlock/index.vue'
// @ts-expect-error js文件没有申明文件
import BpmnModeler from 'bpmn-js/lib/Modeler';
// @ts-expect-error js文件没有申明文件
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css'
// @ts-expect-error js文件没有申明文件
import diagramXML from './resources/newDiagram.js'


// @ts-expect-error js文件没有申明文件
import magicPropertiesProviderModule from './components/provider/magic/index.js';
// @ts-expect-error js文件没有申明文件
import magicModdleDescriptor from './components/descriptors/magic.json';


// 链接列表
const linkData: DataType[] = [
    {
        href: "https://bpmn.io/toolkit/bpmn-js/examples/",
        label: "官网"
    },
    {
        href: "https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel",
        label: "bpmn-js Modeler + Properties Panel Example (github)"
    },
    {
        href: "https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel-extension",
        label: "自定义属性面板（github）"
    }
]

const importFileRef: Ref<HTMLInputElement | undefined> = ref<HTMLInputElement>()
const jsCanvasRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>()
const jsPropertiesPanelRef: Ref<HTMLDivElement | undefined> = ref<HTMLDivElement>()

let bpmnModeler: any = null
onMounted(() => {
    initBpmnModeler()
    importFileRef.value?.addEventListener("change", fileChange)
})

function initBpmnModeler() {
    bpmnModeler = new BpmnModeler({
        container: jsCanvasRef.value,
        propertiesPanel: {
            parent: jsPropertiesPanelRef.value
        },
        additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            magicPropertiesProviderModule
        ],
        moddleExtensions: {
            magic: magicModdleDescriptor
        }
    })
}

function createDiagram() {
    openDiagram(diagramXML)
}

function improtFile() {
    importFileRef.value?.click()
}

function fileChange() {
    const files: FileList | null | undefined = importFileRef.value?.files
    const fileReader: FileReader = new FileReader()
    fileReader.onload = (e) => {
        const xml = e.target?.result
        openDiagram(xml)
    }
    if (files) {
        fileReader.readAsText(files[0])
    }
    if (importFileRef.value) {
        // 相同文件无法触发change事件
        importFileRef.value.value = ""
    }
}

async function openDiagram(xml: any) {
    try {
        await bpmnModeler.importXML(xml);
    } catch (err) {
        console.error(err);
    }
}

async function download(type: string) {
    let data = null
    switch (type) {
        case "svg": {
            const { svg } = await bpmnModeler.saveSVG();
            data = svg
            break;
        }
        case "bpmn": {
            const { xml } = await bpmnModeler.saveXML({ format: true });
            data = xml
            break;
        }
    }
    if (data) {
        const a = document.createElement('a');
        a.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(data);
        a.download = 'diagram.' + type
        a.click()
    }
}

</script>
<style lang="scss" scoped>
.bpmn {
    height: 100%;

    .tool-wrapper {
        display: flex;
        justify-content: space-between;
    }

    .bpmn-wrapper {
        height: 500px;
        width: 100%;
        border: 1px solid;
        position: relative;

        .js-canvas {
            height: 100%;
            width: 100%;
        }

        .js-properties-panel {
            position: absolute;
            right: 20px;
            top: 0;
        }
    }
}

:deep {

    .bpp-properties-panel [type="text"],
    .bpp-properties-panel [contenteditable],
    .bpp-properties-panel textarea,
    .bpp-properties-panel select {
        width: auto;
    }
}
</style>