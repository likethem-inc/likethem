import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: 'ADMIN' | 'BUYER' | 'CURATOR'
    name?: string
    image?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }

  interface Session {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: 'ADMIN' | 'BUYER' | 'CURATOR' // CRITICAL: role should always be present
      phone?: string | null
      curatorProfileId?: string | null
      storeName?: string | null
      isPublic?: boolean | null
      isEditorsPick?: boolean | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'ADMIN' | 'BUYER' | 'CURATOR' // CRITICAL: role should always be present
    id?: string
    name?: string
    picture?: string
    phone?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }
} 