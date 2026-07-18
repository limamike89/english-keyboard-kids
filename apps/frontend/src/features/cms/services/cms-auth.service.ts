import cmsApi from './cms-api'
import type { CmsAuthResponse, CmsUser } from '../types/cms.types'

export async function cmsLogin(email: string, password: string): Promise<CmsAuthResponse> {
  const { data } = await cmsApi.post('/auth/login', { email, password })
  return data.data
}

export async function cmsRegister(body: { email: string; password: string; displayName: string; role: string }): Promise<CmsAuthResponse> {
  const { data } = await cmsApi.post('/auth/register', body)
  return data.data
}

export async function cmsGetProfile(): Promise<CmsUser> {
  const { data } = await cmsApi.get('/auth/me')
  return data.data
}
