import { makeAutoObservable, runInAction } from 'mobx'
import { UserService } from '../services/user.service'
import type { ID, User, UserRole } from '../types'

export class UsersStore {
  list: User[] = []
  isLoading = false
  error: string | null = null

  private processing = new Set<ID>()
  private userService: UserService

  constructor() {
    makeAutoObservable(this)
    this.userService = new UserService()
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
      const data = await this.userService.getUsers()
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
      const data = await this.userService.setBlocked(userId, isBlocked)
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
      const data = await this.userService.setRole(userId, role)
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
      const data = await this.userService.softDelete(userId)
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
      const data = await this.userService.restore(userId)
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
      await this.userService.deleteUser(userId)
      runInAction(() => {
        this.list = this.list.filter(u => u.id !== userId)
      })
    } finally {
      this.setProcessing(userId, false)
    }
  }
}