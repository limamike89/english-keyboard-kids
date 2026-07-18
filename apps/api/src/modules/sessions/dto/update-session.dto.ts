import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: 'New display name' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ description: 'New language code' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string;
}
