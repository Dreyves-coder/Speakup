import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('SpeakUp API (e2e)', () => {
  let accessToken: string;
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `auth-e2e-${Date.now()}@speakup.local`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    const registration = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        dailyGoal: 15,
        dailyReminder: true,
        displayName: 'SpeakUp Tester',
        email: testEmail,
        englishLevel: 'b1',
        hapticFeedback: false,
        password: 'StrongPass123!',
        soundEffects: true,
      })
      .expect(201);

    accessToken = registration.body.accessToken as string;
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          application: 'SpeakUp API',
          status: 'ok',
          timestamp: expect.any(String),
          version: '0.1.0',
        });
      });
  });

  it('/api/profile (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          dailyGoal: 15,
          dailyReminder: true,
          displayName: 'SpeakUp Tester',
          englishLevel: 'b1',
          hapticFeedback: false,
          soundEffects: true,
        });
      });
  });

  it('/api/profile (PUT)', () => {
    const profile = {
      dailyGoal: 10,
      dailyReminder: true,
      displayName: 'SpeakUp Tester',
      englishLevel: 'a2',
      hapticFeedback: false,
      soundEffects: true,
    };

    return request(app.getHttpServer())
      .put('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(profile)
      .expect(200)
      .expect(profile);
  });

  it('/api/profile rejects anonymous requests (GET)', () => {
    return request(app.getHttpServer()).get('/api/profile').expect(401);
  });

  it('/api/profile rejects invalid preferences (PUT)', () => {
    return request(app.getHttpServer())
      .put('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dailyGoal: 999 })
      .expect(400);
  });

  it('/api/auth/login returns a session (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'StrongPass123!' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.accessToken).toEqual(expect.any(String));
        expect(body.user.email).toBe(testEmail);
        expect(body.user.passwordHash).toBeUndefined();
      });
  });

  it('/api/lessons returns the learning catalog (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/lessons')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(5);
        expect(body[1]).toMatchObject({
          category: 'GRAMMAR',
          id: 'everyday-questions',
          progress: 0,
          status: 'available',
        });
      });
  });

  it('/api/lessons/:id/complete records a result (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/lessons/everyday-questions/complete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ correctAnswers: 3, durationMinutes: 4, totalQuestions: 4 })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          attempts: 1,
          lessonId: 'everyday-questions',
          score: 75,
        });
      });
  });

  it('/api/progress returns the recorded result (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/progress')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          accuracy: 75,
          learningMinutes: 4,
          lessonsCompleted: 1,
        });
        expect(body.recentActivity[0]).toMatchObject({
          correctAnswers: 3,
          lessonId: 'everyday-questions',
          totalQuestions: 4,
        });
      });
  });

  it('/api/auth/me deletes the account (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });
});
