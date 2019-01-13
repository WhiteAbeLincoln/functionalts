import * as fc from 'fast-check'
import { just, nothing } from './Maybe'
import * as M from './Maybe'
import * as R from './structures/register'
import { URI_Tag } from './structures/HKT'
import { Identity1, Composition1 } from './structures/Functor.helper'
import { Associativity1, Distributivity1 } from './structures/Alt.helper';
import { LeftIdentity1, RightIdentity1, Annihilation1 } from './structures/Plus.helper';
// Note: Mocking fails when build directory exists
// make sure to clean before
jest.mock('./structures/register')

const justAribitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) =>
  v.map(v => just(v))
const nothingArbitrary = () =>
  fc.anything().map(_v => nothing);
const maybeArbitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) =>
  fc.oneof(justAribitrary(v), nothingArbitrary())

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        Identity1(M, maybeArbitrary())
      })
      it('fulfills the Composition law', () => {
        Composition1(M, maybeArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)))
      })
      it('properly registers itself for use by the functor module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        // every call should do the same thing, so no need to check anything other than the first
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map }]
        )
      })
    })
    describe('Alt', () => {
      it('fulfills the Associativity law', () => {
        Associativity1(M, maybeArbitrary())
      })
      it('fulfills the Distributivity law', () => {
        Distributivity1(M, maybeArbitrary())
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
        LeftIdentity1(M, maybeArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        RightIdentity1(M, maybeArbitrary())
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
  describe('Constructors', () => {
    describe('just', () => {
      // this is all we want to test
      // anything else is left to implementation and free functions (discriminating between just & nothing, storing value for just)
      it('creates an object with the [URI_Tag] property set to the Maybe URI', () => {
        const x = just('4')
        expect(x[URI_Tag]).toEqual(M.URI)
      })
    })
    describe('nothing', () => {
      // this is all we want to test
      // anything else is left to implementation and free functions (discriminating between just & nothing, storing value for just)
      it('creates an object with the [URI_Tag] property set to the Maybe URI', () => {
        const x = nothing
        expect(x[URI_Tag]).toEqual(M.URI)
      })
      it('creates an object with a value property storing the value', () => {
        fc.assert(fc.property(fc.anything(), a => {
          expect((just(a) as M.Just<any>).value).toEqual(a)
        }))
      })
    })

  })
  describe('discriminator functions', () => {
    describe('isJust', () => {
      it('returns true when given a just', () => {
        fc.assert(fc.property(justAribitrary(), m => M.isJust(m)))
      })
      it('returns false when given a nothing', () => {
        expect(M.isJust(nothing)).toBe(false)
      })
    })
    describe('isNothing', () => {
      it('returns false when given a just', () => {
        fc.assert(fc.property(justAribitrary(), m => !M.isNothing(m)))
      })
      it('returns true when given a nothing', () => {
        expect(M.isNothing(nothing)).toBe(true)
      })
    })
  })
})
