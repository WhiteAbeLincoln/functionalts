import {
  getProductMonoid, monoidAll, monoidAny,
  getRecordMonoid, monoidString, getFunctionMonoid,
  isMonoid, dispatchMonoid, monoidSum
} from '../Monoid'
import * as fc from 'fast-check'
import * as Monoid from './Monoid.helper'
import * as Semi from '../Semigroup'
import * as Util from '../../util/util'
import * as HKT from '../HKT'

describe('Monoid', () => {
  describe('getProductMonoid', () => {
    it('returns a monoid that is the product of multiple monoids (a tuple of monoids)', () => {
      const product = getProductMonoid(monoidAll, monoidAny)
      // verifies the behavior is consistent with all and any
      expect(
        product.concat(product.concat([false, false], [true, true]), product.empty)
      ).toEqual(
        [false, true]
      )
      // verifies result is actually a monoid
      Monoid.LeftIdentity(product, fc.tuple(fc.boolean(), fc.boolean()))
      Monoid.RightIdentity(product, fc.tuple(fc.boolean(), fc.boolean()))
    })
  })
  it('getRecordMonoid', () => {
    const M = getRecordMonoid({ x: monoidString, y: monoidAll })
    // verifies the behavior is consistent with mString and mAll
    expect(
      M.concat({ x: 'hi', y: true }, M.empty)
    ).toEqual(
      { x: 'hi', y: true }
    )
    expect(
      M.concat({ x: 'hello', y: true }, { x: ' there', y: false })
    ).toEqual(
      { x: 'hello there', y: false }
    )
    // verifies result is actually a monoid
    const objArb = fc.record({ x: fc.string(), y: fc.boolean() })
    Monoid.LeftIdentity(M, objArb)
    Monoid.RightIdentity(M, objArb)
  })
  it('getFunctionMonoid', () => {
    // see also https://github.com/gcanti/fp-ts/blob/e31a386c834934862db68f69b0d6039ba12d8b0c/test/Monoid.ts#L26
    const getPredMonoidAll = getFunctionMonoid(monoidAll)
    const getPredMonoidAny = getFunctionMonoid(monoidAny)
    const numberPredicateAny = getPredMonoidAny<number>()
    const numberPredicateAll = getPredMonoidAll<number>()

    const integer = (x: number) => x % 1 === 0
    const positive = (x: number) => x > 0

    // we test expected behavior and Right Identity
    const positiveInteger = numberPredicateAll.concat(
      numberPredicateAll.concat(positive, integer),
      numberPredicateAll.empty
    )

    // we test expected behavior and Left Identity
    const positiveOrInteger = numberPredicateAny.concat(
      numberPredicateAny.empty,
      numberPredicateAny.concat(positive, integer)
    )

    expect(positiveInteger(5)).toBe(true)
    expect(positiveInteger(-5)).toBe(false)
    expect(positiveInteger(5.1)).toBe(false)
    expect(positiveInteger(-5.1)).toBe(false)

    expect(positiveOrInteger(5)).toBe(true)
    expect(positiveOrInteger(-5)).toBe(true)
    expect(positiveOrInteger(5.1)).toBe(true)
    expect(positiveOrInteger(-5.1)).toBe(false)
  })
  describe('isMonoid', () => {
    it('tests whether a value is a semigroup and contains a key "empty"', () => {
      const isSemigroupSpy = jest.spyOn(Semi, 'isSemigroup')
      isSemigroupSpy.mockReturnValue(true)

      const monoid = { empty: 0 }
      expect(isMonoid(monoid)).toBe(true)
      expect(isSemigroupSpy).toHaveBeenCalledWith(monoid)
    })
  })
  describe('dispatchMonoid', () => {
    it('returns some default monoids if the given value is a string, number, or boolean', () => {
      expect(dispatchMonoid('hi')).toBe(monoidString)
      expect(dispatchMonoid(1)).toBe(monoidSum)
      expect(dispatchMonoid(true)).toBe(monoidAll)
    })
    it('returns the result of getTypeclass if the given value is an HKT', () => {
      const getTypeclass = jest.spyOn(Util, 'getTypeclass')
      const isHKT = jest.spyOn(HKT, 'isHKT')
      isHKT.mockReturnValue(true)

      const innerFn = jest.fn()

      // getTypeclass is supposed to return a function which takes the value
      getTypeclass.mockImplementation(() => innerFn)

      const val = { HKT: true } as any
      dispatchMonoid(val)
      expect(getTypeclass).toHaveBeenCalledWith(isMonoid, 'Monoid')
      expect(innerFn).toHaveBeenCalledWith(val)
    })
    it('throws if a value is not a HKT or one of the defaults', () => {
      expect(() => dispatchMonoid({ notAHKT: true } as any)).toThrow('not registered')
    })
  })
})
