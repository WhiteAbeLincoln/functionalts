import * as fc from 'fast-check'
import * as M from './Array'
import * as _F from './structures/Functor'
import { URI_Tag } from './structures/HKT'
jest.mock('./structures/Functor')

const arrayArbitrary = <A extends fc.Arbitrary<any>>(v: A = fc.anything() as A) => fc.array(v)

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        const identity = <A>(x: A) => x
        fc.assert(fc.property(arrayArbitrary(),
          m => {
            expect(M.map(m, identity)).toEqual(m)
            expect(M.mapC(identity)(m)).toEqual(m)
          }
        ))
      })
      it('fulfills the Composition law', () => {
        const f = (x: number) => x + 1
        const g = (x: number) => `${x}`
        fc.assert(fc.property(arrayArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)),
          m => {
            expect(
              M.map(M.map(m, f), g)
            ).toEqual(
              M.map(m, x => g(f(x)))
            )
            expect(
              M.mapC(g)(M.mapC(f)(m))
            ).toEqual(
              M.mapC((x: number) => g(f(x)))(m)
            )
          }
        ))
      })
      it('Modifies the Array prototype when registering', () => {
        M.Register.functor()
        expect(Array.prototype[URI_Tag as any]).toEqual(M.URI)
      })
      it('Properly registers itself for use by the functor module', () => {
        M.Register.functor()
        expect((_F as jest.Mocked<typeof _F>).addFunctor).toHaveBeenCalled()
        expect((_F as jest.Mocked<typeof _F>).addFunctor.mock.calls[0]).toEqual([{ URI: M.URI, map: M.map, mapC: M.mapC }])
      })
    })
  })
})
