import { LoadingDock } from '../loadingDock.domain'

export const setLoadingDocs = (
  loadingDocks: Array<LoadingDock> | undefined
): Array<LoadingDock> => {
  if (!loadingDocks || !Array.isArray(loadingDocks)) return []
  if (loadingDocks.every((i) => i instanceof LoadingDock)) return loadingDocks
  return loadingDocks.map((i) => new LoadingDock(i))
}
