import http from '../api/http'
import type { CredentialsDTO, RegisterDTO, User, UserUpdateDTO } from '../types'

export class AuthService {
  private authUrl = process.env.REACT_APP_AUTH_URL || '/auth'
  private authMeUrl = process.env.REACT_APP_AUTH_ME_URL || '/auth_me'
  private registerUrl = process.env.REACT_APP_REGISTER_URL || '/register'
  private usersUrl = process.env.REACT_APP_USERS_URL || '/users'

  async login(dto: CredentialsDTO): Promise<{ token: string; user?: User }> {
    const { data } = await http.post<any>(this.authUrl, dto)
    const token: string = data?.token ?? data?.accessToken ?? data?.jwt
    if (!token) throw new Error('Сервер не вернул токен')
    
    return {
      token,
      user: data?.user ?? data?.profile
    }
  }

  async register(dto: RegisterDTO): Promise<{ token: string; user: User }> {
    const { data } = await http.post<{ token: string; user: User }>(this.registerUrl, dto)
    return data
  }

  async fetchMe(): Promise<User | undefined> {
    try {
      const { data } = await http.get<any>(this.authMeUrl)
      const user: User = data?.user ?? data
      return (user && user.id != null) ? user : undefined
    } catch (e: any) {
      const code = e?.response?.status
      if (code === 401) {
        throw new Error('Unauthorized')
      }
      throw e
    }
  }

  async updateUser(id: number, update: UserUpdateDTO): Promise<User> {
    const { data } = await http.patch<User>(`${this.usersUrl}/${id}`, update)
    return data
  }
}