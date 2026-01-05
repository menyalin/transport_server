import { Partner } from './partner.domain'
import { Types } from 'mongoose'

describe('Partner.allowedAgreementsOnDate', () => {
  const companyId = new Types.ObjectId()

  const createPartner = (agreements: any[]) => {
    return new Partner({
      _id: new Types.ObjectId(),
      name: 'Test Partner',
      company: companyId,
      agreements,
    })
  }

  test('должен вернуть пустой массив, если у партнера нет соглашений', () => {
    const partner = createPartner([])
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([])
  })

  test('должен вернуть пустой массив, если agreements не задан', () => {
    const partner = new Partner({
      _id: new Types.ObjectId(),
      name: 'Test Partner',
      company: companyId,
    })
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([])
  })

  test('должен вернуть соглашение, если дата попадает в диапазон действия', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    ])
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([agreementId.toString()])
  })

  test('должен вернуть соглашение, если дата равна startDate', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-12-31'),
      },
    ])
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([agreementId.toString()])
  })

  test('должен вернуть соглашение, если дата равна endDate', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-15'),
      },
    ])
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([agreementId.toString()])
  })

  test('не должен вернуть соглашение, если дата раньше startDate', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-12-31'),
      },
    ])
    const date = new Date('2024-06-14')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([])
  })

  test('не должен вернуть соглашение, если дата позже endDate', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-15'),
      },
    ])
    const date = new Date('2024-06-16')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([])
  })

  test('должен вернуть бессрочное соглашение (без endDate), если дата не раньше startDate', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
    ])
    const date = new Date('2024-06-15')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([agreementId.toString()])
  })

  test('должен вернуть бессрочное соглашение (без endDate) для даты в будущем', () => {
    const agreementId = new Types.ObjectId()
    const partner = createPartner([
      {
        agreement: agreementId,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
    ])
    const date = new Date('2030-01-01')

    expect(partner.allowedAgreementsOnDate(date)).toEqual([agreementId.toString()])
  })

  test('должен вернуть несколько соглашений, действующих на дату', () => {
    const agreementId1 = new Types.ObjectId()
    const agreementId2 = new Types.ObjectId()
    const agreementId3 = new Types.ObjectId()

    const partner = createPartner([
      {
        agreement: agreementId1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        agreement: agreementId2,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        agreement: agreementId3,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-05-31'),
      },
    ])
    const date = new Date('2024-06-15')

    const result = partner.allowedAgreementsOnDate(date)
    expect(result).toHaveLength(2)
    expect(result).toContain(agreementId1.toString())
    expect(result).toContain(agreementId2.toString())
    expect(result).not.toContain(agreementId3.toString())
  })

  test('должен фильтровать соглашения с разными датами действия', () => {
    const agreementId1 = new Types.ObjectId()
    const agreementId2 = new Types.ObjectId()
    const agreementId3 = new Types.ObjectId()
    const agreementId4 = new Types.ObjectId()

    const partner = createPartner([
      {
        agreement: agreementId1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        agreement: agreementId2,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
      {
        agreement: agreementId3,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
      {
        agreement: agreementId4,
        startDate: new Date('2024-06-01'),
        endDate: null,
      },
    ])
    const date = new Date('2024-06-15')

    const result = partner.allowedAgreementsOnDate(date)
    expect(result).toHaveLength(2)
    expect(result).toContain(agreementId1.toString())
    expect(result).toContain(agreementId4.toString())
  })
})
