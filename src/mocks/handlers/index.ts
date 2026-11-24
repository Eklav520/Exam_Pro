import { adminHandlers } from './admin';
import { attemptHandlers } from './attempts';
import { authHandlers } from './auth';
import { examHandlers } from './exams';

export const handlers = [...authHandlers, ...examHandlers, ...attemptHandlers, ...adminHandlers];
