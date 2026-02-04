import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller()
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Post('items/:id/reserve')
  async reserve(
    @Param('id') itemId: string,
    @Body() body: { reservedByName?: string; reservedByEmail?: string }
  ) {
    return this.reservations.reserve(itemId, {
      reservedByName: body.reservedByName,
      reservedByEmail: body.reservedByEmail,
    });
  }

  @Delete('reservations/:id')
  async cancel(@Param('id') reservationId: string) {
    return this.reservations.cancel(reservationId);
  }
}
