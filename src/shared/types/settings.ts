export interface Settings {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSettingsData {
  key: string;
  value: string;
}

export interface UpdateSettingsData {
  key?: string;
  value?: string;
}
