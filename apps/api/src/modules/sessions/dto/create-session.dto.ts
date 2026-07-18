import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiPropertyOptional({ description: 'Display name for the player', default: 'Player' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Language code', default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string;
}
