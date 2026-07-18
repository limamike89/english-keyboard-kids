import cmsApi from './cms-api'
import type { CmsMedia, CmsPaginatedResponse } from '../types/cms.types'

export async function getMediaList(params?: Record<string, string | number | undefined>): Promise<CmsPaginatedResponse<CmsMedia>> {
  const { data } = await cmsApi.get('/media', { params })
  return data.data
}

export async function getMedia(id: string): Promise<CmsMedia> {
  const { data } = await cmsApi.get(`/media/${id}`)
  return data.data
}

export async function uploadMedia(file: File, altText?: string, language?: string): Promise<CmsMedia> {
  const formData = new FormData()
  formData.append('file', file)
  if (altText) formData.append('altText', altText)
  if (language) formData.append('language', language)
  const { data } = await cmsApi.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function updateMedia(id: string, body: { altText?: string; language?: string }): Promise<CmsMedia> {
  const { data } = await cmsApi.put(`/media/${id}`, body)
  return data.data
}

export async function replaceMediaFile(id: string, file: File): Promise<CmsMedia> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await cmsApi.post(`/media/${id}/replace`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deleteMedia(id: string): Promise<void> {
  await cmsApi.delete(`/media/${id}`)
}
