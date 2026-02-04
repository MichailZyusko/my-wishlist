import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type CreateWishlistInput = {
  title: string;
  description?: string;
};

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWishlistInput) {
    return this.prisma.wishlist.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        publicId: randomUUID(),
        userId,
      },
    });
  }

  async getById(userId: string, id: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: { reservation: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }

  async getPublic(publicId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { publicId },
      include: {
        items: {
          include: { reservation: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }

  async list(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { reservation: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
