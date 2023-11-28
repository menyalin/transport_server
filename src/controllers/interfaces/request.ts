import { Request } from 'express'
import * as core from 'express-serve-static-core'

export interface AuthorizedRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId: string
  companyId: string
}
