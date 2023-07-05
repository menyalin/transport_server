// @ts-nocheck
import { TRUCK_KINDS } from '../../../../constants/truck.js'

export default function (kind) {
  return {
    $switch: {
      branches: [
        ...TRUCK_KINDS.map((i) => ({
          case: { $eq: [kind, i.value] },
          then: i.text,
        })),
      ],
      default: 'не определен',
    },
  }
}
