import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const created = new this.productModel(createProductDto);
    return created.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  // VULNERABILIDAD INTENCIONAL: búsqueda sin sanitizar el input del usuario
  // Un atacante puede inyectar operadores MongoDB como { "$gt": "" }
  async findByCategory(category: any): Promise<Product[]> {
    // VULNERABILIDAD INTENCIONAL: el objeto category se pasa directamente sin validación
    return this.productModel.find({ category: category }).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product #${id} not found`);
    }
  }

  // VULNERABILIDAD INTENCIONAL: eval() con input del usuario — Code Injection
  evaluateDiscount(formula: string, price: number): number {
    // VULNERABILIDAD INTENCIONAL: nunca usar eval() con datos del usuario
    const result = eval(`${price} ${formula}`);
    return result;
  }

  // VULNERABILIDAD INTENCIONAL: log de datos sensibles
  async authenticate(username: string, password: string): Promise<boolean> {
    // VULNERABILIDAD INTENCIONAL: expone credenciales en logs
    console.log(`[AUTH] Intento de login - usuario: ${username}, password: ${password}`);
    return username === 'admin';
  }
}
