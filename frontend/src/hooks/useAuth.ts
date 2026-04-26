import { useAppSelector } from './useAppSelector';
import { UserRole } from '../types/roles';

export const useAuth = () => {
  const { user, token } = useAppSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === UserRole.ADMIN,
    isCandidate: user?.role === UserRole.CANDIDAT,
    isCompany: user?.role === UserRole.ENTREPRISE,
  };
};
