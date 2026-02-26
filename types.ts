
export enum AppScreen {
  Dashboard = 'dashboard',
  Suppliers = 'suppliers',
  Buyers = 'buyers',
  Orders = 'orders',
  Reports = 'reports',
  Login = 'login',
  Profile = 'profile',
  Agents = 'agents'
}

export enum AppSection {
  Overview = 'overview',
  Backend = 'backend',
  Database = 'database',
  API = 'api',
  Flutter = 'flutter',
  Security = 'security'
}

export type Role = 'ADMIN' | 'AGENT' | 'SUPPLIER' | 'PARTNER';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  username: string;
  name?: string;
  role: Role;
  email: string;
  phoneNumber?: string;
  country?: string;
  region?: string;
  status?: AccountStatus;
  password?: string; // For creation/editing
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DatabaseField {
  name: string;
  type: string;
  constraints?: string;
  description: string;
}

export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
}

export interface Endpoint {
  method: string;
  path: string;
  role: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string; // Alias for companyName
  companyName: string;
  personalName?: string;
  designation?: string;
  mobile?: string; // Alias for mobileNumber
  mobileNumber?: string;
  telephoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  website?: string;
  category?: string; // Alias for businessCategory
  businessCategory?: string;
  iecCode?: string;
  gstNumber?: string;
  panNumber?: string;
  turnover?: string; // Alias for turnover2y
  turnover2y?: string;
  associatePartner?: string; // Username of the partner
  brochureFile?: string;
  paymentScreenshot?: string;
  status?: AccountStatus;
  createdAt?: string;
  products?: any[];
}

export interface Buyer {
  id: number;
  name: string;
  companyName: string;
  designation: string;
  mobileNumber: string;
  country: string;
  businessActivities: string;
  productNeed: string;
  email: string;
  website: string;
  turnover?: string; // Alias for turnover2y
  turnover2y: string;
  destinationPort: string;
  productSpecs: string;
  requiredQuantity: string;
  targetPrice?: string;
  preferredIncoterms: string;
  paymentTerms: string;
  deliveryTimeline: string;
  mandatoryCertifications?: string;
  createdBy: number;
  assignedAgent?: number;    // ID or Username of the assigned agent
  createdAt?: string;
}

export type OrderStatus =
  | 'QUOTATION_SENT'
  | 'QUOTATION_APPROVED'
  | 'POST_QUOTATION_FOLLOW_UPS'
  | 'ORDER_CONFIRMED'
  | 'MOU_SIGN'
  | 'FOLLOW_UPS'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_TERMS'
  | 'PAYMENT_RECEIVED'
  | 'COMMISSION_RECEIVED'
  | 'ORDER_COMPLETED';

export interface Order {
  id: number;
  readableId?: string;
  supplier: number; // Supplier ID
  buyer: number;    // Buyer ID
  agent?: number;   // Agent ID
  region?: string;
  product?: string;
  supplierName?: string;
  buyerName?: string;
  productName: string;
  quantity: string;
  amount: string;     // In INR
  commission: string; // In INR
  commissionAmount?: string;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  createdBy: number;
  assignedAgent?: number; // ID or Username of the assigned agent
  createdAt?: string;
  agentName?: string;
}
