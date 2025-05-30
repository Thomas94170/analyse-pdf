import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeService } from './income.service';

@Controller('income')
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('annual-income')
  async annualIncome(
    @Query('year') yearString: string,
    @Query('userId') userId: string,
  ) {
    const year = parseInt(yearString, 10);
    if (isNaN(year)) {
      throw new BadRequestException('Year must be a valid number');
    }
    try {
      const result = await this.incomeService.annualIncome(year, userId);
      return result;
    } catch (error) {
      throw new BadRequestException(`erreur ${error}`);
    }
  }

  @Get('annual-taxation')
  async annualTaxation(
    @Query('year') yearString: string,
    @Query('userId') userId: string,
  ) {
    const year = parseInt(yearString, 10);
    if (isNaN(year)) {
      throw new BadRequestException('Year must be a valid number');
    }
    try {
      const result = await this.incomeService.annualTaxation(year, userId);
      if (!result) {
        throw new Error(`No income no taxes `);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`error ${error}`);
    }
  }

  @Get('monthly-income')
  async monthlyIncome(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.monthlyIncome(
        year,
        month,
        userId,
      );
      if (!result) {
        throw new Error(`No income for this month ${month} year ${year}`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`error: ${error}`);
    }
  }

  @Get('monthly-taxation')
  async monthlyTaxation(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('userId') userId: string,
  ) {
    try {
      const result = await this.incomeService.monthlyTaxation(
        year,
        month,
        userId,
      );
      if (result === null || !result) {
        throw new Error(`No income and no tax for this ${month}`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`error: ${error}`);
    }
  }
}
