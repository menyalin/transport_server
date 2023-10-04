import { PARTNER_GROUPS_ENUM } from '../../constants/partner'
import { LoadingDock } from './loadingDock.domain'
import { Partner as PartnerDomain, IParterProps } from './partner.domain'

describe('Partner domain', () => {
  const loadingDoc = new LoadingDock({
    title: '1',
    address: '1',
  })

  it('Should create valid instance', () => {
    const validProps: IParterProps = {
      company: '1',
      name: '1',
      fullName: '1',
      group: PARTNER_GROUPS_ENUM.fts,
      placesForTransferDocs: [loadingDoc],
    }

    const partner = new PartnerDomain(validProps)
    expect(partner).toBeInstanceOf(PartnerDomain)
  })
})
