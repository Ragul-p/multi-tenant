import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from './sales.service';
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private service: SalesService) { }
  @Post() create(@CurrentUser() user: any, @Headers('idempotency-key') key: string, @Body() dto: CreateSaleDto) {
    return this.service.createSale(user.merchantId, user.storeId, key, dto);
  }
  @Get() list(@CurrentUser() user: any) {
    return this.service.list(user.merchantId, user.storeId);
  }
  @Get(':id') get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.get(user.merchantId, user.storeId, id);
  }
}
