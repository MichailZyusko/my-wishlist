import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ItemsService } from './items.service';

@Controller()
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Post('wishlists/:id/items')
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: { user: { id: string } },
    @Param('id') wishlistId: string,
    @Body() body: { name?: string; url?: string }
  ) {
    return this.items.create(req.user.id, wishlistId, {
      name: body.name ?? 'Wishlist item',
      url: body.url ?? '',
    });
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: { user: { id: string } },
    @Param('id') itemId: string,
    @Body() body: { name?: string; url?: string }
  ) {
    return this.items.update(req.user.id, itemId, body);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: { user: { id: string } }, @Param('id') itemId: string) {
    return this.items.remove(req.user.id, itemId);
  }
}
