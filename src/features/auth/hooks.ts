import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { sessionEnded } from '@/shared/api/session';
import { useGetMeQuery } from './api/authApi';
import { selectIsAuthenticated } from './model/authSlice';

export function useCurrentUser() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  return isAuthenticated ? data : undefined;
}

export function useLogout() {
  const dispatch = useAppDispatch();
  return () => {
    dispatch(sessionEnded('logout'));
  };
}
