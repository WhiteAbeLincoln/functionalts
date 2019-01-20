import * as Setoid from '../Setoid'
import * as SetoidLaws from './Setoid.helper'
import * as Util from '../../util/util'
import * as HKT from '../HKT'
import * as fc from 'fast-check'

describe('Setoid', () => {
  it('getProductSetoid', () => {
    const S = Setoid.getProductSetoid(Setoid.setoidBoolean, Setoid.setoidNumber)
    // test expected behavior
    expect(S.equals([true, 1], [true, 1])).toBe(true)
    expect(S.equals([true, 1], [false, 1])).toBe(false)
    // test laws
    SetoidLaws.Reflexivity(S, fc.tuple(fc.boolean(), fc.integer()))
    SetoidLaws.Symmetry(S, [fc.tuple(fc.boolean(), fc.integer())])
    SetoidLaws.Transitivity(S, [fc.tuple(fc.boolean(), fc.integer())])
  })
  it('getRecordSetoid', () => {
    const S = Setoid.getRecordSetoid({ x: Setoid.setoidBoolean, y: Setoid.setoidNumber })
    // test expected behavior
    expect(S.equals({ x: true, y: 1 }, { x: true, y: 1 })).toBe(true)
    expect(S.equals({ x: true, y: 1 }, { x: false, y: 1 })).toBe(false)
    // test laws
    SetoidLaws.Reflexivity(S, fc.record({ x: fc.boolean(), y: fc.integer()}))
    SetoidLaws.Symmetry(S, [fc.record({ x: fc.boolean(), y: fc.integer()})])
    SetoidLaws.Transitivity(S, [fc.record({ x: fc.boolean(), y: fc.integer()})])
  })
  describe('isSetoid', () => {
    it('tests whether a value is an object and has an "equals" function', () => {
      const semi = { equals: (x: any) => x }
      expect(Setoid.isSetoid(semi)).toBe(true)
      expect(Setoid.isSetoid(1)).toBe(false)
    })
  })
  describe('dispatchSetoid', () => {
    it('returns defaults given string, number, boolean or symbol', () => {
      expect(Setoid.dispatchSetoid(1)).toEqual(Setoid.setoidNumber)
      expect(Setoid.dispatchSetoid('')).toEqual(Setoid.setoidString)
      expect(Setoid.dispatchSetoid(true)).toEqual(Setoid.setoidBoolean)
      expect(Setoid.dispatchSetoid(Symbol())).toEqual(Setoid.setoidSymbol)
    })
    it('returns the result of getTypeclass if the given value is an HKT', () => {
      const getTypeclass = jest.spyOn(Util, 'getTypeclass')
      const isHKT = jest.spyOn(HKT, 'isHKT')
      isHKT.mockReturnValue(true)

      const innerFn = jest.fn()

      // getTypeclass is supposed to return a function which takes the value
      getTypeclass.mockImplementation(() => innerFn)

      const val = { HKT: true } as any
      Setoid.dispatchSetoid(val)
      expect(getTypeclass).toHaveBeenCalledWith(Setoid.isSetoid, 'Setoid')
      expect(innerFn).toHaveBeenCalledWith(val)
    })
    it('throws if a value is not a HKT or one of the defaults', () => {
      expect(() => Setoid.dispatchSetoid({ notAHKT: true } as any)).toThrow('not registered')
    })
  })
  describe('equals', () => {
    it('returns a function given a setoid typerep', () => {
      const S = { equals: jest.fn() }
      const equalsS = Setoid.equals(S)
      expect(typeof equalsS).toBe('function')
      equalsS(1, 2)
      expect(S.equals).toHaveBeenCalledWith(1, 2)
    })
    it('calls dispatch and uses that equals given a value', () => {
      const eq = jest.fn()
      const dispatchSpy = jest.spyOn(Setoid, 'dispatchSetoid')
      dispatchSpy.mockReturnValue({ equals: eq })
      Setoid.equals(1, 2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(eq).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('equalsC', () => {
    it('is a curried equals that calls dispatchSetoid', () => {
      const eq = jest.fn()
      const dispatchSpy = jest.spyOn(Setoid, 'dispatchSetoid')
      dispatchSpy.mockReturnValue({ equals: eq })
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      Setoid.equalsC(1 as number)(2)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(eq).toHaveBeenCalledWith(1, 2)
    })
  })
  describe('equalsC1', () => {
    it('is a curried equals that takes a typerep', () => {
      const eq = jest.fn()
      // we have to do this otherwise A is inferred as 1, not number
      // should not be a problem for most use-cases, since it'll be rare
      // that literals not variables are passed in
      Setoid.equalsC1({equals: eq})(1)(2)
      expect(eq).toHaveBeenCalledWith(1, 2)
    })
  })
})
