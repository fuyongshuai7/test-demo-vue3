import { turnBase64ImgToFile } from "@/utils"
import { PlayerOptions } from "./types"

export class Player {
    constructor(videoElement: HTMLVideoElement, options: PlayerOptions) {
        this.videoElement = videoElement
        this.options = options

        this.init()
    }

    private init() {
        // loop option set attributes
        for (const key in this.options) {
            const value = this.options[key as keyof PlayerOptions]
            if (value) {
                this.videoElement.setAttribute(key, value as string)
            }
        }

        this.bindEvent()
    }
    // 这边只绑定内部需要用到的事件，目前的想法是用户如果想加事件的话，自己在video标签上绑定
    private bindEvent() {
        this.videoElement.addEventListener('canplay', this.videoCanPlayHandler)
        this.videoElement.addEventListener('canplaythrough', this.videoCanPlayThroughHandler)
        this.videoElement.addEventListener('complete', this.videoCompleteHandler)
        this.videoElement.addEventListener('durationchange', this.videoDurationChangeHandler)
        this.videoElement.addEventListener('timeupdate', this.videoTimeUpdateHandler)
        this.videoElement.addEventListener('loadedmetadata', this.videoLoadedMetaDataHandler)
    }
    private videoCanPlayHandler = (e: Event) => {
        console.log('e: canplay', e)
    }
    private videoCanPlayThroughHandler = (e: Event) => {
        console.log('e: canplaythrough', e)
    }
    private videoCompleteHandler = (e: Event) => {
        console.log('e: complete', e)
    }
    private videoDurationChangeHandler = (e: Event) => {
        console.log('e: durationchange', e)
    }
    private videoTimeUpdateHandler = (e: Event) => {
        console.log('e: timeupdate', e)
    }
    private videoLoadedMetaDataHandler = (e: Event) => {
        console.log('e: loadedmetadata', e)
        this.duration = this.videoElement.duration
    }

    private videoElement: HTMLVideoElement // 视频组件dom
    private options: PlayerOptions // 配置项
    private lastVolume: number = 0.5 // 最后设置的声音
    private duration: number = 0 // 视频时长，单位秒

    // 播放
    public play() {
        this.videoElement.play()
    }

    // 暂停
    public pause() {
        this.videoElement.pause()
    }

    // 音量
    public get volume() {
        return this.videoElement.volume
    }

    // 设置音量
    public setVolume(volume: number) {
        this.videoElement.volume = volume
    }

    // 静音
    public mute() {
        this.lastVolume = this.videoElement.volume // 静音前保存最后的音量
        this.setVolume(0)
    }

    // 打开声音
    public openSound(volume?: number) {
        const _vol = volume || this.lastVolume
        this.setVolume(_vol)
    }

    // 全屏
    public fullScreen() {
        this.videoElement.requestFullscreen()
    }

    // 播放速率
    public playbackRate(rate: number) {
        this.videoElement.playbackRate = rate
    }

    // 截屏
    public screenshot(fileName: string) {
        this.videoElement.setAttribute('crossOrigin', 'anonymous')

        const canvas = document.createElement('canvas')
        const width = this.videoElement.offsetWidth || 400
        const height = this.videoElement.offsetHeight || 300
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.drawImage(this.videoElement, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png');

        // 转换成File
        // const date = new Date()
        // const year = date.getFullYear()
        // const month = date.getMonth() + 1
        // const day = date.getDate()
        // const fileName = year + month + day + '-' + Date.now()
        const file = turnBase64ImgToFile(dataUrl, fileName + '.png', 'image/png')
        return { dataUrl, file }
    }
}