// Importar todos los servicios
import { BudgetService } from './services/budgets';
import { NewsletterService } from './services/newsletter';
import { CategoryService } from './services/categories';
import { ProductService } from './services/products';
import { ImageService } from './services/images';
import { SettingService } from './services/settings';
import { ContactService } from './services/contacts';
import { CustomerService } from './services/customers';
import { ResponsibleService } from './services/responsibles';
import { OrderService } from '@/lib/services/orders';

// Re-exportar todas las funciones de los servicios para mantener compatibilidad
export class Database {
  // PRESUPUESTOS
  static getAllBudgets = BudgetService.getAllBudgets;
  static getBudgetById = BudgetService.getBudgetById;
  static deleteBudget = BudgetService.deleteBudget;
  static createBudget = BudgetService.createBudget;
  static updateBudget = BudgetService.updateBudget;
  static updateBudgetStatus = BudgetService.updateBudgetStatus;
  static markBudgetAsRead = BudgetService.markBudgetAsRead;

  // NEWSLETTER
  static getAllNewsletter = NewsletterService.getAllNewsletter;
  static deleteNewsletter = NewsletterService.deleteNewsletter;
  static getNewsletterById = NewsletterService.getNewsletterById;
  static updateNewsletter = NewsletterService.updateNewsletter;
  static createNewsletterSubscriber =
    NewsletterService.createNewsletterSubscriber;
  static getNewsletterSubscriberByEmail =
    NewsletterService.getNewsletterSubscriberByEmail;
  static reactivateNewsletterSubscriber =
    NewsletterService.reactivateNewsletterSubscriber;
  static getAllNewsletterSubscribers =
    NewsletterService.getAllNewsletterSubscribers;
  static unsubscribeFromNewsletter =
    NewsletterService.unsubscribeFromNewsletter;

  // CATEGORÍAS
  static getAllCategories = CategoryService.getAllCategories;
  static createCategory = CategoryService.createCategory;
  static updateCategory = CategoryService.updateCategory;
  static getCategoryById = CategoryService.getCategoryById;
  static getCategoryBySlug = CategoryService.getCategoryBySlug;
  static deleteCategory = CategoryService.deleteCategory;

  // PRODUCTOS
  static getAllProducts = ProductService.getAllProducts;
  static getResumeProducts = ProductService.getResumeProducts;
  static getAllProductsByCategory = ProductService.getAllProductsByCategory;
  static countProductsByCategory = ProductService.countProductsByCategory;
  static countProducts = ProductService.countProducts;
  static getProductById = ProductService.getProductById;
  static getProductBySlug = ProductService.getProductBySlug;
  static getProductBySku = ProductService.getProductBySku;
  static createProduct = ProductService.createProduct;
  static updateProduct = ProductService.updateProduct;
  static deleteProduct = ProductService.deleteProduct;
  static getProductImages = ProductService.getProductImages;
  static getProductImageIds = ProductService.getProductImageIds;
  static setProductImages = ProductService.setProductImages;
  static getProductCategories = ProductService.getProductCategories;
  static getProductCategoryIds = ProductService.getProductCategoryIds;
  static setProductCategories = ProductService.setProductCategories;
  static getProductRelatedProducts = ProductService.getProductRelatedProducts;
  static setProductRelatedProducts = ProductService.setProductRelatedProducts;

  // IMÁGENES
  static getAllImages = ImageService.getAllImages;
  static createImage = ImageService.createImage;
  static updateImage = ImageService.updateImage;
  static deleteImage = ImageService.deleteImage;
  static getImageById = ImageService.getImageById;

  // CONFIGURACIONES
  static getAllSettings = SettingService.getAllSettings;
  static getSetting = SettingService.getSetting;
  static setSetting = SettingService.setSetting;

  // CONTACTO
  static createContact = ContactService.createContact;
  static getAllContacts = ContactService.getAllContacts;
  static getContactById = ContactService.getContactById;
  static markContactAsRead = ContactService.markContactAsRead;
  static deleteContact = ContactService.deleteContact;

  // CUSTOMERS
  static getCustomerByEmail = CustomerService.getCustomerByEmail;
  static createCustomer = CustomerService.createCustomer;
  static getOrCreateCustomer = CustomerService.getOrCreateCustomer;
  static getAllCustomers = CustomerService.getAllCustomers;
  static getCustomerById = CustomerService.getCustomerById;
  static updateCustomer = CustomerService.updateCustomer;
  static deleteCustomer = CustomerService.deleteCustomer;
  static countBudgetsByCustomer = CustomerService.countBudgetsByCustomer;

  // RESPONSABLES
  static getAllResponsibles = ResponsibleService.getAllResponsibles;
  static getResponsibleById = ResponsibleService.getResponsibleById;
  static getResponsibleByCuit = ResponsibleService.getResponsibleByCuit;
  static createResponsible = ResponsibleService.createResponsible;
  static updateResponsible = ResponsibleService.updateResponsible;
  static deleteResponsible = ResponsibleService.deleteResponsible;
  static countBudgetsByResponsible =
    ResponsibleService.countBudgetsByResponsible;
  static getResponsiblesWithBudgetCount =
    ResponsibleService.getResponsiblesWithBudgetCount;

  // PEDIDOS
  static getAllOrders = OrderService.getAllOrders;
  static getOrderById = OrderService.getOrderById;
  static deleteOrder = OrderService.deleteOrder;
  static createOrder = OrderService.createOrder;
  static updateOrder = OrderService.updateOrder;
  static updateOrderStatus = OrderService.updateOrderStatus;
}
