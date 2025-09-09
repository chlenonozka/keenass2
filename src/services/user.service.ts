import http from '../api/http'
import type { ID, User, UserRole } from '../types'

export class UserService {
  private usersUrl = process.env.REACT_APP_USERS_URL || '/users'

  async getUsers(): Promise<User[]> {
    const { data } = await http.get<User[]>(this.usersUrl)
    return data
  }

  async updateUser(userId: ID, update: Partial<User>): Promise<User> {
    const { data } = await http.patch<User>(`${this.usersUrl}/${userId}`, update)
    return data
  }

  async deleteUser(userId: ID): Promise<void> {
    await http.delete(`${this.usersUrl}/${userId}`)
  }

  async setBlocked(userId: ID, isBlocked: boolean): Promise<User> {
    return this.updateUser(userId, { isBlocked })
  }

  async setRole(userId: ID, role: UserRole): Promise<User> {
    return this.updateUser(userId, { role })
  }

  async softDelete(userId: ID): Promise<User> {
    const payload = { 
      isDeleted: true, 
      deletedAt: new Date().toISOString() 
    }
    return this.updateUser(userId, payload)
  }

  async restore(userId: ID): Promise<User> {
    const payload = { 
      isDeleted: false, 
      deletedAt: null 
    }
    return this.updateUser(userId, payload as any)
  }
}