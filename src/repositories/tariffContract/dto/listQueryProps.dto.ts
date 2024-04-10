import z from 'zod'

export class ListQueryPropsDto {
  company: string
  limit: number
  skip: number
  sortBy: string[]
  sortDesc: boolean[]

  constructor(p: any) {
    const validatedProps = ListQueryPropsDto.validationSchema.parse(p)
    this.company = validatedProps.company
    this.limit = +validatedProps.limit
    this.skip = +validatedProps.skip
    this.sortBy = validatedProps.sortBy ?? [] // Предоставляем значение по умолчанию, если не задано
    this.sortDesc = validatedProps.sortDesc?.map((i) => i === 'true') ?? [] // Предоставляем значение по умолчанию, если не задано
  }

  public static validationSchema = z.object({
    company: z.string(),
    limit: z.string(),
    skip: z.string(),
    sortBy: z.array(z.string()).optional(),
    sortDesc: z.array(z.string()).optional(),
  })
}
