import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { PrismaModule } from "./common/utils/prisma.module";
import { ItemTypesModule } from "./item-types/item-types.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { InventoryModule } from "./inventory/inventory.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    ItemTypesModule,
    TransactionsModule,
    InventoryModule,
    ReportsModule,
  ],
})
export class AppModule {}
