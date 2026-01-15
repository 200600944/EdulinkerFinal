import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    // Valida credenciais e retorna os dados do utilizador
    async validateUser(email: string, pass: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['role']
        });

        if (!user || user.password !== pass) {
            throw new UnauthorizedException('Dados Inválidos!');
        }

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role?.name
        };
    }

    // Lógica de registo com verificação de existência
    async register(createDto: CreateUserDto) {
        const userExists = await this.userRepository.findOne({ where: { email: createDto.email } });
        if (userExists) {
            throw new BadRequestException('Este email já está registado.');
        }

        const newUser = this.userRepository.create(createDto);

        if (createDto.role_id) {
            newUser.role = { id: Number(createDto.role_id) } as Role;
        }

        return await this.userRepository.save(newUser);
    }

    // Procura todas as roles disponíveis
    async findAllRoles() {
        return await this.roleRepository.find();
    }

    // Lista todos os utilizadores com as suas respetivas roles
    async findAllUsers() {
        return await this.userRepository.find({ relations: ['role'] });
    }
}