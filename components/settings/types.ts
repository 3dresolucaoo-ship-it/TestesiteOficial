import type { AdminConfig } from '@/lib/types'

export interface SettingsTabProps {
  draft: AdminConfig
  setDraft: React.Dispatch<React.SetStateAction<AdminConfig>>
}

export type RemoteConfig = {
  id: string
  provider: 'mercadopago' | 'stripe' | 'infinitypay'
  accessToken: string
  publicKey?: string
  mpUserId?: string
  hasRefreshToken: boolean
  tokenExpiresAt?: string
  sandbox: boolean
  isActive: boolean
}
