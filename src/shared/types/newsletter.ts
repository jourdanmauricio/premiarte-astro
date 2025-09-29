export interface NewsletterSubscriber {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string;
}
