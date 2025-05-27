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
  async annualIncome(@Query('year') yearString: string) {
    const year = parseInt(yearString, 10);
    if (isNaN(year)) {
      throw new BadRequestException('Year must be a valid number');
    }
    try {
      const result = await this.incomeService.annualIncome(year);
      return result;
    } catch (error) {
      throw new BadRequestException(`erreur ${error}`);
    }
  }

  @Get('annual-taxation')
  async annualTaxation(@Query('year') yearString: string) {
    const year = parseInt(yearString, 10);
    if (isNaN(year)) {
      throw new BadRequestException('Year must be a valid number');
    }
    try {
      const result = await this.incomeService.annualTaxation(year);
      if (!result) {
        throw new Error(`pas de rentree d argent donc pas de taxe `);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`erreur ${error}`);
    }
  }

  @Get('monthly-income')
  async monthlyIncome(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    try {
      const result = await this.incomeService.monthlyIncome(year, month);
      if (!result) {
        throw new Error(`no income for this month ${month} year ${year}`);
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
  ) {
    try {
      const result = await this.incomeService.monthlyTaxation(year, month);
      if (result === null || !result) {
        throw new Error(`no income and no tax for this ${month}`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`error: ${error}`);
    }
  }
}
