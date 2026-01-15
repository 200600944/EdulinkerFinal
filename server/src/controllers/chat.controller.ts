import { Controller, Get, Post, Patch, Param, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Room, RoomType } from '../entities/room.entity';

@Controller('chat')
export class ChatController {
    constructor(
        @InjectRepository(Message)
        private readonly mensageRepo: Repository<Message>,

        @InjectRepository(Room)
        private readonly roomRepo: Repository<Room>,
    ) { }

    // Lista as salas de dúvidas para a vista do Professor, garantindo que apenas salas ativas aparecem
    @Get('rooms')
    async getRooms() {
        try {
            return await this.mensageRepo.query(`
                SELECT 
                    m.room_id, 
                    m.content AS last_content, 
                    m.created_at, 
                    m.is_ansured,
                    u.nome as aluno_nome
                FROM messages m
                INNER JOIN (
                    SELECT room_id, MAX(created_at) as ultima
                    FROM messages
                    GROUP BY room_id
                ) m2 ON m.room_id = m2.room_id AND m.created_at = m2.ultima
                INNER JOIN rooms r on r.id = m.room_id
                INNER JOIN users u ON r.owner_id = u.id
                WHERE r.room_type = 'chat' AND r.is_active = 1
                ORDER BY m.created_at DESC;
            `);
        } catch (error) {
            console.error("Erro ao carregar salas de chat:", error.message);
            throw new InternalServerErrorException("Erro ao carregar salas de chat.");
        }
    }

    // Procura o histórico completo de mensagens de uma sala específica para carregar no chat
    @Get('messages/:roomId')
    async getChatHistory(@Param('roomId') roomId: string) {
        try {
            const id = parseInt(roomId);
            if (isNaN(id)) throw new BadRequestException("ID de sala inválido.");

            return await this.mensageRepo.find({
                where: { room_id: id as any },
                order: { created_at: 'ASC' },
                relations: ['user']
            });
        } catch (error) {
            console.error("Erro ao carregar histórico:", error.message);
            throw new InternalServerErrorException("Erro ao carregar histórico de mensagens.");
        }
    }

    // Lista as salas de dúvidas criadas por um aluno específico que ainda estejam marcadas como ativas
    @Get('student-rooms/:userId')
    async getStudentRooms(@Param('userId') userId: number) {
        try {
            return await this.roomRepo.query(`
                SELECT 
                    r.id AS room_id, 
                    r.name AS room_name, 
                    r.created_at AS room_created_at,
                    m.content AS last_content, 
                    m.created_at AS last_message_at, 
                    IFNULL(m.is_ansured, 0) AS is_ansured
                FROM rooms r
                LEFT JOIN (
                    SELECT room_id, content, created_at, is_ansured
                    FROM messages
                    WHERE id IN (SELECT MAX(id) FROM messages GROUP BY room_id)
                ) m ON r.id = m.room_id
                WHERE r.owner_id = ? AND r.is_active = 1
                ORDER BY r.created_at DESC;
            `, [userId]);
        } catch (error) {
            console.error("Erro ao carregar salas do aluno:", error.message);
            throw new InternalServerErrorException("Erro ao carregar as tuas salas de dúvidas.");
        }
    }

    // Regista uma nova mensagem na base de dados (usado para iniciar ou continuar conversas)
    @Post('send')
    async sendMessage(@Body() body: any) {
        try {
            const newMessage = this.mensageRepo.create(body);
            return await this.mensageRepo.save(newMessage);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error.message);
            throw new InternalServerErrorException("Erro ao processar o envio da mensagem.");
        }
    }

    // Cria uma nova sala (Aula ou Chat) definindo o dono e garantindo que o status inicial é ativo
    @Post('create-room')
    async createRoom(@Body() data: { name: string, owner_id: number, room_type: string }) {
        try {
            const newRoom = this.roomRepo.create({
                name: data.name,
                owner_id: data.owner_id,
                room_type: data.room_type as RoomType,
                is_active: true
            });
            return await this.roomRepo.save(newRoom);
        } catch (error) {
            console.error("Erro ao criar sala:", error.message);
            throw new InternalServerErrorException("Erro ao criar a nova sala.");
        }
    }

    // Obtém todas as salas do tipo 'aula' (class) que estejam ativas para preencher o Lobby
    @Get('class-rooms')
    async getClassRooms() {
        try {
            return await this.roomRepo.query(`
                SELECT 
                    id AS room_id, 
                    name AS room_name, 
                    room_type AS room_type,
                    is_active AS room_is_active,
                    owner_id AS room_created_by,        
                    created_at AS room_created_at       
                FROM rooms 
                WHERE room_type = 'class' AND is_active = 1
                ORDER BY created_at DESC;
            `);
        } catch (error) {
            console.error("Erro ao carregar salas de aula:", error.message);
            throw new InternalServerErrorException("Erro ao carregar a lista de salas de aula.");
        }
    }

    // Desativa logicamente uma sala alterando a flag is_active para falso (Soft Delete)
    @Patch('deactivate-room/:id')
    async deactivateRoom(@Param('id') id: string) {
        try {
            const roomId = parseInt(id);
            if (isNaN(roomId)) throw new BadRequestException("ID inválido.");

            const result = await this.roomRepo.update(roomId, { is_active: false });
            
            if (result.affected === 0) {
                throw new BadRequestException("Sala não encontrada ou já se encontra desativada.");
            }

            return { success: true, message: "Sala encerrada com sucesso." };
        } catch (error) {
            console.error("Erro ao desativar sala:", error.message);
            throw new InternalServerErrorException("Não foi possível encerrar a sala.");
        }
    }
}