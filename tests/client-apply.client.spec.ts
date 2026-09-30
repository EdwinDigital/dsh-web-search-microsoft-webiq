// @vitest-environment jsdom

/** Browser registration contract for the installable Web IQ bundle. */

import { describe, expect, it, vi } from 'vitest'
import { stubConfigForm } from '@deepseek-ai/dsh-client-test-runtime/src/config-form.ts'
import { apply } from '../src/client/index.ts'
import type {
  MicrosoftWebIqClientSettings,
  WebRuntimeClientSettings,
} from '../src/client/controller.ts'

const PACKAGE_NAME = '@edwindigital/dsh-web-search-microsoft-webiq'

function bench() {
  const provider = stubConfigForm<MicrosoftWebIqClientSettings>()
  const web = stubConfigForm<WebRuntimeClientSettings>()
  const register = vi.fn(() => vi.fn())
  const inject = vi.fn((_name: string, install: () => unknown) => install())
  const whileServed = vi.fn((_names: string[], install: () => unknown) => install())
  const context = {
    locale: {
      bind: () => (key: string) => key,
      register: () => vi.fn(),
    },
    configForms: {
      get: (namespace: string) => namespace === 'web-search-microsoft-webiq'
        ? provider.scope
        : web.scope,
      whileServed,
    },
    remote: {
      credentials: {
        describe: vi.fn(() => Promise.resolve({ ok: true, value: {} })),
        set: vi.fn(),
      },
      $on: vi.fn(() => vi.fn()),
    },
    slots: { inject, register },
    effect: (install: () => unknown) => install(),
  }
  return { context, inject, register, whileServed }
}

describe('Web IQ client apply', () => {
  it('registers configuration on the installed bundle page', () => {
    const { context, inject, register, whileServed } = bench()

    apply(context as never)

    expect(whileServed).toHaveBeenCalledWith(['web-search-microsoft-webiq'], expect.any(Function))
    expect(inject).toHaveBeenCalledWith('plugins.bundle.config', expect.any(Function))
    expect(register).toHaveBeenCalledWith(
      {
        name: 'plugins.bundle.config',
        key: PACKAGE_NAME,
        locale: 'web-search.microsoft-webiq',
        inject: expect.any(Function),
      },
      expect.any(Function),
    )
  })
})
