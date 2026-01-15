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
        origin: '*', // Em produção, substituir pelo URL do teu frontend
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    // Armazena a lista de utilizadores ativos por sala (Memória)
    private usersInRooms: Map<string, any[]> = new Map();

    // [LÓGICA DO KONVA] Guarda o histórico de traços para novos alunos verem o que já foi desenhado
    private canvasHistory: Map<string, any[]> = new Map();

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: { roomId: string, user: any },
        @ConnectedSocket() client: Socket
    ) {
        const { roomId, user } = data;
        const roomIdStr = roomId.toString();

        client.join(roomIdStr);

        // --- GESTÃO DE UTILIZADORES ONLINE ---
        let users = this.usersInRooms.get(roomIdStr) || [];
        
        // Evita duplicar o utilizador na lista em caso de refresh da página
        if (!users.find(u => u.id === user.id)) {
            users.push({
                id: user.id,
                nome: user.nome,
                role: user.role,
                socketId: client.id
            });
        }
        this.usersInRooms.set(roomIdStr, users);

        // [KONVA] Recupera e envia o histórico de desenhos apenas para quem acabou de entrar
        const history = this.canvasHistory.get(roomIdStr) || [];
        client.emit('canvas_history', history);

        console.log(`Utilizador ${user.nome} entrou na sala: ${roomIdStr}`);

        // Atualiza a lista de "Presentes" para todos os utilizadores na sala
        this.server.to(roomIdStr).emit('update_user_list', users);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: { roomId: string, userId: number },
        @ConnectedSocket() client: Socket
    ) {
        const roomIdStr = data.roomId.toString();
        client.leave(roomIdStr);

        let users = this.usersInRooms.get(roomIdStr) || [];
        // Remove o utilizador da listagem local de presenças
        users = users.filter(u => u.id !== data.userId);

        this.usersInRooms.set(roomIdStr, users);

        // Notifica a sala que o utilizador saiu para atualizar a UI
        this.server.to(roomIdStr).emit('update_user_list', users);

        console.log(`Utilizador ${data.userId} saiu da sala: ${roomIdStr}`);
    }

    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() data: {
        room_id: any,
        user_id: number,
        content: string,
        user_role: string,
        nome?: string
    }) {
        const roomId = Number(data.room_id);

        // Prepara a mensagem para ser guardada na base de dados via TypeORM
        const newMessage = this.messageRepository.create({
            room_id: roomId,
            user_id: data.user_id,
            content: data.content,
            // Se for o professor a enviar, a dúvida é marcada como respondida automaticamente
            is_ansured: data.user_role === 'professor'
        });

        const savedMessage = await this.messageRepository.save(newMessage);

        // Se o professor responder, atualiza o estado de todas as mensagens pendentes da sala
        if (data.user_role === 'professor') {
            await this.messageRepository.update(
                { room_id: roomId, is_ansured: false },
                { is_ansured: true }
            );
        }

        // Avisa o sistema para atualizar as listas de conversas (ex: abas de dúvidas)
        this.server.emit('refresh_chat_list');

        const broadcastData = {
            ...savedMessage,
            nome: data.nome, 
            user_role: data.user_role
        };

        // Envia a mensagem em tempo real para os participantes da sala
        this.server.to(data.room_id.toString()).emit('receive_message', broadcastData);
    }

    @SubscribeMessage('draw_line')
    handleDrawLine(@MessageBody() data: any) {
        // [SEGURANÇA] Garante que apenas o professor pode emitir desenhos para a sala
        if (data.userRole?.toLowerCase() !== 'professor') return;

        const roomIdStr = data.roomId.toString();

        // [KONVA] Guarda os pontos recebidos no histórico em memória do servidor
        let history = this.canvasHistory.get(roomIdStr) || [];
        history.push(data.line);
        this.canvasHistory.set(roomIdStr, history);

        // [KONVA] Propaga as coordenadas para os Konvas dos alunos na sala
        this.server.to(roomIdStr).emit('draw_line', data.line);
    }

    @SubscribeMessage('clear_canvas')
    handleClearCanvas(@MessageBody() data: { roomId: any, userRole: string }) {
        // [SEGURANÇA] Só o professor tem permissão para limpar o quadro
        if (data.userRole?.toLowerCase() !== 'professor') return;
        
        const roomIdStr = data.roomId.toString();
        
        // [KONVA] Apaga o histórico da sala no servidor
        this.canvasHistory.set(roomIdStr, []);
        
        // [KONVA] Envia ordem de limpeza para todos os frontends ligados
        this.server.to(roomIdStr).emit('clear_canvas');
    }
}