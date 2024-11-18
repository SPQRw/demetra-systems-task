import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Processor('user-status')
@Injectable()
export class UserProcessor {
  constructor(private readonly userService: UserService) {}

  @Process('activate-user')
  async handleActivateUser(job: Job) {
    const { userId } = job.data;

    console.log(`Processing activation task for user ID ${userId}`);

    await this.userService.activateUser(userId);

    console.log(`User activation task completed for user ID ${userId}`);
  }
}
