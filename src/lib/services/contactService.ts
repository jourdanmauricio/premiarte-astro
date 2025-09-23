import type { Contact } from '@/shared/types/contact';

class ContactService {
  private baseUrl = '/api/contacts';

  // Obtener todos los contactos
  async getContacts(): Promise<Contact[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Error al obtener los contactos');
    }
    return response.json();
  }

  // Eliminar un contacto
  async deleteContact(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el contacto con ID ${id}`);
    }
  }
}

export const contactService = new ContactService();
