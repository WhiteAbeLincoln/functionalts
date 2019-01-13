jest.mock('./register')
import * as P from './Plus'
import * as R from './register'
import { URI_Tag } from './HKT';

describe('Plus', () => {
  describe('exports a zero function which returns the specific zero function when given a TypeRep', () => {
    it('works when given a value and a module is registered', () => {
      const zero = jest.fn()
      const URI = 'TAG'
      ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(
        { URI, zero, map: zero, alt: zero }
      )
      expect(P.zero({ [URI_Tag]: URI } as any)).toBe(zero)
    })
    it('works when given a complete Plus module', () => {
      const zero = jest.fn()
      const URI = 'TAG'
      expect(P.zero({ URI, zero } as any)).toBe(zero)
    })
    it('works when given a Plus with just the URI', () => {
      const zero = jest.fn()
      const URI = 'TAG'
      ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(
        { URI, zero, map: zero, alt: zero }
      )
      expect(P.zero({ URI } as any)).toBe(zero)
    })
  })
})
