import { Injectable, Logger } from '@nestjs/common';
import { getEnvValue } from '../../config/env.config';
import { AudioResponse } from './interfaces/audio.interface';

const AUDIO_FORMAT_MAP: Record<string, string> = {
  mp3: 'mp3',
  wav: 'wav',
  ogg: 'ogg',
};

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  resolve(key: string): AudioResponse {
    const storage = getEnvValue('AUDIO_STORAGE');

    if (storage === 's3') {
      return this.resolveS3(key);
    }

    return this.resolveLocal(key);
  }

  private resolveLocal(key: string): AudioResponse {
    const parts = key.includes('_') ? key.split('_') : key.split('-');
    if (parts.length !== 3) {
      return {
        key,
        url: '',
        format: 'mp3',
        durationMs: null,
        expiresAt: null,
      };
    }

    const [first, second, third] = parts;
    const isSeedKey = first.length === 2;
    const lang = isSeedKey ? first : third;
    const type = isSeedKey ? second : first;
    const identifier = isSeedKey ? third : second;

    const supportedFormats = ['mp3', 'ogg', 'wav'];
    let format = 'mp3';
    let url = '';

    for (const ext of supportedFormats) {
      const audioPath = `/${lang}/${type}/${identifier}.${ext}`;
      const fullPath = `${getEnvValue('AUDIO_PATH')}${audioPath}`;

      try {
        const fs = require('fs');
        if (fs.existsSync(fullPath)) {
          url = `/audio${audioPath}`;
          format = ext;
          break;
        }
      } catch {
        url = `/audio/${lang}/${type}/${identifier}.mp3`;
        break;
      }
    }

    if (!url) {
      url = `/audio/${lang}/${type}/${identifier}.mp3`;
    }

    return {
      key,
      url,
      format: AUDIO_FORMAT_MAP[format] ?? 'mp3',
      durationMs: null,
      expiresAt: null,
    };
  }

  private resolveS3(key: string): AudioResponse {
    this.logger.warn(`S3 audio resolution not implemented yet for key: ${key}`);
    return {
      key,
      url: '',
      format: 'mp3',
      durationMs: null,
      expiresAt: null,
    };
  }
}
