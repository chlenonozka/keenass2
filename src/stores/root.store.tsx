import React, { createContext, useContext } from 'react'
import { makeAutoObservable, reaction } from 'mobx'
import { AuthStore } from './auth.store'
import { UsersStore } from './users.store'
import { PostsStore } from './posts.store'

export class RootStore {
  auth: AuthStore
  users: UsersStore
  posts: PostsStore

  constructor() {
    this.auth = new AuthStore(this)
    this.users = new UsersStore()
    this.posts = new PostsStore(this.auth)
    
    this.setupReactions()
    makeAutoObservable(this)
  }

  private setupReactions() {
    reaction(
      () => this.auth.user?.avatarUrl,
      (newAvatarUrl, oldAvatarUrl) => {
        if (newAvatarUrl && newAvatarUrl !== oldAvatarUrl && this.auth.user) {
          this.posts.refreshAvatarInCache(this.auth.user.id, newAvatarUrl)
        }
      }
    )
    reaction(
      () => this.auth.isAuthenticated,
      (isAuthenticated) => {
        if (!isAuthenticated) {
          this.posts.posts = []
          this.users.list = []
        }
      }
    )
  }
}

const RootStoreContext = createContext<RootStore | null>(null)

export const RootStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [rootStore] = React.useState(() => new RootStore())
  
  return (
    <RootStoreContext.Provider value={rootStore}>
      {children}
    </RootStoreContext.Provider>
  )
}

export const useRootStore = () => {
  const ctx = useContext(RootStoreContext)
  if (!ctx) throw new Error('RootStoreProvider is missing')
  return ctx
}

export const useAuthStore = () => useRootStore().auth
export const useUsersStore = () => useRootStore().users
export const usePostsStore = () => useRootStore().posts