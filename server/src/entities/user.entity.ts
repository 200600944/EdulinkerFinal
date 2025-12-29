import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity'; // Garante que importas a entity Role

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' }) 
  role: Role;

  @Column({ name: 'role_id', nullable: true })
  role_id: number;

  @CreateDateColumn()
  created_at: Date;
}