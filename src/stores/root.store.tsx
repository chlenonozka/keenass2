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
    reaction(
      () => this.auth.user?.avatarUrl,
      (newAvatarUrl, oldAvatarUrl) => {
        if (newAvatarUrl && newAvatarUrl !== oldAvatarUrl && this.auth.user) {
          this.posts.refreshAvatarInCache(this.auth.user.id, newAvatarUrl)
        }
      }
    )

    makeAutoObservable(this)
  }
}

const RootStoreContext = createContext<RootStore | null>(null)
const root = new RootStore()

export const RootStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => (
  <RootStoreContext.Provider value={root}>{children}</RootStoreContext.Provider>
)

export const useRootStore = () => {
  const ctx = useContext(RootStoreContext)
  if (!ctx) throw new Error('RootStoreProvider is missing')
  return ctx
}