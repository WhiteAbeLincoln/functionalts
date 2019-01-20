import * as fc from 'fast-check'
import { isHKT, URI_Tag, getTagValue } from '../HKT'

describe('HKT', () => {
  describe('isHKT', () => {
    it('returns true for objects with a defined URI_Tag key', () => {
      fc.assert(fc.property(fc.anything(), a => {
        expect(isHKT(a)).toBe(false)
      }))
      expect(isHKT({ [URI_Tag]: 'hi' })).toBe(true)
    })
  })
  describe('getTagValue', () => {
    it('returns the value of the URI_Tag field given an HKT', () => {
      expect(getTagValue({ [URI_Tag]: 'hi' } as any)).toBe('hi')
    })
  })
})
