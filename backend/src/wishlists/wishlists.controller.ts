import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlists: WishlistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: { user: { id: string } },
    @Body() body: { title?: string; description?: string }
  ) {
    return this.wishlists.create(req.user.id, {
      title: body.title ?? 'My Wishlist',
      description: body.description,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: { user: { id: string } }) {
    return this.wishlists.list(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.wishlists.getById(req.user.id, id);
  }

  @Get('public/:publicId')
  async getPublic(@Param('publicId') publicId: string) {
    return this.wishlists.getPublic(publicId);
  }
}
