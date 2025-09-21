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

export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  description: string;
}

export interface TestimonialData {
  title: string;
  testimonials: Testimonial[];
}


export interface Service {
  id: number;
  title: string;
  image: number;
  description: string;
}

export interface ServiceData {
  title: string;
  services: Service[];
}