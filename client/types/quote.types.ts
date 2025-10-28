/**
 * Tipos relacionados con cotizaciones
 */

export interface Quote {
  id: string
  quoteNumber: string
  leadId: string
  leadName: string
  projectId: string
  projectName: string
  unitType?: string
  unitNumber?: string
  basePrice: number
  discount?: number
  discountType?: DiscountType
  finalPrice: number
  currency: Currency
  paymentPlan?: PaymentPlan
  status: QuoteStatus
  validUntil: Date
  notes?: string
  items?: QuoteItem[]
  createdBy: string
  createdAt: Date
  updatedAt?: Date
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

// Currency exportado desde project.types.ts
import type { Currency } from './project.types'
export type { Currency }

export interface PaymentPlan {
  type: PaymentPlanType
  initialPayment: number
  installments?: number
  installmentAmount?: number
  description?: string
}

export enum PaymentPlanType {
  CASH = 'cash',
  FINANCED = 'financed',
  CUSTOM = 'custom'
}

export interface QuoteFormData {
  leadId: string
  projectId: string
  unitType?: string
  unitNumber?: string
  basePrice: number
  discount?: number
  discountType?: DiscountType
  currency: Currency
  paymentPlan?: PaymentPlan
  validUntil: Date
  notes?: string
  items?: Omit<QuoteItem, 'id'>[]
}

export interface QuoteFilters {
  search?: string
  status?: QuoteStatus
  projectId?: string
  leadId?: string
  dateFrom?: Date
  dateTo?: Date
  priceMin?: number
  priceMax?: number
}

export interface QuoteStats {
  total: number
  byStatus: Record<QuoteStatus, number>
  totalValue: number
  averageValue: number
  conversionRate: number
}

export type QuoteSortField = 'quoteNumber' | 'finalPrice' | 'createdAt' | 'validUntil'
