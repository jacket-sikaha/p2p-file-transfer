import { toDataURL } from 'qrcode'
import { useRoute } from 'vue-router'

export const handleQRCode = () => {
  // useRoute 是一个 Composition API 钩子函数，它只能在组件的 setup 函数或 <script setup> 中使用
  const route = useRoute()
  return route.query.id as string
}

/**
 * 触发文件下载（针对 Blob 类型）
 * @param blob Blob 数据
 * @param filename 完整的文件名（必须包含后缀，如 "file.pdf"）
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // 创建一个隐藏的 <a> 元素
  const link = document.createElement('a')
  link.style.display = 'none'
  document.body.appendChild(link)

  // 生成 Object URL
  const url = URL.createObjectURL(blob)

  // 设置下载属性（使用传入的完整文件名）
  link.href = url
  link.download = filename

  // 模拟点击触发下载
  link.click()

  // 清理生成的 Object URL（延迟确保下载触发）
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }, 100)
}

export const toQRCodeDataURL = async (text: string) => {
  const opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
  }
  const canvas = document.createElement('canvas')

  return await toDataURL(canvas, text, opts)
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
