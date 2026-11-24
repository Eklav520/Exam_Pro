import type { TypedStartListening } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export type { RootState };

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
