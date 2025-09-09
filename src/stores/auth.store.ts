import { makeAutoObservable, runInAction } from 'mobx'
import { AuthService } from '../services/auth.service'
import { UploadService } from '../services/upload.service'
import type { RootStore } from './root.store'
import type { User, CredentialsDTO, RegisterDTO } from '../types'

export class AuthStore {
  user: User | null = null
  token: string | null = null
  isLoading = false
  initializing = true
  error: string | null = null

  private authService: AuthService
  private uploadService: UploadService

  constructor(private rootStore: RootStore) {
    this.authService = new AuthService()
    this.uploadService = new UploadService()
    makeAutoObservable(this)
    this.hydrate()
  }

  get isAuthenticated() { return !!this.token && !!this.user }
  
  get isAdmin(): boolean {
    return this.user?.role === 'admin'
  }

  get canModerate(): boolean {
    const role = this.user?.role
    return role === 'admin' || role === 'moderator'
  }

  hydrate() {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')

    this.token = token ?? null

    if (raw && raw !== 'undefined' && raw !== 'null') {
      try { this.user = JSON.parse(raw) }
      catch { localStorage.removeItem('user'); this.user = null }
    } else {
      if (raw) localStorage.removeItem('user')
      this.user = null
    }

    this.initializing = false
    if (this.token && !this.user) {
      this.fetchMe().catch(() => {})
    }
  }

  async login(dto: CredentialsDTO) {
    this.isLoading = true
    this.error = null
    try {
      const { token, user } = await this.authService.login(dto)
      
      runInAction(() => {
        this.token = token
        localStorage.setItem('token', token)
      })
      
      let userData: User | null = user || null 
      if (!userData) {
        const fetchedUser = await this.authService.fetchMe()
        userData = fetchedUser || null 
      }
      
      if (userData?.isBlocked) {
        this.logout()
        throw new Error('Пользователь заблокирован')
      }

      runInAction(() => {
        this.user = userData 
        if (userData) localStorage.setItem('user', JSON.stringify(userData))
        else localStorage.removeItem('user')
      })
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.response?.data?.message || e?.message || 'Ошибка входа'
      })
      throw e
    } finally {
      runInAction(() => (this.isLoading = false))
    }
  }
  async fetchMe(): Promise<User | null> {
    try {
      const user = await this.authService.fetchMe()
      runInAction(() => {
        this.user = user || null 
        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
      })
      return user || null
    } catch (e: any) {
      if (e.message === 'Unauthorized') {
        this.logout()
      }
      return null
    }
  }

  async register(dto: RegisterDTO) {
    this.isLoading = true
    this.error = null
    try {
      const { token, user } = await this.authService.register(dto)
      runInAction(() => {
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      })
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.response?.data?.message || 'Ошибка регистрации'
      })
      throw e
    } finally {
      runInAction(() => (this.isLoading = false))
    }
  }

  async updateMe(update: Partial<Pick<User, 'name' | 'avatarUrl' | 'avatarName'>>) {
    if (!this.user) throw new Error('Нет пользователя')
    
    const updatedUser = await this.authService.updateUser(this.user.id, update)
    runInAction(() => {
      this.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
    })
    return updatedUser
  }

  async uploadAvatar(file: File): Promise<{ url: string; name: string }> {
    return this.uploadService.uploadFile(file)
  }

  async changeAvatar(file: File): Promise<{ url: string; name: string }> {
    const { url, name } = await this.uploadService.uploadFile(file)
    await this.updateMe({ avatarUrl: url, avatarName: name })
    return { url, name }
  }
  
  async removeAvatar() {
    if (!this.user?.avatarUrl) return

    try {
      await this.uploadService.deleteFile(this.user.avatarUrl)
    } catch (error) {
      console.error('Ошибка при удалении аватара:', error)
    }

    await this.updateMe({ avatarUrl: '', avatarName: '' })
  }

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}