import * as F from './Functor'
import { URI_Tag } from './HKT'
import { id } from '../util/functional'

describe('Functor', () => {
  it('exports map and mapC functions which call the specific map for the type', () => {
    const map = jest.fn()
    const URI = 'TAG'
    const spy = jest.spyOn(F, 'getFunctor')
    spy.mockReturnValue({ URI, map })

    const fa = { [URI_Tag]: URI } as any
    F.map(fa, id)
    F.mapC(id)(fa)
    // checks if our generic curried version calls the regular map
    expect(map).toHaveBeenCalledTimes(2)
    expect(map).toHaveBeenCalledWith(fa, id)

    spy.mockRestore()
  })

  it('throws if a functor instance is not registered for the HKT', () => {
    expect(() => F.map({ [URI_Tag]: 'blahsdlf' } as any, id)).toThrow()
  })
})
