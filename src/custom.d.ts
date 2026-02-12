import type { Request as BaseRequest } from 'express'

declare module 'express' {
  interface Request extends Omit<BaseRequest, 'params'> {
    userId?: string
    companyId?: string
    params: Record<string, string>
  }
}
