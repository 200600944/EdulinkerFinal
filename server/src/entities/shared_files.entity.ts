import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shared_file')
export class Shared_File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  room_id: number;

  @Column()
  user_id: number;

  @Column()
  file_name: string; 

  @Column()
  file_url: string;  

  @Column()
  file_size: string; 

  @CreateDateColumn()
  created_at: Date;
}