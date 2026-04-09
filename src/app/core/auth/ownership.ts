import { AuthUser } from '../../modules/auth/service/auth.service';

export function canUserManage(
  resource: { userId: number } | null | undefined,
  user: Pick<AuthUser, 'id'> | null,
): boolean {
  return !!resource && !!user && resource.userId === user.id;
}
