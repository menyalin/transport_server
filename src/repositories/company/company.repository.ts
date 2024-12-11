import { Company as CompanyModel } from '@/models'

interface IProps {
  model: typeof CompanyModel
}
class CompanyRepository {
  model: typeof CompanyModel
  constructor({ model }: IProps) {
    this.model = model
  }

  async getCompanySettings(companyId: string): Promise<any> {
    const company = await this.model.findById(companyId).lean()
    return company?.settings
  }
}

export default new CompanyRepository({ model: CompanyModel })
