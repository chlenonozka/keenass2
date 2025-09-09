import http from '../api/http'
import type { Post, CreatePostDTO, Comment, CreateCommentDTO, ID } from '../types'
import { UploadResponse } from './upload.service'

export class PostService {
  private postsUrl = process.env.REACT_APP_POSTS_URL || '/posts'
  private commentsUrl = process.env.REACT_APP_COMMENTS_URL || '/comments'
  private uploadsUrl = process.env.REACT_APP_UPLOADS_URL || '/uploads'
  private usersUrl = process.env.REACT_APP_USERS_URL || '/users'

  async getPosts(): Promise<Post[]> {
    const { data } = await http.get<Post[]>(this.postsUrl)
    return data
  }

  async createPost(dto: CreatePostDTO): Promise<Post> {
    const { data } = await http.post<Post>(this.postsUrl, dto)
    return data
  }

  async deletePost(id: ID): Promise<void> {
    await http.delete(`${this.postsUrl}/${id}`)
  }

  async getComments(postId: ID): Promise<Comment[]> {
    const { data } = await http.get<Comment[]>(this.commentsUrl, { 
      params: { post_id: postId } 
    })
    return data
  }

  async createComment(dto: CreateCommentDTO): Promise<Comment> {
    const { data } = await http.post<Comment>(this.commentsUrl, dto)
    return data
  }

  async deleteComment(commentId: ID): Promise<void> {
    await http.delete(`${this.commentsUrl}/${commentId}`)
  }

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

  async deleteUploadedFile(fileUrl: string): Promise<void> {
    const { data } = await http.get<any[]>(this.uploadsUrl, {
      params: { url: fileUrl }
    })

    const imageId = data.length > 0 ? data[0].id : undefined
    if (imageId) {
      await http.delete(`${this.uploadsUrl}/${imageId}`)
    }
  }

  async getUserAvatar(userId: ID): Promise<string> {
    const { data } = await http.get<{ avatarUrl: string }>(`${this.usersUrl}/${userId}/avatar`)
    return data.avatarUrl
  }

  async updateUser(userId: ID, update: Partial<any>): Promise<void> {
    await http.patch(`${this.usersUrl}/${userId}`, update)
  }

  async updatePost(postId: ID, update: Partial<Post>): Promise<void> {
    await http.patch(`${this.postsUrl}/${postId}`, update)
  }

  async updateComment(commentId: ID, update: Partial<Comment>): Promise<void> {
    await http.patch(`${this.commentsUrl}/${commentId}`, update)
  }
}