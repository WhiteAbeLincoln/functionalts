import * as fc from 'fast-check'
import * as M from './Array'
import * as R from './structures/register'
import { URI_Tag } from './structures/HKT'
import { Identity1, Composition1 } from './structures/Functor.helper'
import { Associativity1, Distributivity1 } from './structures/Alt.helper'
import { LeftIdentity1, RightIdentity1, Annihilation1 } from './structures/Plus.helper';
jest.mock('./structures/register')

const arrayArbitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) => fc.array(v)

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        Identity1(M, arrayArbitrary())
      })
      it('fulfills the Composition law', () => {
        Composition1(M, arrayArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)))
      })
      it('Modifies the Array prototype when registering', () => {
        M.Register()
        expect(Array.prototype[URI_Tag as any]).toEqual(M.URI)
      })
      it('Properly registers itself for use by the functor module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject([{ URI: M.URI, map: M.map }])
      })
    })
    describe('Alt', () => {
      it('fulfills the Associativity law', () => {
        Associativity1(M, arrayArbitrary())
      })
      it('fulfills the Distributivity law', () => {
        Distributivity1(M, arrayArbitrary())
      })
      it('properly registers itself for use by the alt module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        // every call should do the same thing, so no need to check anything other than the first
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt }]
        )
      })
    })
    describe('Plus', () => {
      it('fulfills the Left Identity law', () => {
        LeftIdentity1(M, arrayArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        RightIdentity1(M, arrayArbitrary())
      })
      it('fulfills the Annihilation law', () => {
        Annihilation1(M)
      })
      it('properly registers itself for use by the plus module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt, zero: M.zero }]
        )
      })
    })
  })
})
