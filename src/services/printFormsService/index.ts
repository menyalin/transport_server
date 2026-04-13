/**
 * Сервис для генерации PDF документов через удаленное API
 */
class PrintFormsService {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = process.env.PDF_API_URL || ''
    if (!this.apiBaseUrl) {
      throw new Error('PDF_API_URL is not defined in environment variables')
    }
  }

  /**
   * Генерирует PDF документ на основе шаблона и данных
   * @param templateName - Имя шаблона (например: 'tn')
   * @param data - Данные для заполнения шаблона
   * @returns Promise<Buffer> - PDF документ в виде Buffer
   */
  async generatePdf<T = Record<string, unknown>>(
    templateName: string,
    data: T
  ): Promise<Buffer> {
    try {
      const url = `${this.apiBaseUrl}/${templateName}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Сначала пробуем распарсить JSON, если не получится — берем текст
        let errorMessage = 'Failed to generate PDF'
        try {
          const text = await response.text()
          // Проверяем, если это HTML — значит API недоступен
          if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            errorMessage = `PDF API not available at ${url} (received HTML response)`
            console.error(`PrintFormsService: ${errorMessage}`)
          } else {
            // Пробуем распарсить как JSON
            const errorData = JSON.parse(text) as {
              error?: string
              message?: string
              stack?: string
            }
            errorMessage = errorData.message || errorData.error || errorMessage
          }
        } catch {
          errorMessage = `PDF API returned status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (e) {
      console.error('PrintFormsService: generatePdf error', e)
      throw e
    }
  }
}

export default new PrintFormsService()
