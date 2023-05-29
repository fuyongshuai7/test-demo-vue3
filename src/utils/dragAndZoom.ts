// @ts-expect-error 没有ts申明文件
import AlloyFinger from 'alloyfinger'

interface DragAndZoomOptions {
    zoom?: {
        max?: number,
        min?: number
    },
    boundaryRebound?: boolean, // 设置边界回弹，true时超出父元素时会回弹
    beforeMoving?: () => boolean, // 移动前回调，返回true才能拖动
}
export default class DragAndZoom {
    constructor(e: HTMLElement, options?: DragAndZoomOptions, parentElement?: HTMLElement) {
        if (!e) {
            console.error('dom 不存在')
        } else {
            this.dom = e
            this._initOptions(options)
            this.parentElement = parentElement || this.dom.parentElement
            this._init()
        }
    }

    private dom: HTMLElement | null = null
    private cacheTranslateAfterPinch = { x: 0, y: 0 }
    private defaultZoom = { max: 10, min: 1 }
    private options: DragAndZoomOptions = {
        zoom: this.defaultZoom,
        boundaryRebound: true,
        beforeMoving: () => true
    }
    private parentElement: HTMLElement | null = null
    private afInstance: any
    private isFullscreen: boolean = false // 是否全屏，全屏下scale超出1后会无效，所以在全屏状态下缩放需要用修改宽高的方式
    private screen = { height: window.screen.height, width: window.screen.width }

    // 轮询options，设置options
    private loop = (baseObject: { [attr: string]: any }, assignObject: { [attr: string]: any }) => {
        for (const key in baseObject) {
            if (Object.prototype.hasOwnProperty.call(baseObject, key)) {
                const value = baseObject[key as keyof DragAndZoomOptions]; // 这边默认value都有值，因为是默认值
                const assignValue = assignObject?.[key]
                const assignValueIsObjectType = Object.prototype.toString.call(value) === '[object Object]'
                if (assignValue !== undefined && assignValue !== null && !assignValueIsObjectType) {
                    baseObject[key as keyof DragAndZoomOptions] = assignValue
                } else if (assignValueIsObjectType) {
                    this.loop(value, assignObject[key])
                }
            }
        }
        return baseObject
    }
    private _initOptions = (options?: DragAndZoomOptions) => {
        const defaultOptions = {
            zoom: this.defaultZoom,
            boundaryRebound: true,
            beforeMoving: () => true
        }
        if (!options) {
            this.options = defaultOptions
        } else {
            this.options = this.loop(defaultOptions, options)
        }
    }

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

                this.setTransform(this.movingTranslate.x, this.movingTranslate.y, true)
            },
            multipointEnd: () => {
                if (this.isZooming) {
                    this.lastTranslate.x = this.cacheTranslateAfterPinch.x
                    this.lastTranslate.y = this.cacheTranslateAfterPinch.y
                }
                if (this.options.boundaryRebound) {
                    this.setDomDragBoundary()
                }
            },
            pinch: (e: any) => {
                // 缩放
                const { width, height } = this.dom!.getClientRects()[0]

                this.setZoomingTimeout()

                const { zoom: size } = e
                let zoomWidth = width * size
                let zoomHeight = height * size

                // 最大最小宽高逻辑 ===
                const _minSize = this.options.zoom?.min || this.defaultZoom.max
                const _maxSize = this.options.zoom?.max || this.defaultZoom.min
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

                const distanceX = (zoomWidth - width) / 2
                const distanceY = (zoomHeight - height) / 2

                const translateX = this.lastTranslate.x - distanceX
                const translateY = this.lastTranslate.y - distanceY

                if (this.isFullscreen) {
                    this.dom!.style.width = `${zoomWidth}px`
                    this.dom!.style.height = `${zoomHeight}px`

                } else {
                    const zoomScale = zoomWidth / this.dom!.clientHeight
                    this.scale = zoomScale
                }
                this.setTransform(translateX, translateY, false)

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
        this.dom!.addEventListener('mouseup', this.mouseUpHandler)
        this.dom!.addEventListener('mousemove', this.mouseMoveHandler)
        this.dom!.addEventListener('mousedown', this.mouseDownHandler)

        // 绑定一个document鼠标弹起监听, 当离开鼠标离开元素弹起的时候能够取消拖拽
        document.addEventListener('mouseup', this.mouseUpHandler)
        // 全屏恢复时需要重新调整位置
        document.addEventListener('fullscreenchange', this.fullscreenChangeHandler)
    }
    // 移除鼠标事件
    private unbindmouseEventHandler = () => {
        this.dom!.removeEventListener('mouseup', this.mouseUpHandler)
        this.dom!.removeEventListener('mousemove', this.mouseMoveHandler)
        this.dom!.removeEventListener('mousedown', this.mouseDownHandler)

        document.removeEventListener('mouseup', this.mouseUpHandler)
        document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler)
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
    private mouseUpHandler = () => {
        this.isMouseDown = false
        this.setTransform(this.movingTranslate.x, this.movingTranslate.y)
        this.setDomDragBoundary()
    }
    private mouseMoveHandler = (e: MouseEvent) => {
        if (!this.isMouseDown || !this.options?.beforeMoving?.() || this.isZooming) return

        e.preventDefault()
        e.stopPropagation()
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
        this.setTransform(this.movingTranslate.x, this.movingTranslate.y, false)

        // 拖拽实现 。。。。。。。。。。。。。。。
    }

    private mouseDownHandler = (e: MouseEvent) => {
        this.isMouseDown = true
        this.downPointer.x = e.clientX
        this.downPointer.y = e.clientY
    }

    private fullscreenChangeHandler = () => {
        if (!document.fullscreenElement) {
            this.isFullscreen = false
            this.dom!.style.height = `${this.originSize.height}px`
            this.dom!.style.width = `${this.originSize.width}px`
            this.setDomDragBoundary()
        } else {
            this.isFullscreen = true
            const { height, width } = this.screen
            this.dom!.style.height = `${height}px`
            this.dom!.style.width = `${width}px`
        }
    }

    private setTransform = (x: number, y: number, setLastTransform = true) => {
        if (this.isFullscreen) {
            this.dom!.style.transform = `translate(${x}px, ${y}px)`
        } else {
            this.dom!.style.transform = `translate(${x}px, ${y}px) scale(${this.scale})`
        }

        if (setLastTransform) {
            this.lastTranslate.x = x
            this.lastTranslate.y = y
        }
    }

    // TODO: 边界范围
    // TODO: 只有整个元素都在父元素之外的时候才要重新定位边界
    private setDomDragBoundary = () => {
        if (!this.options.boundaryRebound) return
        const { top: domTop, right: domRight, bottom: domBottom, left: domLeft, width: domWidth, height: domHeight } = this.dom!.getClientRects()[0]
        const { top: parentTop, right: parentRight, bottom: parentBottom, left: parentLeft, width: parentWidth, height: parentHeight } = this.parentElement!.getClientRects()[0]

        if (this.isFullscreen) {
            if (domWidth > parentWidth) {
                // 子元素宽度大于父元素时的逻辑
                if (domRight <= parentRight) {
                    // 右边界
                    this.movingTranslate.x = this.parentElement!.clientWidth - this.dom!.clientWidth
                }
                if (domLeft >= parentLeft) {
                    // 左边界
                    this.movingTranslate.x = 0
                }
            }
            if (domWidth <= parentWidth) {
                // 子元素宽度小于父元素时的逻辑
                if (domRight >= parentRight) {
                    // 右边界
                    this.movingTranslate.x = this.parentElement!.clientWidth - this.dom!.clientWidth
                }
                if (domLeft <= parentLeft) {
                    // 左边界
                    this.movingTranslate.x = 0
                }
            }
            if (domHeight > parentHeight) {
                // 子元素高度大于父元素时的逻辑
                if (domBottom <= parentBottom) {
                    // 下边界
                    this.movingTranslate.y = this.parentElement!.clientHeight - this.dom!.clientHeight
                }
                if (domTop >= parentTop) {
                    // 上边界
                    this.movingTranslate.y = 0
                }
            }
            if (domHeight <= parentHeight) {
                // 子元素高度小于父元素时的逻辑
                if (domBottom >= parentBottom) {
                    // 下边界
                    this.movingTranslate.y = this.parentElement!.clientHeight - this.dom!.clientHeight
                }
                if (domTop <= parentTop) {
                    // 上边界
                    this.movingTranslate.y = 0
                }
            }
        } else {
            if (domWidth > parentWidth) {
                // 子元素宽度大于父元素时的逻辑
                if (domRight <= parentRight) {
                    // 右边界
                    this.movingTranslate.x -= domRight - parentRight
                }
                if (domLeft >= parentLeft) {
                    // 左边界
                    this.movingTranslate.x = (domWidth - this.dom!.clientWidth) / 2
                }
            }
            if (domWidth <= parentWidth) {
                // 子元素宽度小于父元素时的逻辑
                if (domRight >= parentRight) {
                    // 右边界
                    this.movingTranslate.x = this.parentElement!.clientWidth - this.dom!.clientWidth + (this.dom!.clientWidth - domWidth) / 2
                }
                if (domLeft <= parentLeft) {
                    // 左边界
                    this.movingTranslate.x = -(this.dom!.clientWidth - domWidth) / 2
                }
            }
            if (domHeight > parentHeight) {
                // 子元素高度大于父元素时的逻辑
                if (domBottom <= parentBottom) {
                    // 下边界
                    this.movingTranslate.y -= domBottom - parentBottom
                }
                if (domTop >= parentTop) {
                    // 上边界
                    this.movingTranslate.y = (domHeight - this.dom!.clientHeight) / 2
                }
            }
            if (domHeight <= parentHeight) {
                // 子元素高度小于父元素时的逻辑
                if (domBottom >= parentBottom) {
                    // 下边界
                    this.movingTranslate.y = this.parentElement!.clientHeight - this.dom!.clientHeight + (this.dom!.clientHeight - domHeight) / 2
                }
                if (domTop <= parentTop) {
                    // 上边界
                    this.movingTranslate.y = -(this.dom!.clientHeight - domHeight) / 2
                }
            }
        }

        this.setTransform(this.movingTranslate.x, this.movingTranslate.y, true)
    }

    private originSize = { width: 0, height: 0 } // dom原始值
    private lastSize = { width: 0, height: 0 } // dom最后的尺寸,用来计算放大缩小后元素居中
    private scale = 1
    public zoom = (size: number) => {
        if (size > (this.options?.zoom?.max || this.defaultZoom.max) || size < (this.options?.zoom?.min || this.defaultZoom.min)) return

        this.setZoomingTimeout()

        this.scale = size

        const width = this.originSize.width * size
        const height = this.originSize.height * size

        if (this.isFullscreen) {
            this.dom!.style.width = `${width * size}px`
            this.dom!.style.height = `${height * size}px`
        }

        const distanceX = (width - this.lastSize.width) / 2
        const distanceY = (height - this.lastSize.height) / 2

        this.lastTranslate.x -= distanceX
        this.lastTranslate.y -= distanceY

        if (this.options.boundaryRebound) {
            this.setDomDragBoundary()
        } else {
            this.setTransform(this.lastTranslate.x, this.lastTranslate.y, true)
        }
    }

    // 移除事件绑定
    public dispose = () => {
        this.unbindmouseEventHandler()
    }
}