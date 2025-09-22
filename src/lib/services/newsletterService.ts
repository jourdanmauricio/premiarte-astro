import type { NewsletterSubscriber } from '@/shared/types';
  
class NewsletterService {
  private baseUrl = '/api/newsletter';
  
  // Obtener todos los productos
  async getNewsletter(): Promise<NewsletterSubscriber[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener el newsletter');
    }
    return response.json();
  }

  // Eliminar un newsletter
  async deleteNewsletter(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el newsletter con ID ${id}`);
    }
  }
}

export const newsletterService = new NewsletterService();
  