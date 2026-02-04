import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ReserveItemInput = {
  reservedByName?: string;
  reservedByEmail?: string;
};

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(itemId: string, data: ReserveItemInput) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { reservation: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.reservation) {
      throw new ConflictException('Item already reserved');
    }

    return this.prisma.reservation.create({
      data: {
        itemId,
        reservedByName: data.reservedByName ?? null,
        reservedByEmail: data.reservedByEmail ?? null,
      },
    });
  }

  async cancel(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.prisma.reservation.delete({ where: { id: reservationId } });
  }
}
