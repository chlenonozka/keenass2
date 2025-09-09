import http from '../api/http'

export interface UploadResponse {
  url: string
  name: string
  id?: string | number
}

export class UploadService {
  private uploadsUrl = process.env.REACT_APP_UPLOADS_URL || '/uploads'

  async uploadFile(file: File): Promise<UploadResponse> {
    const fd = new FormData()
    fd.append('file', file)
    
    const { data } = await http.post<any>(this.uploadsUrl, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    const item = Array.isArray(data) ? data[0] : (data?.data ?? data)
    const url: string = item?.url || item?.path || item?.src
    if (!url) throw new Error('Сервер не вернул ссылку на файл')
    
    const clean = String(url).split('?')[0].split('#')[0]
    const name = clean.substring(clean.lastIndexOf('/') + 1)
    
    return { 
      url, 
      name, 
      id: item?.id 
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const { data } = await http.get<any[]>(this.uploadsUrl, {
        params: { url: fileUrl }
      })

      const imageId = data.length > 0 ? data[0].id : undefined
      
      if (imageId) {
        await http.delete(`${this.uploadsUrl}/${imageId}`)
      } else {
        console.error('Не удалось найти ID изображения')
      }
    } catch (error) {
      console.error('Ошибка при удалении файла:', error)
      throw error
    }
  }

  async findFileByUrl(url: string): Promise<any> {
    const { data } = await http.get<any[]>(this.uploadsUrl, {
      params: { url }
    })
    return data.length > 0 ? data[0] : null
  }
}