import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Controllers
import { AppController } from './app.controller';
import { UserController } from './controllers/user.controller';
import { ChatController } from './controllers/chat.controller';
import { SharedFilesController } from './controllers/sharedFiles.controller';

// Gateways
import { ChatGateway } from './gateway/chat.gateway'; 

// Services
import { AppService } from './app.service';
import { ChatService } from './services/chat.service';
import { SharedFilesService } from './services/sharedfiles.service';
import { UserService } from './services/user.service';

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity'; 
import { Message } from './entities/message.entity'; 
import { Room } from './entities/room.entity'; 
import { Shared_Files } from './entities/shared_files.entity'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      serveStaticOptions: {
        index: 'views/index.html' 
      }
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], 
        synchronize: false,
      }),
    }),

    // Repositórios disponíveis para os Services injetarem
    TypeOrmModule.forFeature([User, Role, Message, Room, Shared_Files]), 
  ],
  controllers: [
    AppController, 
    UserController, 
    ChatController,
    SharedFilesController 
  ],
  providers: [
    AppService, 
    ChatService,  
    SharedFilesService,
    UserService, 
    ChatGateway 
  ],
})
export class AppModule { }