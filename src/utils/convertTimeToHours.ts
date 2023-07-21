export function convertTimeToHours(timeStr: string): number {
  let [time, period] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error('Invalid time string')
  }

  if (period) {
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12
    }

    if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0
    }
  }

  return hours + minutes / 60
}
