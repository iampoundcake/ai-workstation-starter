import configJson from '../config.json';

export interface AppConfig {
  brand: string;
  tagline: string;
  vaultPath: string;
  clientsRoot: string;
  theme: 'workshop' | 'daylight' | 'terminal' | 'studio';
}

export const config: AppConfig = configJson as AppConfig;
