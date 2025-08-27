export type ID = number
export type UserRole = 'user' | 'admin' | 'moderator'

export interface User {
  id: ID
  email: string
  name: string
  role: UserRole
  isBlocked: boolean
  createdAt?: string
  avatarUrl?: string    
  avatarName?: string   
  isDeleted?: boolean
  deletedAt?: string
}

export type CredentialsDTO = Pick<User, 'email'> & { password: string }

export type RegisterDTO =
  CredentialsDTO & Pick<User, 'name'> & {
    role?: Extract<UserRole, 'user'>
    isBlocked?: false
    createdAt?: string
  }

  export interface Post {
    id: ID
    authorId: ID
    authorName: string
    authorAvatarUrl?: string  
    description: string
    imageUrl?: string
    imageName?: string
    createdAt: string
    commentsCount?: number
  }

  export interface Comment {
    userId: number | undefined
    id: ID
    post_id: ID
    authorId: ID
    authorName: string
    authorAvatarUrl?: string  
    text: string
    createdAt: string
  }

export type CreatePostDTO = Pick<Post, 'description' | 'imageUrl' | 'imageName'>
export type CreateCommentDTO = Pick<Comment, 'post_id' | 'text'>

export type PublicUserDTO = Omit<User, 'createdAt'>
export type UserUpdateDTO = Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
