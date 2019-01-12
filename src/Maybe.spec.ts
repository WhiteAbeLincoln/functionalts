import * as fc from 'fast-check'
import { just, nothing } from './Maybe'
import * as M from './Maybe'
import * as _F from './structures/Functor'
import { URI_Tag } from './structures/HKT'
// Note: Mocking fails when build directory exists
// make sure to clean before
jest.mock('./structures/Functor')

const justAribitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) => v.map(v => just(v))
const nothingArbitrary = () => fc.anything().map(_v => nothing);
const maybeArbitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) => fc.oneof(justAribitrary(v), nothingArbitrary())

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        const identity = <A>(x: A) => x
        fc.assert(fc.property(maybeArbitrary(),
          m => {
            expect(M.map(m, identity)).toEqual(m)
          }
        ))
      })
      it('fulfills the Composition law', () => {
        const f = (x: number) => x + 1
        const g = (x: number) => `${x}`
        fc.assert(fc.property(maybeArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)),
          m => {
            expect(
              M.map(M.map(m, f), g)
            ).toEqual(
              M.map(m, x => g(f(x)))
            )
          }
        ))
      })
      it('Properly registers itself for use by the functor module', () => {
        M.Register.functor()
        expect((_F as jest.Mocked<typeof _F>).addFunctor.mock.calls).toHaveLength(1)
        expect((_F as jest.Mocked<typeof _F>).addFunctor.mock.calls[0]).toEqual([{ URI: M.URI, map: M.map, mapC: M.mapC }])
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
