import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AudioService } from './audio.service';
import { AudioResponse } from './interfaces/audio.interface';

@ApiTags('Audio')
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get(':key')
  @Public()
  @ApiOperation({ summary: 'Resolve audio file URL by key' })
  @ApiParam({ name: 'key', description: 'Audio key (e.g. en-letter-a, en-number-1)' })
  @ApiResponse({ status: 200, description: 'Audio URL resolved' })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  resolve(@Param('key') key: string): AudioResponse {
    return this.audioService.resolve(key);
  }
}
