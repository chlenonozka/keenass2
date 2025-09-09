import { makeAutoObservable, runInAction } from 'mobx'
import { PostService } from '../services/post.service'
import type { ID, Post, Comment, CreatePostDTO } from '../types'
import type { AuthStore } from './auth.store'
import { DEFAULT_AVATAR } from '../constants/ui'

export class PostsStore {
  private auth: AuthStore
  private postService: PostService

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
    this.postService = new PostService()
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
    return this.postService.uploadFile(file)
  }

  async fetchPosts() {
    this.isLoadingPosts = true
    this.errorPosts = null
    try {
      const data = await this.postService.getPosts()
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
    
    const data = await this.postService.createPost(payload)
    runInAction(() => {
      this.posts.unshift(data)
      this.previewCommentsByPost[data.id] = []
      this.commentsCountByPost[data.id] = 0
    })
  }

  async refreshCommentsPreview(postId: ID) {
    const data = await this.postService.getComments(postId)
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
        const comments = await this.postService.getComments(postId);
        await Promise.allSettled(comments.map(c => this.postService.deleteComment(c.id)));
      } catch {}

      const post = this.posts.find(p => p.id === postId);

      if (post?.imageUrl) {
        try {
          await this.postService.deleteUploadedFile(post.imageUrl);
        } catch (error) {
          console.error('Ошибка при удалении изображения поста:', error);
        }
      }

      await this.postService.deletePost(postId);

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
    const data = await this.postService.getComments(postId)
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
    
    const data = await this.postService.createComment(payload)
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
      return await this.postService.getUserAvatar(userId)
    } catch (e) {
      return DEFAULT_AVATAR
    }
  }

  async hardDeleteComment(postId: ID, commentId: ID) {
    this.setCommentProcessing(commentId, true)
    try {
      await this.postService.deleteComment(commentId)
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
          this.postService.updatePost(post.id, { authorAvatarUrl: newAvatarUrl })
        )
      );

      const userComments: Comment[] = [];
      Object.values(this.commentsByPost).forEach(comments => {
        comments.filter(c => c.authorId === userId).forEach(c => userComments.push(c));
      });
      
      await Promise.allSettled(
        userComments.map(comment =>
          this.postService.updateComment(comment.id, { authorAvatarUrl: newAvatarUrl })
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
      await this.postService.updateUser(userId, payload);
      await this.updateAllUserAvatarsOnServer(userId, newAvatarUrl);
      await this.updateAvatarInPostsAndComments(userId, newAvatarUrl);
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