import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return { statusCode: 201, message: 'USER_CREATED', user };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: 500,
        message: 'ERR_INTERNAL_SERVER',
      });
    }
  }

  @Get('get-user-by-id')
  async getUserById(@Query('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'ERR_INVALID_USER_ID',
      });
    }

    try {
      const user = await this.userService.findById(userId);
      return { statusCode: 200, message: 'SUCCESS', user };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: 500,
        message: 'ERR_INTERNAL_SERVER',
      });
    }
  }
}
