import { Entity, Column, PrimaryGeneratedColumn,CreateDateColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number; // ou string, se usares UUID

  @Column()
  name: string;

  @Column()
  owner_id: number; // ID do aluno que criou

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}