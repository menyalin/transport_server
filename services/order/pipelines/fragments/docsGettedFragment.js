import { BadRequestError } from '../../../../helpers/errors.js'

export const getDocsGettedFragmentBuilder = (docsGetted) => {
  switch (docsGetted) {
    case 'yes':
      return {
        $eq: ['$docsState.getted', true],
      }
    case 'no':
      return {
        $ne: ['$docsState.getted', true],
      }
    default:
      throw new BadRequestError(
        'getDocsGettedFragmentBuilder: unexpected docsGetted string'
      )
  }
}
