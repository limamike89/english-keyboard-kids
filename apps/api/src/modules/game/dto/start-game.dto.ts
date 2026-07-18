import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class StartGameDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  lessonId!: string;

  @ApiProperty({ description: 'Game mode', required: false })
  @IsString()
  @IsOptional()
  mode?: string;
}
