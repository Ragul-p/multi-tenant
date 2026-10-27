import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
export interface JwtPayload { sub: string; merchantId: string; storeId: string; role: 'ADMIN'|'MANAGER'|'CASHIER'; }
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, @InjectRepository(User) private users: Repository<User>) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow('JWT_SECRET') });
  }
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.users.findOne({ where: { id: payload.sub, active: true } });
    if (!user || user.merchantId !== payload.merchantId || user.storeId !== payload.storeId || user.role !== payload.role) throw new UnauthorizedException('User access is no longer valid');
    return { sub: user.id, merchantId: user.merchantId, storeId: user.storeId, role: user.role };
  }
}
