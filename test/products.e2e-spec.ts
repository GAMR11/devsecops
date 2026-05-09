import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let createdProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test Product', price: 100, category: 'Test' })
        .expect(201);

      expect(res.body.name).toBe('Test Product');
      expect(res.body.price).toBe(100);
      createdProductId = res.body._id;
    });

    it('should reject invalid product (missing price)', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Invalid Product' })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const res = await request(app.getHttpServer()).get('/products').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      if (!createdProductId) return;
      const res = await request(app.getHttpServer())
        .get(`/products/${createdProductId}`)
        .expect(200);
      expect(res.body._id).toBe(createdProductId);
    });

    it('should return 404 for unknown id', () => {
      return request(app.getHttpServer())
        .get('/products/507f1f77bcf86cd799439099')
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', async () => {
      if (!createdProductId) return;
      const res = await request(app.getHttpServer())
        .patch(`/products/${createdProductId}`)
        .send({ price: 200 })
        .expect(200);
      expect(res.body.price).toBe(200);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      if (!createdProductId) return;
      await request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .expect(200);
    });
  });
});
