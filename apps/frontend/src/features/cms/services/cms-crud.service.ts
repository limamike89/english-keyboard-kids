import cmsApi from './cms-api'
import type { CmsPaginatedResponse, ImportResult } from '../types/cms.types'

function crudService<T>(basePath: string) {
  return {
    async findAll(params?: Record<string, string | number | undefined>): Promise<CmsPaginatedResponse<T>> {
      const { data } = await cmsApi.get(basePath, { params })
      return data.data
    },
    async findOne(id: string): Promise<T> {
      const { data } = await cmsApi.get(`${basePath}/${id}`)
      return data.data
    },
    async create(body: Partial<T>): Promise<T> {
      const { data } = await cmsApi.post(basePath, body)
      return data.data
    },
    async update(id: string, body: Partial<T>): Promise<T> {
      const { data } = await cmsApi.put(`${basePath}/${id}`, body)
      return data.data
    },
    async remove(id: string): Promise<void> {
      await cmsApi.delete(`${basePath}/${id}`)
    },
    async toggleStatus(id: string, isActive: boolean): Promise<T> {
      const { data } = await cmsApi.put(`${basePath}/${id}/status`, { isActive })
      return data.data
    },
    async importJson(entity: string, jsonData: Array<Record<string, unknown>>): Promise<ImportResult> {
      const { data } = await cmsApi.post('/import/json', { entity, data: jsonData })
      return data.data
    },
    async exportWords(params?: Record<string, string | undefined>): Promise<T[]> {
      const { data } = await cmsApi.get('/export/words', { params })
      return data.data
    },
    async exportCategories(params?: Record<string, string | undefined>): Promise<T[]> {
      const { data } = await cmsApi.get('/export/categories', { params })
      return data.data
    },
  }
}

export const lettersService = crudService<any>('/letters')
export const numbersService = crudService<any>('/numbers')
export const wordsService = crudService<any>('/words')
export const categoriesService = crudService<any>('/categories')
export const languagesService = crudService<any>('/languages')
export const levelsService = crudService<any>('/levels')
export const achievementsService = crudService<any>('/achievements')
export const configService = crudService<any>('/config')
