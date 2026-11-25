import { adminHandlers } from './admin';
import { attemptHandlers } from './attempts';
import { authHandlers } from './auth';
import { centreHandlers } from './centres';
import { examHandlers } from './exams';

export const handlers = [
  ...authHandlers,
  ...examHandlers,
  ...attemptHandlers,
  ...adminHandlers,
  ...centreHandlers,
];
