import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@WebSocketGateway({
    cors: {
        origin: '*', // Em produção, coloca aqui o URL do teu frontend
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        @InjectRepository(Message)
        private readonly mensagemRepo: Repository<Message>,
    ) { }

    // 1. Quando o utilizador (Professor ou Aluno) abre o chat, entra numa sala específica
    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        client.join(roomId);
        console.log(`Cliente ${client.id} entrou na sala: ${roomId}`);
    }

    // 2. Quando alguém envia uma mensagem
    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() data: {
        room_id: any, // Pode vir como string do socket, vamos converter
        user_id: number,
        content: string,
        user_role: string
    }) {

        const roomId = Number(data.room_id);

        // 1. Criar a nova mensagem na BD (REMOVIDO o campo 'type')
        const novaMensagem = this.mensagemRepo.create({
            room_id: roomId,
            user_id: data.user_id,
            content: data.content,
            // Se quem envia é professor, a dúvida passa a estar respondida
            is_ansured: data.user_role === 'professor'
        });

        // Grava na BD
        const mensagemSalva = await this.mensagemRepo.save(novaMensagem);

        // 2. Lógica de atualização de status
        if (data.user_role === 'professor') {
            // Se o professor respondeu, atualizamos as mensagens anteriores para "respondidas"
            await this.mensagemRepo.update(
                { room_id: roomId, is_ansured: false },
                { is_ansured: true }
            );
        }

        // 3. Notificações em tempo real

        // Avisa todos (Professores e Alunos) para atualizarem as listas laterais
        this.server.emit('refresh_chat_list');

        // Envia a mensagem para quem está dentro da sala aberta
        // Importante: o .to() precisa do ID exato (string ou number) que foi usado no join_room
        this.server.to(data.room_id.toString()).emit('receive_message', mensagemSalva);
    }
}