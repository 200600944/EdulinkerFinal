import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Room, RoomType } from '../entities/room.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,

        @InjectRepository(Room)
        private readonly roomRepo: Repository<Room>,
    ) { }

    // Procura salas de chat ativas e anexa a última mensagem enviada (Vista do Professor)
    async getActiveChatRooms() {
        return await this.messageRepo.query(`
            SELECT m.room_id, m.content AS last_content, m.created_at, m.is_ansured, u.nome as aluno_nome
            FROM messages m
            INNER JOIN (
                SELECT room_id, MAX(created_at) as ultima FROM messages GROUP BY room_id
            ) m2 ON m.room_id = m2.room_id AND m.created_at = m2.ultima
            INNER JOIN rooms r on r.id = m.room_id
            INNER JOIN users u ON r.owner_id = u.id
            WHERE r.room_type = 'chat' AND r.is_active = 1
            ORDER BY m.created_at DESC;
        `);
    }

    // Obtém o histórico de mensagens de uma sala incluindo os dados do utilizador que enviou
    async getMessagesByRoom(roomId: number) {
        return await this.messageRepo.find({
            where: { room_id: roomId as any },
            order: { created_at: 'ASC' },
            relations: ['user']
        });
    }

    // Lista as salas de dúvidas ativas de um aluno específico, incluindo o status de resposta
    async getRoomsByStudent(userId: number) {
        return await this.roomRepo.query(`
            SELECT r.id AS room_id, r.name AS room_name, r.created_at AS room_created_at,
                   m.content AS last_content, m.created_at AS last_message_at, 
                   IFNULL(m.is_ansured, 0) AS is_ansured
            FROM rooms r
            LEFT JOIN (
                SELECT room_id, content, created_at, is_ansured FROM messages
                WHERE id IN (SELECT MAX(id) FROM messages GROUP BY room_id)
            ) m ON r.id = m.room_id
            WHERE r.owner_id = ? AND r.is_active = 1
            ORDER BY r.created_at DESC;
        `, [userId]);
    }

    // Cria e grava uma nova mensagem na base de dados
    async createMessage(body: any) {
        const newMessage = this.messageRepo.create(body);
        return await this.messageRepo.save(newMessage);
    }

    // Cria uma nova sala definindo o nome, proprietário e tipo, garantindo que inicia como ativa
    async createRoom(data: { name: string, owner_id: number, room_type: string }) {
        const newRoom = this.roomRepo.create({
            name: data.name,
            owner_id: data.owner_id,
            room_type: data.room_type as RoomType,
            is_active: true
        });
        return await this.roomRepo.save(newRoom);
    }

    // Lista todas as salas do tipo aula (class) que estão atualmente marcadas como ativas
    async getActiveClasses() {
        return await this.roomRepo.query(`
            SELECT id AS room_id, name AS room_name, room_type AS room_type,
                   is_active AS room_is_active, owner_id AS room_created_by,        
                   created_at AS room_created_at       
            FROM rooms 
            WHERE room_type = 'class' AND is_active = 1
            ORDER BY created_at DESC;
        `);
    }

    // Desativa uma sala através de um soft delete, alterando a flag de atividade para falso
    async deactivate(roomId: number) {
        const result = await this.roomRepo.update(roomId, { is_active: false });
        
        // Retorna true se pelo menos uma linha foi afetada pela atualização
        return (result.affected ?? 0) > 0;
    }
}