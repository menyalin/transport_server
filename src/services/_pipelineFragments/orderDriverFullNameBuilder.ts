// @ts-nocheck
export const orderDriverFullNameBuilder = () => ({
  $trim: {
    input: {
      $concat: [
        '$driver.surname',
        ' ',
        '$driver.name',
        ' ',
        '$driver.patronymic',
      ],
    },
  },
})
