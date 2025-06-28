import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeService } from './income.service';

@Controller('income')
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('annual-income/:year/:userId')
  async annualIncome(
    @Param('year', ParseIntPipe) year: number,
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.annualIncome(year, userId);
      return result;
    } catch (error) {
      throw new BadRequestException(`erreur ${error}`);
    }
  }

  @Get('annual-taxation/:year/:userId')
  async annualTaxation(
    @Param('year', ParseIntPipe) year: number,
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.annualTaxation(year, userId);
      if (!result) {
        throw new Error(`No income no taxes`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`error ${error}`);
    }
  }

  @Get('monthly-income/:year/:month/:userId')
  async monthlyIncome(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.monthlyIncome(
        year,
        month,
        userId,
      );
      return { value: result ?? 0 };
    } catch (error) {
      throw new BadRequestException(`error: ${error}`);
    }
  }

  @Get('monthly-taxation/:year/:month/:userId')
  async monthlyTaxation(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.monthlyTaxation(
        year,
        month,
        userId,
      );
      return { value: result ?? 0 };
    } catch (error) {
      throw new BadRequestException(`error: ${error}`);
    }
  }
}
