import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async allUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    return users;
  }

  async userById({ id }: { id: string }) {
    const byId = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    return byId;
  }

  async userByEmail({ email }: { email: string }) {
    const byEmail = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    return byEmail;
  }

  async deleteUser({ id }: { id: string }) {
    const deleteById = await this.prisma.user.delete({ where: { id } });
    return deleteById;
  }
}
