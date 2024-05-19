export const convertFileToElement = (file: File, type: 'file' = 'file') => {
  const typeMap: Record<typeof type, string> = {
    file: `<input type="text" disabled readonly title="${file.name}" value="${file.name}" id="${file.uid}">`
  }
  return typeMap[type]
}

export const convertStringToImg = (src: string) => {
  return `<img src=${src} alt />`
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
      resolve(reader.result as string) // 返回完整的 Data URL，包含 MIME 类型和 base64 编码前缀
    }

    reader.onerror = (error) => reject(error)
  })
}
