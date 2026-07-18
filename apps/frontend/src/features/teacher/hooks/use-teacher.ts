import { useQuery } from '@tanstack/react-query'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'
import { fetchClasses, fetchClassDetail, fetchStudentProgress, fetchClassAnalytics, fetchAssignments } from '../services/teacher.service'

export function useTeacherClasses() {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['teacher', 'classes'],
    queryFn: fetchClasses,
    enabled: isAuthenticated,
  })
}

export function useClassDetail(classId: string) {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['teacher', 'classes', classId],
    queryFn: () => fetchClassDetail(classId),
    enabled: isAuthenticated && !!classId,
  })
}

export function useStudentProgress(classId: string, studentId: string) {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['teacher', 'classes', classId, 'students', studentId, 'progress'],
    queryFn: () => fetchStudentProgress(classId, studentId),
    enabled: isAuthenticated && !!classId && !!studentId,
  })
}

export function useClassAnalytics(classId: string) {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['teacher', 'classes', classId, 'analytics'],
    queryFn: () => fetchClassAnalytics(classId),
    enabled: isAuthenticated && !!classId,
  })
}

export function useAssignments(classId?: string) {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['teacher', 'assignments', classId],
    queryFn: () => fetchAssignments(classId),
    enabled: isAuthenticated,
  })
}
