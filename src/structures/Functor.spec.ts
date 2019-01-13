jest.mock('./register')
import * as F from './Functor'
import { URI_Tag } from './HKT'
import * as R from './register'

describe('Functor', () => {
  it('exports map and mapC functions which call the specific map for the type', () => {
    const map = jest.fn()
    const URI = 'TAG'
    ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(
      { URI, map }
    )

    const fa = { [URI_Tag]: URI } as any
    const f = (x: any) => x
    F.map(fa, f)
    F.mapC(f)(fa)
    // checks if our generic curried version calls the regular map
    expect(map).toHaveBeenCalledTimes(2)
    expect(map).toHaveBeenCalledWith(fa, f)
  })

  it('throws if a functor instance is not registered for the HKT', () => {
    ;(R as jest.Mocked<typeof R>).getInstance.mockReset()
    expect(() => F.map({ [URI_Tag]: 'blahsdlf' } as any, x => x)).toThrow()
  })
})
