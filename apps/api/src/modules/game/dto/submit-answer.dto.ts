import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Game session ID' })
  @IsUUID()
  gameSessionId!: string;

  @ApiProperty({ description: 'Question ID' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ description: 'Answer provided by the user' })
  @IsString()
  answer!: string;
}
