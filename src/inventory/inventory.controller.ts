import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsInt, Min } from 'class-validator';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
class AdjustInventoryDto { @IsInt() @Min(0) quantity: number; }
@Controller('inventory') @UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private service: InventoryService) { }
  @Get() list(@CurrentUser() user: any) {
    return this.service.list(user.merchantId, user.storeId);
  }
  @Patch(':productId') @UseGuards(RolesGuard) @Roles('ADMIN', 'MANAGER')
  adjust(@CurrentUser() user: any, @Param('productId') productId: string, @Body() dto: AdjustInventoryDto) {
    return this.service.adjust(user.merchantId, user.storeId, productId, dto.quantity);
  }
}
