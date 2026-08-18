import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import * as WebIqInvariant from '../src/invariant.ts'

describe('Microsoft Web IQ invariant companion', () => {
  it('reserves package ownership without installing an unrelated runtime audit', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true }).await()
    const fiber = ctx.plugin(WebIqInvariant)
    await fiber.await()

    expect(WebIqInvariant.name).toBe('web-search-microsoft-webiq-invariant')
    expect(WebIqInvariant.inject).toEqual(['invariants'])
    expect(() => { (ctx.emit as (event: string) => void)('web/provider-called') }).not.toThrow()

    await fiber.dispose()
    await ctx.fiber.dispose()
  })
})
