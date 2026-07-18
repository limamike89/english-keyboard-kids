import api from '@/shared/services/api'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'
import type { TeacherClass, TeacherClassDetail, TeacherStudentProgress, ClassAnalytics, TeacherAssignment } from '../types/teacher.types'

function authHeaders() {
  const token = useParentAuthStore.getState().token
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function fetchClasses(): Promise<TeacherClass[]> {
  const res = await api.get<{ data: TeacherClass[] }>('/teacher/classes', authHeaders())
  return res.data.data
}

export async function createClass(name: string, description?: string): Promise<TeacherClass> {
  const res = await api.post<{ data: TeacherClass }>('/teacher/classes', { name, description }, authHeaders())
  return res.data.data
}

export async function fetchClassDetail(classId: string): Promise<TeacherClassDetail> {
  const res = await api.get<{ data: TeacherClassDetail }>(`/teacher/classes/${classId}`, authHeaders())
  return res.data.data
}

export async function fetchStudentProgress(classId: string, studentId: string): Promise<TeacherStudentProgress> {
  const res = await api.get<{ data: TeacherStudentProgress }>(`/teacher/classes/${classId}/students/${studentId}/progress`, authHeaders())
  return res.data.data
}

export async function fetchClassAnalytics(classId: string): Promise<ClassAnalytics> {
  const res = await api.get<{ data: ClassAnalytics }>(`/teacher/classes/${classId}/analytics`, authHeaders())
  return res.data.data
}

export async function fetchAssignments(classId?: string): Promise<TeacherAssignment[]> {
  const query = classId ? `?classId=${classId}` : ''
  const res = await api.get<{ data: TeacherAssignment[] }>(`/teacher/assignments${query}`, authHeaders())
  return res.data.data
}

export async function createAssignment(data: { classId?: string; lessonId: string; title: string; dueDate?: string }): Promise<TeacherAssignment> {
  const res = await api.post<{ data: TeacherAssignment }>('/teacher/assignments', data, authHeaders())
  return res.data.data
}
