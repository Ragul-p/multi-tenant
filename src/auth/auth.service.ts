import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) { }

  async login(email: string, password: string) {
    const user = await this.users.createQueryBuilder('u').addSelect('u.passwordHash').where('LOWER(u.email) = LOWER(:email)', { email }).andWhere('u.active = true').getOne();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    const payload = { sub: user.id, merchantId: user.merchantId, storeId: user.storeId, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      user: {
        id: user.id, email: user.email,
        merchantId: user.merchantId, storeId: user.storeId, role: user.role
      }
    };
  }
}
