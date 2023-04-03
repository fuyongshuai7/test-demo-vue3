// @ts-expect-error 没有ts申明文件
import AlloyFinger from 'alloyfinger'

interface DragAndZoomOptions {
    zoom?: {
        max?: number,
        min?: number
    }
    beforeMoving?: () => boolean, // 移动前回调，返回true才能拖动
}
export default class DragAndZoom {
    constructor(e: HTMLElement, options?: DragAndZoomOptions, parentElement?: HTMLElement) {
        if (!e) {
            console.error('dom 不存在')
        } else {
            this.dom = e
            this.options = options || { zoom: this.defaultZoom, beforeMoving: () => true }
            this.parentElement = parentElement || this.dom.parentElement
            this._init()
        }
    }

    private dom: HTMLElement | null = null
    private cacheTranslateAfterPinch = { x: 0, y: 0 }
    private defaultZoom = { max: 10, min: 0.5 }
    private initScale = { width: 0, height: 0 }
    private options: DragAndZoomOptions = { zoom: this.defaultZoom, beforeMoving: () => true }
    private parentElement: HTMLElement | null = null
    private afInstance: any

    private _init = () => {
        // 绑定事件
        this.bindMouseEventHandler()

        // 保存初始尺寸
        this.originSize.height = this.dom!.clientHeight
        this.originSize.width = this.dom!.clientWidth
        this.lastSize.height = this.dom!.clientHeight
        this.lastSize.width = this.dom!.clientWidth

        // ==============
        // 触摸事件
        this.afInstance = new AlloyFinger(this.dom, {
            pressMove: (e: any) => {
                if (this.isZooming) return

                // 移动
                const { deltaX, deltaY } = e // x, y 的偏移量
                this.movingTranslate.x = deltaX + this.lastTranslate.x
                this.movingTranslate.y = deltaY + this.lastTranslate.y;

                this.dom!.style.transform = `translate(${this.movingTranslate.x}px, ${this.movingTranslate.y}px)`

                this.lastTranslate.x = this.movingTranslate.x
                this.lastTranslate.y = this.movingTranslate.y
            },
            multipointStart: () => {
                this.initScale.width = this.dom!.clientWidth
                this.initScale.height = this.dom!.clientHeight
            },
            multipointEnd: () => {
                if (this.isZooming) {
                    this.lastTranslate.x = this.cacheTranslateAfterPinch.x
                    this.lastTranslate.y = this.cacheTranslateAfterPinch.y
                }

                this.setDomDragBoundary()
            },
            pinch: (e: any) => {
                this.setZoomingTimeout()

                // 缩放
                const { zoom } = e
                const size = zoom

                const width = this.initScale.width
                const height = this.initScale.height

                let zoomWidth = width * size
                let zoomHeight = height * size

                // 最大最小宽高逻辑 ===
                const _minSize = this.options.zoom!.min as number
                const _maxSize = this.options.zoom!.max as number
                const _minWidth = this.originSize.width * _minSize
                const _minHeight = this.originSize.height * _minSize
                const _maxWidth = this.originSize.width * _maxSize
                const _maxHeight = this.originSize.height * _maxSize

                if (zoomWidth < _minWidth) {
                    zoomWidth = _minWidth
                }
                if (zoomHeight < _minHeight) {
                    zoomHeight = _minHeight
                }

                if (zoomWidth > _maxWidth) {
                    zoomWidth = _maxWidth
                }
                if (zoomHeight > _maxHeight) {
                    zoomHeight = _maxHeight
                }
                // 最大最小宽高逻辑 。。。

                this.dom!.style.width = `${zoomWidth}px`
                this.dom!.style.height = `${zoomHeight}px`

                const distanceX = (zoomWidth - width) / 2
                const distanceY = (zoomHeight - height) / 2

                const translateX = this.lastTranslate.x - distanceX
                const translateY = this.lastTranslate.y - distanceY

                this.dom!.style.transform = `translate(${translateX}px, ${translateY}px)`

                // 保存偏移，等缩放结束后设置lastTranslate
                this.cacheTranslateAfterPinch.x = translateX
                this.cacheTranslateAfterPinch.y = translateY
            }
        })
        // 触摸事件
        // 。。。。。。。。。。。。。
    }

    // 绑定鼠标事件
    private bindMouseEventHandler = () => {
        this.dom!.addEventListener('mouseup', this.videoMouseUpHandler)
        this.dom!.addEventListener('mousemove', this.videoMouseMoveHandler)
        this.dom!.addEventListener('mousedown', this.videoMouseDownHandler)

        // 绑定一个document鼠标弹起监听, 当离开鼠标离开元素弹起的时候能够取消拖拽
        document.addEventListener('mouseup', this.videoMouseUpHandler)
    }
    // 移除鼠标事件
    private unbindVideoMouseEventHandler = () => {
        this.dom!.removeEventListener('mouseup', this.videoMouseUpHandler)
        this.dom!.removeEventListener('mousemove', this.videoMouseMoveHandler)
        this.dom!.removeEventListener('mousedown', this.videoMouseDownHandler)

        document.removeEventListener('mouseup', this.videoMouseUpHandler)
    }

    private zoomingTimeout: null | number = null
    private isZooming = false // 缩放的时候移动操作就停止

    private setZoomingTimeout = () => {
        this.isZooming = true

        if (this.zoomingTimeout) {
            clearTimeout(this.zoomingTimeout)
        }
        this.zoomingTimeout = setTimeout(() => {
            this.isZooming = false
        }, 300) as unknown as number;
    }

    private isMouseDown = false // 鼠标按下中
    private downPointer = { x: 0, y: 0 } // 按下时的点,用来计算移动时偏移
    private movingTranslate = { x: 0, y: 0 } // 移动的偏移
    private lastTranslate = { x: 0, y: 0 } // 鼠标弹起后的元素偏移
    private videoMouseUpHandler = () => {
        this.isMouseDown = false
        this.setDomDragBoundary()
    }
    private videoMouseMoveHandler = (e: MouseEvent) => {
        if (!this.isMouseDown || !this.options?.beforeMoving?.() || this.isZooming) return

        // 拖拽实现 ====================
        // 踩个坑，e.offsetX 数值没有那么准确，会发生抖动现象，改用clientX
        const movePointer = {
            x: e.clientX,
            y: e.clientY
        }

        const movingX = movePointer.x - this.downPointer.x
        const movingY = movePointer.y - this.downPointer.y

        this.movingTranslate.x = movingX + this.lastTranslate.x
        this.movingTranslate.y = movingY + this.lastTranslate.y;
        this.dom!.style.transform = `translate(${this.movingTranslate.x}px, ${this.movingTranslate.y}px)`

        // 拖拽实现 。。。。。。。。。。。。。。。
    }

    private videoMouseDownHandler = (e: MouseEvent) => {
        this.isMouseDown = true
        this.downPointer.x = e.clientX
        this.downPointer.y = e.clientY
    }

    // TODO: 边界范围
    private setDomDragBoundary = () => {
        const { top: domTop, right: domRight, bottom: domBottom, left: domLeft, width: domWidth } = this.dom!.getClientRects()[0]
        const { top: parentTop, right: parentRight, bottom: parentBottom, left: parentLeft, width: parentWidth } = this.parentElement!.getClientRects()[0]

        if (domWidth > parentWidth) {
            // 子元素大于父元素时的逻辑
            if (domRight <= parentRight) {
                // 右边界
                this.movingTranslate.x = this.parentElement!.clientWidth - this.dom!.clientWidth
            }
            if (domLeft >= parentLeft) {
                // 左边界
                this.movingTranslate.x = 0
            }
            if (domTop >= parentTop) {
                // 上边界
                this.movingTranslate.y = 0
            }
            if (domBottom <= parentBottom) {
                // 下边界
                this.movingTranslate.y = this.parentElement!.clientHeight - this.dom!.clientHeight
            }
        } else {
            // 子元素小于父元素时的逻辑
            if (domRight >= parentRight) {
                // 右边界
                this.movingTranslate.x = this.parentElement!.clientWidth - this.dom!.clientWidth
            }
            if (domLeft <= parentLeft) {
                // 左边界
                this.movingTranslate.x = 0
            }
            if (domTop <= parentTop) {
                // 上边界
                this.movingTranslate.y = 0
            }
            if (domBottom >= parentBottom) {
                // 下边界
                this.movingTranslate.y = this.parentElement!.clientHeight - this.dom!.clientHeight
            }
        }

        this.dom!.style.transform = `translate(${this.movingTranslate.x}px, ${this.movingTranslate.y}px)`

        this.lastTranslate.x = this.movingTranslate.x
        this.lastTranslate.y = this.movingTranslate.y
    }

    private originSize = { width: 0, height: 0 } // dom原始值
    private lastSize = { width: 0, height: 0 } // dom最后的尺寸,用来计算放大缩小后元素居中
    public zoom = (size: number) => {
        if (size > (this.options?.zoom?.max || this.defaultZoom.max) || size < (this.options?.zoom?.min || this.defaultZoom.min)) return

        this.setZoomingTimeout()

        const width = this.originSize.width * size
        const height = this.originSize.height * size

        this.dom!.style.width = `${width * size}px`
        this.dom!.style.height = `${height * size}px`

        const distanceX = (width - this.lastSize.width) / 2
        const distanceY = (height - this.lastSize.height) / 2

        this.lastTranslate.x -= distanceX
        this.lastTranslate.y -= distanceY

        this.setDomDragBoundary()
        // this.dom!.style.transform = `translate(${this.lastTranslate.x}px, ${this.lastTranslate.y}px)`
    }

    // 移除事件绑定
    public dispose = () => {
        this.unbindVideoMouseEventHandler()
    }
}