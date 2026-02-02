import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { PrismaModule } from "./common/utils/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ItemTypesModule } from "./item-types/item-types.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { InventoryModule } from "./inventory/inventory.module";
import { ReportsModule } from "./reports/reports.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    ItemTypesModule,
    TransactionsModule,
    InventoryModule,
    ReportsModule,
    UploadsModule,
  ],
})
export class AppModule {}
