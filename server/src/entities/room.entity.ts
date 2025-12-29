import { Entity, Column, PrimaryGeneratedColumn,CreateDateColumn } from 'typeorm';
export enum RoomType {
  CLASS = 'class',
  CHAT = 'chat',
}


@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number; // ou string, se usares UUID

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum:RoomType,
    default: RoomType.CHAT
  })
  room_type: RoomType;

  @Column()
  owner_id: number; // ID do aluno que criou

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}