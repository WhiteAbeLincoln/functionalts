import * as F from './Functor'
import { URI_Tag } from './HKT'

const map = jest.fn()
const URI = 'TAG'
describe('Functor', () => {
  it('allows registration and retrieval of Functor instances', () => {
    // I can't figure out a way to mock the getFunctor call
    // so for now we must register it for the below test
    const finstance = { URI, map } as any
    F.addFunctor(finstance)
    expect(F.getFunctor(URI)).toEqual(finstance)
  })

  it('exports map and mapC functions which call the specific map for the type', () => {
    const fa = { [URI_Tag]: URI } as any
    const f = (x: any) => x
    F.map(fa, f)
    F.mapC(f)(fa)
    expect(map).toHaveBeenCalledTimes(2)
    expect(map).toHaveBeenCalledWith(fa, f)
  })

  it('throws if a functor instance is not registered for the HKT', () => {
    expect(() => F.map({ [URI_Tag]: 'blahsdlf' } as any, x => x)).toThrow()
  })
})
