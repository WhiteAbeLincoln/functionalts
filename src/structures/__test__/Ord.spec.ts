import * as Ord from '../Ord'
import * as Setoid from '../Setoid'
import * as OrdLaws from './Ord.helper'
import * as Util from '../../util/util'
import * as HKT from '../HKT'
import * as fc from 'fast-check'
import { tuple } from '../../util/functional'

describe('Ord', () => {
  describe('isOrd', () => {
    it('tests whether a value is a Setoid and has a "compare" function', () => {
      const isSetoid = jest.spyOn(Setoid, 'isSetoid')
      isSetoid.mockReturnValue(true)
      const ord = { compare: (x: any) => x }
      expect(Ord.isOrd(ord)).toBe(true)
      expect(Ord.isOrd({})).toBe(false)
    })
  })
  describe('dispatchOrd', () => {
    it('returns defaults given string, number, or boolean', () => {
      expect(Ord.dispatchOrd(1)).toEqual(Ord.ordString)
      expect(Ord.dispatchOrd('')).toEqual(Ord.ordNumber)
      expect(Ord.dispatchOrd(true)).toEqual(Ord.ordBoolean)
    })
    it('returns the result of getTypeclass if the given value is an HKT', () => {
      const getTypeclass = jest.spyOn(Util, 'getTypeclass')
      const isHKT = jest.spyOn(HKT, 'isHKT')
      isHKT.mockReturnValue(true)

      const innerFn = jest.fn()

      // getTypeclass is supposed to return a function which takes the value
      getTypeclass.mockImplementation(() => innerFn)

      const val = { HKT: true } as any
      Ord.dispatchOrd(val)
      expect(getTypeclass).toHaveBeenCalledWith(Ord.isOrd, 'Ord')
      expect(innerFn).toHaveBeenCalledWith(val)
    })
    it('throws if a value is not a HKT or one of the defaults', () => {
      expect(() => Ord.dispatchOrd({ notAHKT: true } as any)).toThrow('not registered')
    })
  })
  it('getProductOrd', () => {
    const O = Ord.getProductOrd(Ord.ordString, Ord.ordBoolean, Ord.ordNumber)

    // verify expected behavior
    expect(O.compare(['a', true, 5], ['a', true, 5])).toBe(0)
    expect(O.compare(['a', true, 5], ['a', true, 6])).toBe(-1)
    expect(O.compare(['ab', true, 8], ['a', true, 6])).toBe(1)

    // verify laws
    OrdLaws.Antisymmetry(O, [fc.tuple(fc.string(), fc.boolean(), fc.integer())])
    OrdLaws.Reflexivity(O, fc.tuple(fc.string(), fc.boolean(), fc.integer()))
    OrdLaws.Transitivity(O, [fc.tuple(fc.string(), fc.boolean(), fc.integer())])
  })
  it('getDualOrd', () => {
    const O = Ord.getDualOrd(Ord.ordBoolean)

    expect(O.compare(true, false)).toBe(-1) // normally 1
    expect(O.compare(false, true)).toBe(1) // normally -1
    expect(O.compare(true, true)).toBe(0)
    expect(O.compare(false, false)).toBe(0)

    OrdLaws.Antisymmetry(O, [fc.boolean()])
    OrdLaws.Reflexivity(O, fc.boolean())
    OrdLaws.Transitivity(O, [fc.boolean()])
  })
  describe('compare', () => {
    it('returns a function given a ord typerep', () => {
      const O = { compare: jest.fn(), equals: jest.fn() }
      const compareO = Ord.compare(O)
      expect(typeof compareO).toBe('function')
      compareO(1, 2)
      expect(O.compare).toHaveBeenCalledWith(1, 2)
    })
    it('calls dispatch and uses that compare given a value', () => {
      const comp = jest.fn()
      const dispatchSpy = jest.spyOn(Ord, 'dispatchOrd')
      dispatchSpy.mockReturnValue({ compare: comp })
      Ord.compare(1, 2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(comp).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('compareC', () => {
    it('is a curried compare that calls dispatchOrd', () => {
      const comp = jest.fn()
      const dispatchSpy = jest.spyOn(Ord, 'dispatchOrd')
      dispatchSpy.mockReturnValue({ compare: comp })
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      Ord.compareC(1 as number)(2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(comp).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('compareC1', () => {
    it('is a curried compare that takes a typerep', () => {
      const comp = jest.fn()
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      Ord.compareC1({compare: comp, equals: jest.fn() })(1)(2)
      expect(comp).toHaveBeenCalledWith(1, 2)
    })
  })
  it('min', () => {
    // returns the minimum
    const min = Ord.min(Ord.ordNumber)
    fc.assert(fc.property(fc.tuple(fc.integer(-1), fc.nat()), ([a, b]) => {
      expect(min(a, b)).toBe(a)
    }))
    // returns the first if equal
    const Oprod = Ord.getProductOrd(Ord.ordNumber, Ord.ordNumber)
    const min2 = Ord.min(Oprod)
    const first = tuple(1, 2)
    const second = tuple(1, 2)
    expect(min2(first, second)).toBe(first)
  })
  it('max', () => {
    // returns the maximum
    const max = Ord.max(Ord.ordNumber)
    fc.assert(fc.property(fc.tuple(fc.integer(-1), fc.nat()), ([a, b]) => {
      expect(max(a, b)).toBe(b)
    }))
    // returns the first if equal
    const Oprod = Ord.getProductOrd(Ord.ordNumber, Ord.ordNumber)
    const max2 = Ord.max(Oprod)
    const first = tuple(1, 2)
    const second = tuple(1, 2)
    expect(max2(first, second)).toBe(first)
  })
  it('clamp', () => {
    const clamp = Ord.clamp(Ord.ordNumber)
    const clamp0_5 = clamp(0, 5)
    fc.assert(fc.property(fc.integer(), x => {
      expect(clamp0_5(x)).toBe(x > 5 ? 5 : x < 0 ? 0 : x)
    }))
  })
  it('between', () => {
    const between = Ord.between(Ord.ordNumber)
    const between0_5 = between(0, 5)
    fc.assert(fc.property(fc.integer(), x => {
      expect(between0_5(x)).toBe(x >= 0 && x <= 5)
    }))
  })
  it('getOrdStringLocale', () => {
    // example taken from MDN String.prototype.localeCompare
    const a = 'réservé' // with accents, lowercase
    const b = 'RESERVE' // no accents, uppercase
    const comp1 = Ord.getOrdStringLocale()
    const comp2 = Ord.getOrdStringLocale('en', {sensitivity: 'base'})

    expect(comp1.compare(a, b)).toEqual(1) // expected output: 1
    expect(comp2.compare(a, b)).toEqual(0) // expected output: 0
  })
  it('getOrdStringCollator', () => {
    // example taken from MDN Intl.Collator.prototype.compare
    // this test is not working as of node 11.1.0
    // function firstAlphabetical(locale: string, letter1: string, letter2: string) {
    //   if (new Intl.Collator(locale).compare(letter1, letter2) > 0) {
    //     return letter1
    //   }
    //   return letter2
    // }

    // expect(firstAlphabetical('de', 'z', 'ä')).toEqual('z')
    // // expected output: "z"

    // expect(firstAlphabetical('sv', 'z', 'ä')).toEqual('ä')
    // expected output: "ä"

    const a = ['Congrès', 'congres', 'Assemblée', 'poisson']
    const collator = new Intl.Collator('fr', { usage: 'search', sensitivity: 'base' })
    const comp = Ord.getOrdStringCollator(collator)
    // equality function that will use the collator to determine if a string is equal to 'congres'
    const eq = Setoid.equalsC1(comp)('congres')
    expect(a.filter(eq)).toEqual(['Congrès', 'congres'])
    // → "Congrès, congres"
  })
})
