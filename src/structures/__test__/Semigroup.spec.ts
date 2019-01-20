import {
  getProductSemigroup, semigroupAll, semigroupAny,
  getRecordSemigroup, semigroupString, getFunctionSemigroup,
  getDualSemigroup, getFirstSemigroup, isSemigroup,
  dispatchSemigroup, semigroupSum, getLastSemigroup,
  concat, concatC, concatC1, semigroupOrdering
} from '../Semigroup'
import * as Semigroup from '../Semigroup'
import * as Util from '../../util/util'
import * as HKT from '../HKT'
import * as Semi from './Semigroup.helper'
import * as fc from 'fast-check'

describe('Semigroup', () => {
  it('semigroupOrdering', () => {
    expect(semigroupOrdering.concat(-1, -1)).toBe(-1)
    expect(semigroupOrdering.concat(-1, 0)).toBe(-1)
    expect(semigroupOrdering.concat(-1, 1)).toBe(-1)
    expect(semigroupOrdering.concat(0, -1)).toBe(-1)
    expect(semigroupOrdering.concat(0, 0)).toBe(0)
    expect(semigroupOrdering.concat(0, 1)).toBe(1)
    expect(semigroupOrdering.concat(1, -1)).toBe(1)
    expect(semigroupOrdering.concat(1, 0)).toBe(1)
    expect(semigroupOrdering.concat(1, 1)).toBe(1)
  })
  describe('getProductSemigroup', () => {
    it('returns a semigroup that is the product of multiple semigroups (a tuple of semigroups)', () => {
      const product = getProductSemigroup(semigroupAll, semigroupAny)
      // verify expected behavior
      expect(
        product.concat([false, false], [true, true])
      ).toEqual(
        [false, true]
      )

      // verify laws
      Semi.Assoiciativity(product, fc.tuple(fc.boolean(), fc.boolean()))
    })
  })
  it('getRecordSemigroup', () => {
    const S = getRecordSemigroup({ x: semigroupString, y: semigroupAll })
    // verify expected behavior
    expect(
      S.concat({ x: 'hello', y: true }, { x: ' there', y: false })
    ).toEqual(
      { x: 'hello there', y: false }
    )
    // verify laws
    Semi.Assoiciativity(S, fc.record({ x: fc.string(), y: fc.boolean() }))
  })
  it('getFunctionSemigroup', () => {
    // see also https://github.com/gcanti/fp-ts/blob/e31a386c834934862db68f69b0d6039ba12d8b0c/test/Monoid.ts#L26
    const getPredSemigroupAll = getFunctionSemigroup(semigroupAll)
    const getPredSemigroupAny = getFunctionSemigroup(semigroupAny)
    const numberPredicateAny = getPredSemigroupAny<number>()
    const numberPredicateAll = getPredSemigroupAll<number>()

    const integer = (x: number) => x % 1 === 0
    const positive = (x: number) => x > 0

    const positiveInteger =
      numberPredicateAll.concat(positive, integer)

    const positiveOrInteger =
      numberPredicateAny.concat(positive, integer)

    expect(positiveInteger(5)).toBe(true)
    expect(positiveInteger(-5)).toBe(false)
    expect(positiveInteger(5.1)).toBe(false)
    expect(positiveInteger(-5.1)).toBe(false)

    expect(positiveOrInteger(5)).toBe(true)
    expect(positiveOrInteger(-5)).toBe(true)
    expect(positiveOrInteger(5.1)).toBe(true)
    expect(positiveOrInteger(-5.1)).toBe(false)
  })
  describe('getDualSemigroup', () => {
    it('returns a semigroup with the concat function flipped', () => {
      const concat = jest.fn()
      const S = getDualSemigroup({ concat })
      S.concat(1, 2)
      expect(concat).toHaveBeenCalledWith(2, 1)
    })
  })
  describe('getFirstSemigroup', () => {
    it('returns a semigroup that always returns the first parameter given to concat', () => {
      const S = getFirstSemigroup<any>()
      fc.assert(fc.property(fc.tuple(fc.anything(), fc.anything()), ([x, y]) => {
        expect(S.concat(x, y)).toBe(x)
      }))
    })
  })
  describe('getLastSemigroup', () => {
    it('returns a semigroup that always returns the last parameter given to concat', () => {
      const S = getLastSemigroup<any>()
      fc.assert(fc.property(fc.tuple(fc.anything(), fc.anything()), ([x, y]) => {
        // here it doesn't really matter that x and y could have different types
        // since we just return y unchanged
        // ideally there would be a way to have an arbitrary that takes
        // n values from the set of anything where the n values all have the same type
        expect(S.concat(x, y)).toBe(y)
      }))
    })
  })
  describe('isSemigroup', () => {
    it('tests whether a value is an object and has a "concat" function', () => {
      const semi = { concat: (x: any) => x }
      expect(isSemigroup(semi)).toBe(true)
      expect(isSemigroup(1)).toBe(false)
    })
  })
  describe('dispatchSemigroup', () => {
    it('returns some default semigroups if the given value is a string, number, or boolean', () => {
      expect(dispatchSemigroup('hi')).toBe(semigroupString)
      expect(dispatchSemigroup(1)).toBe(semigroupSum)
      expect(dispatchSemigroup(true)).toBe(semigroupAll)
    })
    it('returns the result of getTypeclass if the given value is an HKT', () => {
      const getTypeclass = jest.spyOn(Util, 'getTypeclass')
      const isHKT = jest.spyOn(HKT, 'isHKT')
      isHKT.mockReturnValue(true)

      const innerFn = jest.fn()

      // getTypeclass is supposed to return a function which takes the value
      getTypeclass.mockImplementation(() => innerFn)

      const val = { HKT: true } as any
      dispatchSemigroup(val)
      expect(getTypeclass).toHaveBeenCalledWith(isSemigroup, 'Semigroup')
      expect(innerFn).toHaveBeenCalledWith(val)
    })
    it('throws if a value is not a HKT or one of the defaults', () => {
      expect(() => dispatchSemigroup({ notAHKT: true } as any)).toThrow('not registered')
    })
  })
  describe('concat', () => {
    it('returns a function given a semigroup typerep', () => {
      const S = { concat: jest.fn() }
      const concatS = concat(S)
      expect(typeof concatS).toBe('function')
      concatS(1, 2)
      expect(S.concat).toHaveBeenCalledWith(1, 2)
    })
    it('calls dispatch and uses that concat given a value', () => {
      const conc = jest.fn()
      const dispatchSpy = jest.spyOn(Semigroup, 'dispatchSemigroup')
      dispatchSpy.mockReturnValue({ concat: conc })
      concat(1, 2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(conc).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('concatC', () => {
    it('is a curried concat that calls dispatchSemigroup', () => {
      const conc = jest.fn()
      const dispatchSpy = jest.spyOn(Semigroup, 'dispatchSemigroup')
      dispatchSpy.mockReturnValue({ concat: conc })
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      concatC(1 as number)(2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(conc).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('concatC1', () => {
    it('is a curried concat that takes a typerep', () => {
      const conc = jest.fn()
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      concatC1({concat: conc})(1)(2)
      expect(conc).toHaveBeenCalledWith(1, 2)
    })
  })
})
