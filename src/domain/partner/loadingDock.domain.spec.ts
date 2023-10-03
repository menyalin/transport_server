import { LoadingDock, ILoadingDockProps } from './loadingDock.domain'

describe('LoadingDock domain', () => {
  it('Should create valid instance', () => {
    const validProps: ILoadingDockProps = {
      title: '1',
      address: '1',
    }
    const dock = new LoadingDock(validProps)
    expect(dock).toBeInstanceOf(LoadingDock)
  })
})
