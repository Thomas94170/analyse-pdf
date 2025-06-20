import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { JwtAuthGuard } from './auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';

//export type AuthBody = { email: string; password: string };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const create = await this.authService.register(createUserDto);
      if (create) {
        console.log(`user create with success`);
      }
      console.log(create);
      return create;
    } catch (error) {
      throw new NotFoundException(`error : ${error}`);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const logged = await this.authService.login(loginUserDto);
      if (logged) {
        console.log(`logged with success`);
      }
      console.log(logged);
      return logged;
    } catch (error) {
      throw new NotFoundException(`error : ${error}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticateUser(@Request() req: RequestWithUser) {
    console.log(req.user.userId);
    return await this.userService.userById({ id: req.user.userId });
  }

  @Patch('new-password')
  async newPassword(@Body() updateUserDto: UpdateUserDto) {
    try {
      const updatePassword =
        await this.authService.resetPassword(updateUserDto);
      console.log(updatePassword);
      return updatePassword;
    } catch (error) {
      throw new NotFoundException(`error : ${error}`);
    }
  }

  @Post('logout')
  logout(@Req() req) {
    const userId = req.user?.userId;
    console.log('Déconnexion backend pour user :', userId);
    return this.authService.logout(userId);
  }
}
