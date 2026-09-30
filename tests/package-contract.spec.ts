import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
  exports: Record<string, unknown>
  files: string[]
  peerDependencies: Record<string, string>
}
const publishWorkflow = await readFile(
  new URL('../.github/workflows/publish.yml', import.meta.url),
  'utf8',
)

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

  it('checks only artifacts the package still publishes before release', () => {
    expect(publishWorkflow).toContain('for f in lib/index.js lib/client.js')
    expect(publishWorkflow).not.toContain('lib/invariant.js')
  })
})
