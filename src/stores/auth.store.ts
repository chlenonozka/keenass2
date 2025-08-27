import { makeAutoObservable, runInAction } from 'mobx'
import http from '../api/http'
import type { CredentialsDTO, RegisterDTO, User } from '../types'
import type { RootStore } from './root.store'

export class AuthStore {
  user: User | null = null
  token: string | null = null
  isLoading = false
  initializing = true
  error: string | null = null

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this)
    this.hydrate()
  }

  get isAuthenticated() { return !!this.token && !!this.user }
  get isAdmin() {
    const r = this.user?.role
    return typeof r === 'string' && r.toLowerCase().trim() === 'admin'
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
      this.fetchMe().then(u => {
        if (u) {
          runInAction(() => {
            this.user = u
            localStorage.setItem('user', JSON.stringify(u))
          })
        }
      }).catch(() => {})
    }
  }

  async login(dto: CredentialsDTO) {
    this.isLoading = true
    this.error = null
    try {
      const { data } = await http.post<any>('/auth', dto)
      const token: string | undefined = data?.token ?? data?.accessToken ?? data?.jwt
      if (!token) throw new Error('Сервер не вернул токен')

      runInAction(() => {
        this.token = token
        localStorage.setItem('token', token)
      })
      
      let user: User | null | undefined = data?.user ?? data?.profile ?? null
      if (!user) {
        user = await this.fetchMe()
      }
      if (user?.isBlocked) {
        this.logout()
        throw new Error('Пользователь заблокирован')
      }

      runInAction(() => {
        this.user = user ?? null
        if (user) localStorage.setItem('user', JSON.stringify(user))
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
      const { data } = await http.get<any>('/auth_me')
      const user: User = data?.user ?? data
      return (user && user.id != null) ? user : null
    } catch (e: any) {
      const code = e?.response?.status
      if (code === 401) {
        this.logout()
      }
      return null
    }
  }

  async register(dto: RegisterDTO) {
    this.isLoading = true
    this.error = null
    try {
      const { data } = await http.post<{ token: string; user: User }>('/register', dto)
      runInAction(() => {
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
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
    const id = this.user.id
    const payload = { ...update }
    const { data } = await http.patch<User>(`/users/${id}`, payload)
    runInAction(() => {
      this.user = data  
      localStorage.setItem('user', JSON.stringify(data))  
    })
    return data
  }

  async uploadAvatar(file: File): Promise<{ url: string; name: string }> {
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

  async changeAvatar(file: File): Promise<{ url: string; name: string }> {
    const { url, name } = await this.uploadAvatar(file) 
    await this.updateMe({ avatarUrl: url, avatarName: name })  
    return { url, name }
  }
  
  async removeAvatar() {
    if (!this.user) return;

    const avatarUrl = this.user.avatarUrl;

    if (!avatarUrl) {
      console.error('Не найден аватар для удаления');
      return;
    }

    console.log('URL аватара пользователя:', avatarUrl);

    try {
      console.log('Отправляем запрос на сервер с параметром:', { url: avatarUrl });

      const { data } = await http.get<any[]>('/uploads', {
        params: { url: avatarUrl } 
      });

      console.log('Ответ от сервера:', data);

      const imageId = data.length > 0 ? data[0].id : undefined;

      console.log('URL, полученный от загрузок:', avatarUrl);
      console.log('ID изображения из загрузок:', imageId);

      if (imageId) {
        await http.delete(`/uploads/${imageId}`);
        console.log('Аватар успешно удален');
      } else {
        console.error('Не удалось найти ID изображения');
      }
    } catch (error) {
      console.error('Ошибка при удалении аватара:', error);
    }

    await this.updateMe({ avatarUrl: '', avatarName: '' });
  }

  get canModerate() {
    const r = this.user?.role
    const role = typeof r === 'string' ? r.toLowerCase().trim() : ''
    return role === 'admin' || role === 'moderator'
  }

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}