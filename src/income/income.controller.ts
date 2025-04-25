import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeService } from './income.service';

@Controller('income')
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('annual-income')
  async annualIncome(@Query('year') year: number) {
    try {
      const result = await this.incomeService.annualIncome(year);
      return result;
    } catch (error) {
      throw new BadRequestException(`erreur ${error}`);
    }
  }

  @Get('annual-taxation')
  async annualTaxation(@Query('year') year: number) {
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
}
