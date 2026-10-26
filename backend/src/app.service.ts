import { Injectable } from '@nestjs/common';

export type HealthStatus = {
  application: 'SpeakUp API';
  status: 'ok';
  timestamp: string;
  version: string;
};

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      application: 'SpeakUp API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}
