import { makeAutoObservable, runInAction } from 'mobx'
import http from '../api/http'
import type { ID, Post, Comment, CreatePostDTO } from '../types'
import type { AuthStore } from './auth.store'
import { DEFAULT_AVATAR } from 'constants/ui'

export class PostsStore {
  private auth: AuthStore

  posts: Post[] = []
  commentsByPost: Record<ID, Comment[]> = {}
  previewCommentsByPost: Record<ID, Comment[]> = {}
  commentsCountByPost: Record<ID, number> = {}

  isLoadingPosts = false
  errorPosts: string | null = null

  private processingPosts = new Set<ID>()
  private processingComments = new Set<ID>()

  constructor(auth: AuthStore) {
    makeAutoObservable(this)
    this.auth = auth
  }

  isPostProcessing(id: ID) { return this.processingPosts.has(id) }
  isCommentProcessing(id: ID) { return this.processingComments.has(id) }
  private setPostProcessing(id: ID, on: boolean) { on ? this.processingPosts.add(id) : this.processingPosts.delete(id) }
  private setCommentProcessing(id: ID, on: boolean) { on ? this.processingComments.add(id) : this.processingComments.delete(id) }

  comments(postId: ID) { return this.commentsByPost[postId] ?? [] }
  commentsPreview(postId: ID) { return this.previewCommentsByPost[postId] ?? [] }
  commentsCount(postId: ID) {
    return this.commentsCountByPost[postId]
      ?? this.commentsByPost[postId]?.length
      ?? this.previewCommentsByPost[postId]?.length
      ?? 0
  }

  async uploadImage(file: File): Promise<{ url: string; name: string }> {
    const fd = new FormData()
    fd.append('file', file)

    const { data } = await http.post<any>('/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const item = Array.isArray(data) ? data[0] : (data?.data ?? data)
    const url: string = item?.url || item?.path || item?.src
    if (!url) throw new Error('Сервер не вернул ссылку на файл')

    const clean = String(url).split('?')[0].split('#')[0]
    const name = clean.substring(clean.lastIndexOf('/') + 1)

    return { url, name }
  }

  async fetchPosts() {
    this.isLoadingPosts = true
    this.errorPosts = null
    try {
      const { data } = await http.get<Post[]>('/posts')
      data.sort((a, b) => (b.createdAt?.localeCompare(a.createdAt || '') || 0))
      runInAction(() => (this.posts = data))

    } catch (e: any) {
      runInAction(() => (this.errorPosts = e?.response?.data?.message || 'Не удалось загрузить посты'))
    } finally {
      runInAction(() => (this.isLoadingPosts = false))
    }
  }

  async createPost(input: CreatePostDTO) {
    if (!this.auth.user) throw new Error('Требуется вход')
    const payload = {
      description: input.description,
      imageUrl: input.imageUrl,
      imageName: input.imageName,
      authorId: this.auth.user.id,
      authorName: this.auth.user.name,
      authorAvatarUrl: this.auth.user.avatarUrl,
      createdAt: new Date().toISOString()
    }
    const { data } = await http.post<Post>('/posts', payload)
    runInAction(() => {
      this.posts.unshift(data)

      this.previewCommentsByPost[data.id] = []
      this.commentsCountByPost[data.id] = 0
    })
  }

  async refreshCommentsPreview(postId: ID) {
    const { data } = await http.get<Comment[]>('/comments', { params: { post_id: postId } })
    data.sort((a, b) => (a.createdAt?.localeCompare(b.createdAt || '') || 0))
    const first3 = data.slice(0, 3)
    runInAction(() => {
      this.previewCommentsByPost[postId] = first3
      this.commentsCountByPost[postId] = data.length
    })
  }

  async ensureCommentsPreview(postId: ID) {
    if (this.commentsCountByPost[postId] === undefined) {
      try { await this.refreshCommentsPreview(postId) } catch {}
    }
  }

  async hardDeletePost(postId: ID) {
    this.setPostProcessing(postId, true);
    try {
      try {
        const { data } = await http.get<Comment[]>('/comments', { params: { post_id: postId } });
        await Promise.allSettled(data.map(c => http.delete(`/comments/${c.id}`)));
      } catch {}

      const post = this.posts.find(p => p.id === postId);

      if (post?.imageUrl) {
        try {
          console.log('URL изображения поста:', post.imageUrl);

          const { data } = await http.get<any[]>('/uploads', {
            params: { url: post.imageUrl } 
          });

          console.log('Ответ от сервера:', data);

          const imageId = data.length > 0 ? data[0].id : undefined;

          console.log('ID изображения из загрузок:', imageId);

          if (imageId) {
            await http.delete(`/uploads/${imageId}`);
            console.log('Изображение успешно удалено');
          } else {
            console.error('Не удалось найти ID изображения');
          }
        } catch (error) {
          console.error('Ошибка при удалении изображения поста:', error);
        }
      }

      await http.delete<void>(`/posts/${postId}`);
      console.log('Пост успешно удален');

      runInAction(() => {
        this.posts = this.posts.filter(p => p.id !== postId);
        delete this.commentsByPost[postId];
        delete this.previewCommentsByPost[postId];
        delete this.commentsCountByPost[postId];
      });
    } finally {
      this.setPostProcessing(postId, false);
    }
  }

  async fetchComments(postId: ID) {
    const { data } = await http.get<Comment[]>('/comments', { params: { post_id: postId } })
    data.sort((a, b) => (a.createdAt?.localeCompare(b.createdAt || '') || 0))
    runInAction(() => {
      this.commentsByPost[postId] = data
      this.commentsCountByPost[postId] = data.length
      this.previewCommentsByPost[postId] = data.slice(0, 3) 
    })
  }

  async addComment(postId: ID, text: string) {
    if (!this.auth.user) throw new Error('Требуется вход')
    const payload = {
      post_id: postId,
      text,
      authorId: this.auth.user.id,
      authorName: this.auth.user.name,
      authorAvatarUrl: this.auth.user.avatarUrl,
      createdAt: new Date().toISOString()
    }
    const { data } = await http.post<Comment>('/comments', payload)
    runInAction(() => {
      if (this.commentsByPost[postId]) {
        const list = this.commentsByPost[postId]
        this.commentsByPost[postId] = [...list, data].sort((a, b) =>
          (a.createdAt?.localeCompare(b.createdAt || '') || 0)
        )
      }

      const prevCount = this.commentsCountByPost[postId] ?? 0
      const newCount = prevCount + 1
      this.commentsCountByPost[postId] = newCount

      if (prevCount < 3) {
        const prev = this.previewCommentsByPost[postId] ?? []
        const merged = [...prev, data].sort((a, b) =>
          (a.createdAt?.localeCompare(b.createdAt || '') || 0)
        )
        this.previewCommentsByPost[postId] = merged.slice(0, 3)
      }

      this.posts = this.posts.map(p =>
        p.id === postId ? { ...p, commentsCount: newCount } : p
      )
    })
  }

  async fetchUserAvatar(userId: ID): Promise<string> {
    try {
      const { data } = await http.get<{ avatarUrl: string }>(`/users/${userId}/avatar`)
      return data.avatarUrl || DEFAULT_AVATAR
    } catch (e) {
      return DEFAULT_AVATAR
    }
  }

  async hardDeleteComment(postId: ID, commentId: ID) {
    this.setCommentProcessing(commentId, true)
    try {
      await http.delete<void>(`/comments/${commentId}`)
      runInAction(() => {
        if (this.commentsByPost[postId]) {
          this.commentsByPost[postId] =
            this.commentsByPost[postId].filter(c => c.id !== commentId)
        }
      })
      await this.refreshCommentsPreview(postId)
      runInAction(() => {
        this.posts = this.posts.map(p =>
          p.id === postId ? { ...p, commentsCount: this.commentsCount(postId) } : p
        )
      })
    } finally {
      this.setCommentProcessing(commentId, false)
    }
  }

  async updateAllUserAvatarsOnServer(userId: ID, newAvatarUrl: string) {
    try {
      const userPosts = this.posts.filter(p => p.authorId === userId);
      await Promise.allSettled(
        userPosts.map(post => 
          http.patch(`/posts/${post.id}`, { authorAvatarUrl: newAvatarUrl })
        )
      );

      const userComments: Comment[] = [];
      Object.values(this.commentsByPost).forEach(comments => {
        comments.filter(c => c.authorId === userId).forEach(c => userComments.push(c));
      });
      
      await Promise.allSettled(
        userComments.map(comment =>
          http.patch(`/comments/${comment.id}`, { authorAvatarUrl: newAvatarUrl })
        )
      );
    } catch (error) {
      console.error('Ошибка при массовом обновлении аватаров на сервере:', error);
    }
  }

  async updateAvatarInPostsAndComments(userId: ID, newAvatarUrl: string) {
    try {
      this.posts.forEach(post => {
        if (post.authorId === userId) {
          post.authorAvatarUrl = newAvatarUrl;
        }
      });

      Object.entries(this.commentsByPost).forEach(([postId, comments]) => {
        this.commentsByPost[Number(postId)] = comments.map(comment => {
          if (comment.authorId === userId) {
            return { ...comment, authorAvatarUrl: newAvatarUrl };
          }
          return comment;
        });
      });

      Object.entries(this.previewCommentsByPost).forEach(([postId, comments]) => {
        this.previewCommentsByPost[Number(postId)] = comments.map(comment => {
          if (comment.authorId === userId) {
            return { ...comment, authorAvatarUrl: newAvatarUrl };
          }
          return comment;
        });
      });

      this.posts = [...this.posts];
    } catch (error) {
      console.error('Ошибка при обновлении аватарок в постах и комментариях:', error);
    }
  }

  async updateAvatarOnServer(userId: ID, newAvatarUrl: string) {
    try {
      const payload = { avatarUrl: newAvatarUrl };
      const response = await http.patch(`/users/${userId}`, payload);

      if (response.status === 200) {
        await this.updateAllUserAvatarsOnServer(userId, newAvatarUrl);
        await this.updateAvatarInPostsAndComments(userId, newAvatarUrl);
      } else {
        throw new Error('Ошибка при обновлении аватарки на сервере');
      }
    } catch (error) {
      console.error('Ошибка при обновлении аватарки на сервере:', error);
    }
  }

  async refreshAvatarInCache(userId: ID, newAvatarUrl: string) {
    runInAction(() => {
      this.posts.forEach(post => {
        if (post.authorId === userId && post.authorAvatarUrl !== newAvatarUrl) {
          post.authorAvatarUrl = newAvatarUrl;
        }
      });

      Object.entries(this.commentsByPost).forEach(([postId, comments]) => {
        this.commentsByPost[Number(postId)] = comments.map(comment =>
          comment.authorId === userId && comment.authorAvatarUrl !== newAvatarUrl
            ? { ...comment, authorAvatarUrl: newAvatarUrl }
            : comment
        );
      });

      Object.entries(this.previewCommentsByPost).forEach(([postId, comments]) => {
        this.previewCommentsByPost[Number(postId)] = comments.map(comment =>
          comment.authorId === userId && comment.authorAvatarUrl !== newAvatarUrl
            ? { ...comment, authorAvatarUrl: newAvatarUrl }
            : comment
        );
      });

      this.posts = [...this.posts];  
    });
  }
}
