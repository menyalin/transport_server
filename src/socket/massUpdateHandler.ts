import { Server, Socket } from 'socket.io'
import { PermissionService, MassUpdateService } from '@/services'
import { GetDocsCountProps } from '@/classes/getOrdersCountHandlerProps'
import { emitTo } from '.'

const isAcceptedUser = async (userId: string): Promise<boolean> => {
  if (!userId) return false
  const isAdmin = await PermissionService.isAdmin(userId)
  return Boolean(isAdmin)
}

const getOrdersProcessingState = (key: string) => {
  const state = MassUpdateService.ordersProcessingState()
  emitTo('admin_room', 'mass_update_orders:order_processing_state', {
    data: state,
    key,
  })
}

const cancelOrdersProcessingHandler = async (): Promise<void> => {
  await MassUpdateService.cancelProcessing()
}

const getOrdersCountHandler = async (data: object, userId: string) => {
  if (!(await isAcceptedUser(userId))) return

  const parsedProps = new GetDocsCountProps(data)

  const ordersCount: number =
    await MassUpdateService.getOrdersCount(parsedProps)

  emitTo('admin_room', 'mass_update_orders:orders_count', {
    count: ordersCount,
    key: parsedProps.key,
  })
}

const runOrdersProcessing = async (data: object, userId: string) => {
  if (!(await isAcceptedUser(userId))) return
  const parsedProps = new GetDocsCountProps(data)
  try {
    await MassUpdateService.startOrderProcessing(parsedProps)
  } catch (e) {
    emitTo('admin_room', 'mass_update_orders:processing_error', e)
    await MassUpdateService.cancelProcessing()
  }
}

export const massUpdateHandler = (io: Server, socket: Socket) => {
  const userId = socket.handshake.auth.userId

  socket.on('mass_update_orders:get_orders_count', (data) =>
    getOrdersCountHandler(data, userId)
  )

  socket.on('mass_update_orders:run_orders_processing', (data) =>
    runOrdersProcessing(data, userId)
  )

  socket.on(
    'mass_update_orders:cancel_orders_processing',
    cancelOrdersProcessingHandler
  )

  socket.on(
    'mass_update_orders:get_orders_processing_state',
    getOrdersProcessingState
  )
}
