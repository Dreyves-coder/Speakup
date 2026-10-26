import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LessonsController } from './lessons.controller.js';
import { LessonsService } from './lessons.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LessonsController],
  exports: [LessonsService],
  providers: [LessonsService],
})
export class LessonsModule {}
