import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  id: string;
  sessionToken: string;
  displayName: string;
  isAnonymous: boolean;
}

export const CurrentUserDecorator = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUser | undefined;

    if (!user) return null;
    if (data) {
      return user[data] ?? null;
    }

    return user;
  },
);

export { CurrentUserDecorator as CurrentUser };
