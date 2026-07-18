import cmsApi from './cms-api'

export async function getAuditLog(params?: Record<string, string | undefined>) {
  const { data } = await cmsApi.get('/audit', { params })
  return data.data
}
