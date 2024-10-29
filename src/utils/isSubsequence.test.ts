// Импортируем функцию
import { isSubsequence } from './isSubsequence'

describe('isSubsequence', () => {
  test('должен вернуть true, если второй массив является подмассивом первого', () => {
    const mainArr = ['a', 'b', 'c', 'd', 'e']
    const subArr = ['b', 'c', 'd']
    expect(isSubsequence(mainArr, subArr)).toBe(true)
  })

  test('должен вернуть false, если второй массив не является подмассивом первого', () => {
    const mainArr = ['a', 'b', 'c', 'e']
    const subArr = ['b', 'd']
    expect(isSubsequence(mainArr, subArr)).toBe(false)
  })

  test('должен вернуть true, если подмассив состоит из одного элемента, который присутствует в основном массиве', () => {
    const mainArr = ['a', 'b', 'c', 'd', 'e']
    const subArr = ['c']
    expect(isSubsequence(mainArr, subArr)).toBe(true)
  })

  test('должен вернуть false, если подмассив состоит из одного элемента, которого нет в основном массиве', () => {
    const mainArr = ['a', 'b', 'c', 'd', 'e']
    const subArr = ['f']
    expect(isSubsequence(mainArr, subArr)).toBe(false)
  })

  test('должен вернуть false для пустого подмассива', () => {
    const mainArr = ['a', 'b', 'c', 'd', 'e']
    const subArr: string[] = []
    expect(isSubsequence(mainArr, subArr)).toBe(false)
  })

  test('должен вернуть false для пустого основного массива и непустого подмассива', () => {
    const mainArr: string[] = []
    const subArr = ['a']
    expect(isSubsequence(mainArr, subArr)).toBe(false)
  })

  test('должен вернуть true, если подмассив идентичен основному массиву', () => {
    const mainArr = ['a', 'b', 'c']
    const subArr = ['a', 'b', 'c']
    expect(isSubsequence(mainArr, subArr)).toBe(true)
  })

  test('должен вернуть false, если второй массив длиннее первого', () => {
    const mainArr = ['a', 'b']
    const subArr = ['a', 'b', 'c']
    expect(isSubsequence(mainArr, subArr)).toBe(false)
  })
})
