import { BadRequestError } from '../../helpers/errors.js'
const STATUSES = ['weRefused', 'clientRefused', 'notСonfirmedByClient']

const checkOrder = (orderBody) => {
  // Проверка наличия комментария в зависимости от статуса рейса
  if (STATUSES.includes(orderBody?.state?.status) && !orderBody.note)
    throw new BadRequestError(
      'Сохранение не возможно. Необходимо заполнить примечание',
    )
  return null
}

export default checkOrder
