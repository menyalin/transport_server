import z from 'zod'

export class ListQueryPropsDto {
  company: string
  limit: number
  skip: number
  sortBy: string[]
  sortDesc: boolean[]
  agreements: string[]
  searchStr: string

  constructor(p: any) {
    const validatedProps = ListQueryPropsDto.validationSchema.parse(p)
    this.agreements = validatedProps.agreements
    this.searchStr = validatedProps.searchStr
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
    searchStr: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v ?? ''),
    agreements: z
      .array(z.string())
      .optional()
      .nullable()
      .transform((v) => v ?? []),
  })
}
