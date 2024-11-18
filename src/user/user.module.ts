import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from './entities/user.entity';
import { UserProcessor } from './user-processor';
import { ProxyService } from './proxy-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'user-status',
    }),
  ],
  providers: [UserService, UserProcessor, ProxyService],
  controllers: [UserController],
})
export class UserModule {}
