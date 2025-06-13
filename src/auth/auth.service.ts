import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
//import { AuthBody } from './auth.controller';
import { hash, compare } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      throw new Error(`no user with email: ${email}`);
    }
    const isPasswordValid = await this.passwordValid({
      password,
      hashedPassword: existingUser.password,
    });
    if (!isPasswordValid) {
      throw new Error(`not same password `);
    }

    return this.authenticateUser({ userId: existingUser.id });
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error(`user already exists`);
    }
    const hashedPassword = await this.hashPassword({ password });
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    await this.mailerService.sendMailAfterRegistration(email);
    return {
      message: 'User created with success. Login please.',
      userId: user.id,
    };
  }

  async resetPassword(updateUserDto: UpdateUserDto) {
    const { email, password } = updateUserDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      throw new Error(`Bad credential`);
    }
    const hashedPassword = await this.hashPassword({ password });
    const userUpdated = await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
      select: { id: true, email: true },
    });
    console.log(userUpdated);
    await this.mailerService.newPassword(email);
    return {
      message: 'User created with success. Login please.',
      userId: userUpdated.id,
    };
  }

  private async hashPassword({ password }: { password: string }) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  private async passwordValid({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }

  private authenticateUser({ userId }: { userId: string }) {
    const payload: UserPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload), // ajouter une expiration plus tard sign(payload, { expiresIn: '1h' })
    };
  }
}
