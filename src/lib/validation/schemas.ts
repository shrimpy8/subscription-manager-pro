import { z } from 'zod'

export const subscriptionCreateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.union([
    z.literal('AI Tools'),
    z.literal('SaaS'),
    z.literal('Entertainment'),
    z.literal('Productivity'),
    z.literal('Utilities'),
    z.literal('Newsletter'),
    z.literal('Streaming Service'),
    z.literal('Online Learning'),
    z.literal('Magazine'),
    z.literal('Cloud Provider'),
    z.literal('Development Tools'),
    z.literal('Design Tools'),
    z.literal('Communication'),
    z.literal('Security'),
    z.literal('Other'),
  ]),
  subcategory: z.string().optional().default(''),
  plan: z.string().optional().default(''),
  cost: z.number().min(0).max(1000000).default(0),
  currency: z.string().min(1).default('USD'),
  billing_cycle: z.enum(['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free']).default('Monthly'),
  status: z.enum(['active', 'paused', 'canceled']).default('active'),
  start_date: z.union([z.string(), z.number(), z.date()]).optional(),
  renewal_date: z.union([z.string(), z.number(), z.date()]).optional(),
  url: z.string().url().optional(),
  description: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  account_email: z.string().email().optional().default(''),
  auto_renew: z.boolean().optional().default(true),
  usage_frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']).default('monthly'),
  usage_importance: z.enum(['high', 'medium', 'low']).default('medium'),
  logo: z.string().optional().default(''),
})

export const subscriptionsBulkSchema = z.object({
  subscriptions: z.array(subscriptionCreateSchema.extend({ id: z.string().min(1) })).nonempty()
})


