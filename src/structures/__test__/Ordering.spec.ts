import * as fc from 'fast-check'
import { sign, invert } from '../Ordering'
describe('Ordering', () => {
  it('sign', () => {
    fc.assert(fc.property(fc.integer(-1), i => {
      expect(sign(i)).toBe(-1)
    }))
    fc.assert(fc.property(fc.nat().filter(x => x !== 0), i => {
      expect(sign(i)).toBe(1)
    }))
    expect(sign(0)).toBe(0)
  })
  it('invert', () => {
    expect(invert(1)).toBe(-1)
    expect(invert(-1)).toBe(1)
    expect(invert(0)).toBe(0)
  })
})
