import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

const mockProduct = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Laptop Dell XPS',
  description: 'Laptop de alto rendimiento',
  price: 999.99,
  category: 'Electrónica',
  createdAt: new Date(),
};

const mockProductModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(mockProduct),
            ...mockProductModel,
          })),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    // Attach statics to the mock constructor
    const model = module.get(getModelToken(Product.name));
    Object.assign(model, mockProductModel);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const model = service['productModel'] as any;
      model.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockProduct]) });

      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const model = service['productModel'] as any;
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockProduct) });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const model = service['productModel'] as any;
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when product not found', async () => {
      const model = service['productModel'] as any;
      model.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('evaluateDiscount - VULNERABILIDAD INTENCIONAL', () => {
    it('should calculate discount using eval', () => {
      // Este test documenta la vulnerabilidad: eval ejecuta código arbitrario
      const result = service.evaluateDiscount('* 0.9', 100);
      expect(result).toBe(90);
    });
  });
});
