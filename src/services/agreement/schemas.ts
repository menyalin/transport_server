import z from 'zod'
import { objectIdSchema } from '@/shared/validationSchemes'

export const getAgreementsForClientPropsSchema = z
  .object({
    company: z.string(),
    client: z.string().optional(),
    clients: z.array(z.string()).optional(),
    date: z.string().transform((v) => new Date(v)),
    currentAgreementId: objectIdSchema.optional(),
  })
  .refine((data) => data.client !== undefined || data.clients !== undefined, {
    message: 'Поле client или clients должно быть заполнено',
    path: ['client'],
  })

export type GetAgreementsForClientProps = z.infer<
  typeof getAgreementsForClientPropsSchema
>
