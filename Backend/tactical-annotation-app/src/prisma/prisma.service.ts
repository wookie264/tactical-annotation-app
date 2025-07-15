import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma'; 


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit , OnModuleDestroy {

    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try{
            await this.$connect();
            this.logger.log('Connected to DB');
        }catch(error){
            this.logger.error('Failed to connect to DB', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
