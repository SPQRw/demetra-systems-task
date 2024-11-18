import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from './entities/user.entity';
import { CustomCacheManager } from './interface/cache-manager.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectQueue('user-status')
    private userStatusQueue: Queue,
    @Inject(CACHE_MANAGER)
    private cacheManager: CustomCacheManager,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'ERR_USER_EMAIL_EXISTS',
      });
    }

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    console.log(`Adding user activation task to queue for user ID ${user.id}`);
    await this.userStatusQueue.add(
      'activate-user',
      { userId: user.id },
      { delay: 10000 },
    );

    return user;
  }

  async findById(id: number): Promise<User> {
    console.log(`Attempting to retrieve user_${id} from cache...`);
    const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
    if (cachedUser) {
      console.log(`Cache hit for user_${id}`);
      return cachedUser;
    }

    console.log(`Cache miss for user_${id}. Fetching from database...`);
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'ERR_USER_NOT_FOUND',
      });
    }

    console.log(`Saving user_${id} to cache`);
    await this.cacheManager.set(`user_${id}`, user, { ttl: 1800 });

    return user;
  }

  async activateUser(userId: number): Promise<void> {
    console.log(`Activating user with ID ${userId}`);
    await this.usersRepository.update(userId, { status: true });
  }
}
