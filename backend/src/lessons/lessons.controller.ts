import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CompleteLessonDto } from './dto/complete-lesson.dto.js';
import { LessonsService } from './lessons.service.js';

@UseGuards(AuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.findAllForUser(user.sub);
  }

  @Post(':id/complete')
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') lessonId: string,
    @Body() input: CompleteLessonDto,
  ) {
    return this.lessonsService.complete(user.sub, lessonId, input);
  }
}
