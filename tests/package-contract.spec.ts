import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
  icon?: string
  exports: Record<string, unknown>
  files: string[]
  peerDependencies: Record<string, string>
}
const icon = await readFile(new URL('../icon.svg', import.meta.url), 'utf8')
const publishWorkflow = await readFile(
  new URL('../.github/workflows/publish.yml', import.meta.url),
  'utf8',
)
const installPatch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

describe('published plugin contract', () => {
  it('omits an invariant companion when the package owns no diverging runtime observations', () => {
    expect(manifest.exports).not.toHaveProperty('./invariant')
    expect(manifest.files).not.toContain('lib/invariant.js')
    expect(manifest.peerDependencies).not.toHaveProperty('@deepseek-ai/dsh-invariants')
  })

  it('publishes localized plugin display metadata', () => {
    expect(manifest.exports).toHaveProperty('./locale/*.json', './locale/*.json')
    expect(manifest.files).toContain('locale/*.json')
  })

  it('publishes a self-contained manifest icon for plugin-manager surfaces', () => {
    expect(manifest.icon).toBe('./icon.svg')
    expect(manifest.files).toContain('icon.svg')
    expect(Buffer.byteLength(icon)).toBeLessThanOrEqual(256 * 1024)
    expect(icon).toMatch(/^<svg\b/u)
    expect(icon).not.toMatch(/\b(?:href|src)=/u)
  })

  it('selects Web IQ for web search on first installation', () => {
    expect(installPatch).toMatch(/- id: web[\s\S]*?searchProvider: microsoft-webiq/u)
  })

  it('checks only artifacts the package still publishes before release', () => {
    expect(publishWorkflow).toContain('for f in lib/index.js lib/client.js')
    expect(publishWorkflow).not.toContain('lib/invariant.js')
  })
})
