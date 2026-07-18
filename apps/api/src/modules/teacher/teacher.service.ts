import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async getClasses(teacherId: string) {
    return this.prisma.teacherClass.findMany({
      where: { teacherId, isActive: true },
      include: { _count: { select: { students: true, assignments: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createClass(teacherId: string, data: { name: string; description?: string }) {
    const code = `CLS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
    return this.prisma.teacherClass.create({
      data: { teacherId, name: data.name, description: data.description, code },
    })
  }

  async updateClass(teacherId: string, classId: string, data: { name?: string; description?: string; isActive?: boolean }) {
    await this.verifyOwnership(teacherId, classId)
    return this.prisma.teacherClass.update({
      where: { id: classId },
      data,
    })
  }

  async getClassDetail(teacherId: string, classId: string) {
    await this.verifyOwnership(teacherId, classId)
    return this.prisma.teacherClass.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            student: { select: { id: true, displayName: true, username: true, xp: true, coins: true } },
          },
        },
        assignments: { where: { isActive: true }, include: { lesson: { select: { title: true, mode: true } } } },
        _count: { select: { students: true } },
      },
    })
  }

  async joinClass(classCode: string, studentId: string) {
    const cls = await this.prisma.teacherClass.findUnique({ where: { code: classCode } })
    if (!cls || !cls.isActive) throw new NotFoundException('Class not found')

    const existing = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: cls.id, studentId } },
    })
    if (existing) throw new ConflictException('Already enrolled')

    return this.prisma.classStudent.create({
      data: { classId: cls.id, studentId },
      include: { class: true },
    })
  }

  async removeStudent(teacherId: string, classId: string, studentId: string) {
    await this.verifyOwnership(teacherId, classId)
    await this.prisma.classStudent.delete({
      where: { classId_studentId: { classId, studentId } },
    })
  }

  async getStudentProgress(teacherId: string, classId: string, studentId: string) {
    await this.verifyOwnership(teacherId, classId)
    await this.verifyStudentInClass(classId, studentId)

    const [stats, progress, metric] = await Promise.all([
      this.prisma.userStats.findMany({ where: { userId: studentId } }),
      this.prisma.userProgress.findMany({
        where: { userId: studentId },
        include: { lesson: { select: { title: true, mode: true } } },
        orderBy: { lastPlayedAt: 'desc' },
      }),
      this.prisma.studentMetric.findUnique({ where: { userId: studentId } }),
    ])

    const totalCorrect = stats.reduce((s, st) => s + st.totalCorrect, 0)
    const totalIncorrect = stats.reduce((s, st) => s + st.totalIncorrect, 0)
    const total = totalCorrect + totalIncorrect

    return {
      studentId,
      stats: {
        totalGames: stats.reduce((s, st) => s + st.gamesPlayed, 0),
        totalCorrect,
        totalIncorrect,
        totalQuestions: total,
        accuracy: total > 0 ? totalCorrect / total : 0,
      },
      metric,
      progress,
    }
  }

  async getClassAnalytics(teacherId: string, classId: string) {
    await this.verifyOwnership(teacherId, classId)

    const cls = await this.prisma.teacherClass.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                displayName: true,
                xp: true,
                coins: true,
                studentMetric: true,
              },
            },
          },
        },
      },
    })

    const students = cls?.students ?? []
    const totalStudents = students.length
    const studentsWithMetric = students.filter((s) => s.student.studentMetric)

    const avgAccuracy = studentsWithMetric.length > 0
      ? studentsWithMetric.reduce((sum, s) => sum + (s.student.studentMetric?.accuracy ?? 0), 0) / studentsWithMetric.length
      : 0

    const totalGames = studentsWithMetric.reduce((sum, s) => sum + (s.student.studentMetric?.totalGames ?? 0), 0)

    return {
      totalStudents,
      avgAccuracy,
      totalGames,
      students: students.map((s) => ({
        id: s.student.id,
        displayName: s.student.displayName,
        xp: s.student.xp,
        coins: s.student.coins,
        accuracy: s.student.studentMetric?.accuracy ?? 0,
      })),
    }
  }

  async getAssignments(teacherId: string, classId?: string) {
    const where: Record<string, unknown> = { teacherId, isActive: true }
    if (classId) where.classId = classId

    return this.prisma.assignment.findMany({
      where,
      include: {
        class: { select: { name: true } },
        lesson: { select: { title: true, mode: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createAssignment(teacherId: string, data: { classId?: string; lessonId: string; title: string; dueDate?: string }) {
    return this.prisma.assignment.create({
      data: {
        teacherId,
        classId: data.classId,
        lessonId: data.lessonId,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        class: { select: { name: true } },
        lesson: { select: { title: true, mode: true } },
      },
    })
  }

  async deleteAssignment(teacherId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } })
    if (!assignment || assignment.teacherId !== teacherId) {
      throw new NotFoundException('Assignment not found')
    }
    await this.prisma.assignment.update({ where: { id: assignmentId }, data: { isActive: false } })
  }

  private async verifyOwnership(teacherId: string, classId: string): Promise<void> {
    const cls = await this.prisma.teacherClass.findUnique({ where: { id: classId } })
    if (!cls || cls.teacherId !== teacherId) {
      throw new NotFoundException('Class not found')
    }
  }

  private async verifyStudentInClass(classId: string, studentId: string): Promise<void> {
    const enrollment = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
    })
    if (!enrollment) throw new NotFoundException('Student not in class')
  }
}
