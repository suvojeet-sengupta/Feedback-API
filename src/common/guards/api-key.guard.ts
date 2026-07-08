import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const apiKey = this.configService.get<string>('apiKey');

    // If no API key configured, allow all requests
    if (!apiKey) return true;

    const request = context.switchToHttp().getRequest();
    let providedKey =
      request.headers['x-api-key'] ||
      request.query?.apiKey;

    if (!providedKey && request.headers['authorization']) {
      const authHeader = request.headers['authorization'];
      const [type, token] = authHeader.split(' ');
      if (type && type.toLowerCase() === 'bearer') {
        providedKey = token;
      }
    }

    if (!providedKey || providedKey !== apiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
