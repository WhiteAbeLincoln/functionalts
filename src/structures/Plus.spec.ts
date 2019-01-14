import * as P from './Plus'

describe('Plus', () => {
  it('plus exports a isPlus predicate', () => {
    const zero = jest.fn()
    const URI = 'TAG'
    const plus = { URI, zero, map: zero, alt: zero }
    expect(P.isPlus(plus)).toBe(true)
  })
})
