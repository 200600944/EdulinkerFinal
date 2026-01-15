import { Controller, Get, Post, Patch, Param, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ChatService } from '../services/chat.service'; // Ajusta o caminho se necessário

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('rooms')
    async getRooms() {
        try {
            return await this.chatService.getActiveChatRooms();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar salas de chat.");
        }
    }

    @Get('messages/:roomId')
    async getChatHistory(@Param('roomId') roomId: string) {
        const id = parseInt(roomId);
        if (isNaN(id)) throw new BadRequestException("ID de sala inválido.");
        try {
            return await this.chatService.getMessagesByRoom(id);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar histórico.");
        }
    }

    @Get('student-rooms/:userId')
    async getStudentRooms(@Param('userId') userId: number) {
        try {
            return await this.chatService.getRoomsByStudent(userId);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar salas do aluno.");
        }
    }

    @Post('send')
    async sendMessage(@Body() body: any) {
        try {
            return await this.chatService.createMessage(body);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao processar a mensagem.");
        }
    }

    @Post('create-room')
    async createRoom(@Body() data: { name: string, owner_id: number, room_type: string }) {
        try {
            return await this.chatService.createRoom(data);
        } catch (error) {
            throw new InternalServerErrorException("Erro ao criar a nova sala.");
        }
    }

    @Get('class-rooms')
    async getClassRooms() {
        try {
            return await this.chatService.getActiveClasses();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao carregar salas de aula.");
        }
    }

    @Patch('deactivate-room/:id')
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