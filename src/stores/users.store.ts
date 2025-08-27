import { makeAutoObservable, runInAction } from 'mobx'
import http from '../api/http'
import type { ID, User, UserRole } from '../types'

export class UsersStore {
  list: User[] = []
  isLoading = false
  error: string | null = null

  private processing = new Set<ID>()

  constructor() {
    makeAutoObservable(this)
  }
  isProcessing(id: ID) {
    return this.processing.has(id)
  }
  private setProcessing(id: ID, on: boolean) {
    if (on) this.processing.add(id)
    else this.processing.delete(id)
  }

  async fetch() {
    this.isLoading = true
    this.error = null
    try {
      const { data } = await http.get<User[]>('/users')
      runInAction(() => (this.list = data))
    } catch (e: any) {
      runInAction(() => (this.error = e?.response?.data?.message || 'Не удалось получить пользователей'))
      throw e
    } finally {
      runInAction(() => (this.isLoading = false))
    }
  }

  async setBlocked(userId: ID, isBlocked: boolean) {
    this.setProcessing(userId, true)
    try {
      const { data } = await http.patch<User>(`/users/${userId}`, { isBlocked })
      runInAction(() => {
        this.list = this.list.map(u => (u.id === userId ? data : u))
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }

  async setRole(userId: ID, role: UserRole) {
    this.setProcessing(userId, true)
    try {
      const { data } = await http.patch<User>(`/users/${userId}`, { role })
      runInAction(() => {
        this.list = this.list.map(u => (u.id === userId ? data : u))
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }

  async softDelete(userId: ID) {
    this.setProcessing(userId, true)
    try {
      const payload = { isDeleted: true, deletedAt: new Date().toISOString() }
      const { data } = await http.patch<User>(`/users/${userId}`, payload)
      runInAction(() => {
        this.list = this.list.map(u => (u.id === userId ? data : u))
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }

  async restore(userId: ID) {
    this.setProcessing(userId, true)
    try {
      const payload = { isDeleted: false, deletedAt: null }
      const { data } = await http.patch<User>(`/users/${userId}`, payload as any)
      runInAction(() => {
        this.list = this.list.map(u => (u.id === userId ? data : u))
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }

  async hardDelete(userId: ID) {
    this.setProcessing(userId, true)
    try {
      await http.delete<void>(`/users/${userId}`)
      runInAction(() => {
        this.list = this.list.filter(u => u.id !== userId)
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }
}
