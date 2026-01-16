import { Controller, Get, Post, Patch, Param, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
// Importamos os decorators do Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat') // Vincula este controlador à tag 'Chat' que definiste no main.ts
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('rooms')
    @ApiOperation({ summary: 'Listar salas de chat ativas', description: 'Retorna todas as salas que não foram desativadas (is_active = true).' })
    @ApiResponse({ status: 200, description: 'Lista de salas retornada com sucesso.' })
    async getRooms() {
        try {
            return await this.chatService.getActiveChatRooms();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar salas de chat.");
        }
    }

    @Get('messages/:roomId')
    @ApiOperation({ summary: 'Obter histórico de mensagens', description: 'Recupera todas as mensagens de uma sala específica para carregar no chat.' })
    @ApiParam({ name: 'roomId', description: 'ID numérico da sala', example: '1' })
    @ApiResponse({ status: 200, description: 'Histórico de mensagens retornado.' })
    @ApiResponse({ status: 400, description: 'ID de sala inválido.' })
    async getChatHistory(@Param('roomId') roomId: string) {
        const id = parseInt(roomId);
        if (isNaN(id)) throw new BadRequestException("ID de sala inválido.");
        
        try {
            return await this.chatService.getMessagesByRoom(id);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar histórico de mensagens.");
        }
    }

    @Get('student-rooms/:userId')
    @ApiOperation({ summary: 'Listar salas de dúvidas de um aluno', description: 'Retorna as salas criadas por um estudante específico.' })
    @ApiResponse({ status: 200, description: 'Salas do aluno encontradas.' })
    async getStudentRooms(@Param('userId') userId: number) {
        try {
            return await this.chatService.getRoomsByStudent(userId);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar salas do aluno.");
        }
    }

    @Post('send')
    @ApiOperation({ summary: 'Gravar nova mensagem', description: 'Regista uma mensagem na BD para persistência do histórico.' })
    @ApiBody({ description: 'Dados da mensagem', schema: { example: { room_id: 1, user_id: 2, content: 'Olá!' } } })
    async sendMessage(@Body() body: any) {
        try {
            return await this.chatService.createMessage(body);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao processar a mensagem.");
        }
    }

    @Post('create-room')
    @ApiOperation({ summary: 'Criar nova sala', description: 'Cria uma sala do tipo "aula" ou "chat" (dúvida).' })
    @ApiResponse({ status: 201, description: 'Sala criada com sucesso.' })
    async createRoom(@Body() data: { name: string, owner_id: number, room_type: string }) {
        try {
            return await this.chatService.createRoom(data);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao criar a nova sala.");
        }
    }

    @Get('class-rooms')
    @ApiOperation({ summary: 'Listar salas de aula', description: 'Obtém apenas salas do tipo "aula" que estão ativas.' })
    async getClassRooms() {
        try {
            return await this.chatService.getActiveClasses();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar a lista de salas de aula.");
        }
    }

    @Patch('deactivate-room/:id')
    @ApiOperation({ summary: 'Encerrar uma sala', description: 'Desativa a sala (Soft Delete) para que não apareça mais nas listagens ativas.' })
    @ApiResponse({ status: 200, description: 'Sala encerrada com sucesso.' })
    @ApiResponse({ status: 400, description: 'ID inválido ou sala já encerrada.' })
    async deactivateRoom(@Param('id') id: string) {
        const roomId = parseInt(id);
        if (isNaN(roomId)) throw new BadRequestException("ID inválido.");

        try {
            const success = await this.chatService.deactivate(roomId);
            
            if (!success) {
                throw new BadRequestException("Sala não encontrada ou já desativada.");
            }
            
            return { success: true, message: "Sala encerrada com sucesso." };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException("Não foi possível encerrar a sala.");
        }
    }
}