import { IsString, IsBoolean, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ToggleStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean
}

export class BulkActionDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  ids!: string[]

  @ApiProperty()
  @IsString()
  action!: string
}
