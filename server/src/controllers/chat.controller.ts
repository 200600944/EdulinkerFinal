import { Controller, Get, Post, Param, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Room, RoomType } from '../entities/room.entity';


@Controller('chat')
export class ChatController {
    // chat.controller.ts

    constructor(
        @InjectRepository(Message)
        private readonly mensageRepo: Repository<Message>,

        @InjectRepository(Room)
        private readonly roomRepo: Repository<Room>,
    ) { }
    // 1. Rota para listar todas as salas e o seu status (Pendente/Respondida)
    @Get('rooms')
    async getRooms() {
        // // Esta query SQL faz o seguinte:
        // // - Agrupa por sala (room_id)
        // // - Pega a mensagem mais recente (ORDER BY created_at DESC)
        // // - Faz JOIN com utilizadores para saber o nome do aluno
        // // - Verifica a tua coluna 'is_ansured' para definir o status
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
            INNER JOIN rooms r on r.id=m.room_id
            INNER JOIN users u ON r.owner_id = u.id
            where r.room_type='chat'
            ORDER BY m.created_at DESC;
        `);
        return await this.mensageRepo.find();
    }

    //carregar o histórico de uma sala específica ao clicar em "Responder"
    @Get('messages/:roomId')
    async getChatHistory(@Param('roomId') roomId: string) {
        try {
            const id = parseInt(roomId);

            if (isNaN(id)) {
                console.error("DEBUG: roomId não é um número válido:", roomId);
                return [];
            }

            // Tenta primeiro SEM as relations para ver se o erro é no JOIN
            const mensagens = await this.mensageRepo.find({
                where: { room_id: id as any },
                order: { created_at: 'ASC' },
                relations: ['user']
            });

            return mensagens;

        } catch (error) {
            // ISTO VAI APARECER NO TEU TERMINAL (VS CODE)
            console.error("-----------------------------------------");
            console.error("ERRO REAL NO NESTJS:", error.message);
            console.error("CÓDIGO DO ERRO:", error.code);
            console.error("-----------------------------------------");

            throw new InternalServerErrorException(error.message);
        }
    }

    //Lista salas de duvidas do aluno 
    @Get('student-rooms/:userId')
    async getStudentRooms(@Param('userId') userId: number) {
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
        WHERE id IN (
            SELECT MAX(id) FROM messages GROUP BY room_id
        )
    ) m ON r.id = m.room_id
    WHERE r.owner_id = ${userId} AND r.is_active = 1
    ORDER BY r.created_at DESC;
  `);
    }

    //criar uma nova mensagem (Início de chat)
    @Post('send')
    async sendMessage(@Body() body: any) {
        const newMessage = this.mensageRepo.create(body);
        return await this.mensageRepo.save(newMessage);
    }

    //Criar sala
    @Post('create-room')
    async createRoom(@Body() data: { name: string, owner_id: number, room_type: string }) {
        // 1. Cria a sala na tabela 'rooms'
        const newRoom = this.roomRepo.create({
            name: data.name,
            owner_id: data.owner_id,
            room_type: data.room_type as RoomType,
            is_active: true
        });

        const savedRoom = await this.roomRepo.save(newRoom);

        return savedRoom;
    }

    //Lista salas de Aula
    @Get('class-rooms')
        async getClassRooms() {
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
        }
}