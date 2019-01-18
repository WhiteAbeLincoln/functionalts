import * as A from '../Applicative'

describe('Applicative', () => {
  it('plus exports a isApplicative predicate', () => {
    const zero = jest.fn()
    const URI = 'TAG'
    const plus = { URI, zero, map: zero, alt: zero, ap: zero, of: zero }
    expect(A.isApplicative(plus)).toBe(true)
  })
})
