import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
  VITE_ENABLE_MOCKS: z.enum(['true', 'false']).default('false'),
});

const parsed = envSchema.parse(import.meta.env);

export const env = {
  apiBaseUrl: parsed.VITE_API_BASE_URL.replace(/\/$/, ''),
  enableMocks: parsed.VITE_ENABLE_MOCKS === 'true',
} as const;
