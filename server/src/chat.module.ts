import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa os controladores e gateways das pastas onde os criaste
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    // Regista a entidade Mensagem para que o Repository possa ser 
    // injetado no Controller e no Gateway via @InjectRepository
    TypeOrmModule.forFeature([Message])
  ],
  controllers: [
    ChatController
  ],
  providers: [
    ChatGateway
  ],
  exports: [
  ]
})
export class ChatModule {}