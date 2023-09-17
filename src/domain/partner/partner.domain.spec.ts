import { PARTNER_GROUPS_ENUM } from '../../constants/partner'
import { LoadingDock, ILoadingDockProps } from './loadingDock.domain'
import { Partner, IParterProps } from './partner.domain'

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
    const partner = new Partner(validProps)
    expect(partner).toBeInstanceOf(Partner)
  })
})
