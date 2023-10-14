import { IParterProps } from '../../domain/partner/interfaces'
import { Partner } from '../../models/index'
import { emitTo } from '../../socket'
import { ChangeLogService } from '../index'

export interface IConstructorProps {
  model: typeof Partner
  emitter: typeof emitTo
  modelName: string
  logService: typeof ChangeLogService
}

export interface ICreateProps {
  body: IParterProps
  user: string
}
export interface IUpdateOneProps {
  id: string
  body: IParterProps
  user: string
}

export interface IDeleteByIdProps {
  id: string
  user: string
}
