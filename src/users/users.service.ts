import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  sanitize(user: User) {
    const sanitized = { ...user } as Partial<User>;
    delete sanitized.password;
    return sanitized;
  }

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existingEmail) {
      throw new ConflictException('El correo ya está registrado');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });

    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async findAll(query: QueryUsersDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 50) : 10;

    const qb = this.userRepository.createQueryBuilder('user');

    qb.where('user.is_active = :isActive', { isActive: true });

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      qb.andWhere('user.name ILIKE :searchTerm OR user.email ILIKE :searchTerm', {
        searchTerm,
      });
    }

    qb.select(['user.id', 'user.name', 'user.email', 'user.is_active'])
      .orderBy('user.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.sanitize(user as User);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if (existingEmail) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    const updatedUser = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (updateUserDto.password) {
      updatedUser.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const saved = await this.userRepository.save(updatedUser);
    return this.sanitize(saved);
  }

  async softDelete(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (!user.is_active) {
      return this.sanitize(user);
    }

    user.is_active = false;
    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }
}
