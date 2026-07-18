export interface CmsUser {
  id: string
  email: string
  displayName: string
  roles: string[]
  avatarUrl?: string
}

export interface CmsAuthResponse {
  token: string
  user: CmsUser
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CmsPaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface CmsWord {
  id: string
  letter: string
  word: string
  language: string
  difficulty: string
  description?: string
  imageUrl?: string
  audioUrl?: string
  categoryId?: string
  category?: { name: string; slug: string }
  tags: string[]
  level: number
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CmsCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  language: string
  isActive: boolean
  order: number
  createdAt: string
}

export interface CmsLanguage {
  id: string
  code: string
  name: string
  nativeName?: string
  flag?: string
  direction: string
  isActive: boolean
  isDefault: boolean
  order: number
}

export interface CmsLevel {
  id: string
  mode: string
  language: string
  title: string
  description?: string
  level: number
  order: number
  questionCount: number
  isActive: boolean
  questions?: CmsQuestion[]
}

export interface CmsQuestion {
  id: string
  type: string
  audioKey: string
  correctAnswer: string
  displayText?: string
  order: number
  difficulty: string
  isActive: boolean
}

export interface CmsAchievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  iconUrl?: string
  category: string
  group?: string
  criteria: Record<string, unknown>
  rules?: Record<string, unknown>
  xpReward: number
  coinsReward: number
  maxProgress: number
  isActive: boolean
  createdAt: string
}

export interface CmsMedia {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: string
  altText?: string
  language?: string
  isActive: boolean
  createdAt: string
  versions: CmsMediaVersion[]
}

export interface CmsMediaVersion {
  id: string
  version: number
  filename: string
  size: number
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface CmsSetting {
  id: string
  key: string
  value: unknown
  description?: string
  category: string
  isPublic: boolean
  updatedAt: string
}

export interface AuditEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  fieldName?: string
  oldValue?: unknown
  newValue?: unknown
  userId?: string
  reason?: string
  createdAt: string
  user?: { id: string; displayName: string; email: string }
}

export interface ImportResult {
  created: number
  updated: number
  errors: number
  errorDetails: string[]
}
