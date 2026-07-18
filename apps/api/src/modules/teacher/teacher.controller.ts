import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TeacherService } from './teacher.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'

@ApiTags('Teacher Portal')
@ApiBearerAuth()
@Public()
@UseGuards(JwtAuthGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('classes')
  @ApiOperation({ summary: 'Get all classes for the teacher' })
  async getClasses(@CurrentUser() user: CurrentUserType) {
    return this.teacherService.getClasses(user.id)
  }

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new class' })
  async createClass(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { name: string; description?: string },
  ) {
    return this.teacherService.createClass(user.id, body)
  }

  @Put('classes/:classId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a class' })
  async updateClass(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
  ) {
    return this.teacherService.updateClass(user.id, classId, body)
  }

  @Get('classes/:classId')
  @ApiOperation({ summary: 'Get class detail with students and assignments' })
  async getClassDetail(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
  ) {
    return this.teacherService.getClassDetail(user.id, classId)
  }

  @Post('classes/:classId/students')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a student to class via join code' })
  async joinClass(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
    @Body() body: { code: string },
  ) {
    return this.teacherService.joinClass(body.code, user.id)
  }

  @Delete('classes/:classId/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a student from class' })
  async removeStudent(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.teacherService.removeStudent(user.id, classId, studentId)
  }

  @Get('classes/:classId/students/:studentId/progress')
  @ApiOperation({ summary: 'Get progress for a specific student' })
  async getStudentProgress(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.teacherService.getStudentProgress(user.id, classId, studentId)
  }

  @Get('classes/:classId/analytics')
  @ApiOperation({ summary: 'Get class-wide analytics' })
  async getClassAnalytics(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId: string,
  ) {
    return this.teacherService.getClassAnalytics(user.id, classId)
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get all assignments' })
  async getAssignments(
    @CurrentUser() user: CurrentUserType,
    @Param('classId') classId?: string,
  ) {
    return this.teacherService.getAssignments(user.id, classId)
  }

  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an assignment' })
  async createAssignment(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { classId?: string; lessonId: string; title: string; dueDate?: string },
  ) {
    return this.teacherService.createAssignment(user.id, body)
  }

  @Delete('assignments/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assignment' })
  async deleteAssignment(
    @CurrentUser() user: CurrentUserType,
    @Param('assignmentId') assignmentId: string,
  ) {
    await this.teacherService.deleteAssignment(user.id, assignmentId)
  }
}
