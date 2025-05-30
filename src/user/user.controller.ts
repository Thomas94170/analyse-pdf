import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async allUsers() {
    try {
      const users = await this.userService.allUsers();
      if (!users) {
        throw new BadRequestException(`no users in database`);
      }
      return users;
    } catch (error) {
      console.log(`error with : ${error}`);
    }
  }

  @Get('id/:id')
  async userByid(@Param('id') id: string) {
    try {
      const byId = await this.userService.userById({ id });
      if (!id) {
        throw new BadRequestException(`no user in database with id: ${id}`);
      }
      return byId;
    } catch (error) {
      console.log(`error with : ${error}`);
    }
  }

  @Get('email/:email')
  async userByEmail(@Param('email') email: string) {
    try {
      const byEmail = await this.userService.userByEmail({ email });
      if (!email) {
        throw new BadRequestException(
          `no user in database with email: ${email}`,
        );
      }
    } catch (error) {
      console.log(`error with : ${error}`);
    }
  }

  @Delete('id/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      const deletedUser = await this.userService.deleteUser({ id });
      if (!id) {
        throw new BadRequestException(`no user in database with id ${id}`);
      }
      return deletedUser;
    } catch (error) {
      console.log(`error with : ${error}`);
    }
  }
}
