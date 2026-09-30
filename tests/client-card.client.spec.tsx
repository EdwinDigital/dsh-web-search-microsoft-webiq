// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { useSyncExternalStore } from 'react'
import { MicrosoftWebIqSettingsCard } from '../src/client/MicrosoftWebIqSettingsCard.tsx'
import type { MicrosoftWebIqSettingsCardProps } from '../src/client/MicrosoftWebIqSettingsCard.tsx'
import type { MicrosoftWebIqSettingsState } from '../src/client/controller.ts'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

const READY: MicrosoftWebIqSettingsState = {
  available: true,
  writable: true,
  settings: {
    apiKeyEnv: 'MICROSOFT_WEBIQ_API_KEY',
    endpoint: 'https://api.microsoft.ai/v3/search/web',
    language: 'en',
    region: 'US',
    maxLength: 5000,
    safeSearch: 'strict',
  },
  credentialRef: 'MICROSOFT_WEBIQ_API_KEY',
  apiKeyConfigured: false,
  apiKeyWritable: true,
  isDefault: false,
  defaultWritable: true,
  savingApiKey: false,
  settingDefault: false,
  savingSettings: false,
}

function mount(state: Partial<MicrosoftWebIqSettingsState> = {}, cardView: 'summary' | 'form' = 'form') {
  const store = createSnapshotStore<MicrosoftWebIqSettingsState>({ ...READY, ...state })
  const saveApiKey = vi.fn(() => Promise.resolve(true))
  const setDefault = vi.fn(() => Promise.resolve(true))
  const saveSettings = vi.fn(() => Promise.resolve(true))
  const props = {
    t: (key: keyof typeof en) => en[key],
    view: cardView,
    useMicrosoftWebIqSettings: <T,>(selector: (value: MicrosoftWebIqSettingsState) => T) =>
      useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot())),
    saveApiKey,
    setDefault,
    saveSettings,
  } as unknown as MicrosoftWebIqSettingsCardProps
  const view = render(<MicrosoftWebIqSettingsCard {...props} />)
  return { ...view, store, saveApiKey, setDefault, saveSettings }
}

describe('MicrosoftWebIqSettingsCard', () => {
  it('renders no trace while the provider namespace is unavailable', () => {
    const { container } = mount({ available: false })
    expect(container.textContent).toBe('')
  })

  it('renders a summary and keeps the form password control permanently blank', () => {
    const summary = mount({}, 'summary')
    expect(summary.container.textContent).toBe(en.description)
    summary.unmount()

    mount({ apiKeyConfigured: true })

    const input = screen.getByLabelText(en.apiKey)
    expect(input).toHaveProperty('type', 'password')
    expect(input).toHaveProperty('value', '')
    expect(screen.getByText(en.apiKeySet)).toBeTruthy()
  })

  it('refuses a blank key and clears an accepted replacement draft', async () => {
    const bench = mount()
    const input = screen.getByLabelText(en.apiKey)
    const save = screen.getByRole('button', { name: en.saveSettings })
    expect(save).toHaveProperty('disabled', true)

    fireEvent.change(input, { target: { value: ' webiq-secret ' } })
    fireEvent.click(save)

    await waitFor(() => { expect(bench.saveApiKey).toHaveBeenCalledWith('webiq-secret') })
    await waitFor(() => { expect(input).toHaveProperty('value', '') })
    expect(bench.saveSettings).not.toHaveBeenCalled()
  })

  it('stores the key and the settings from one save command', async () => {
    const bench = mount()

    fireEvent.change(screen.getByLabelText(en.apiKey), { target: { value: 'webiq-secret' } })
    fireEvent.change(screen.getByLabelText(en.endpoint), { target: { value: 'https://proxy.test/web' } })
    fireEvent.click(screen.getByRole('button', { name: en.saveSettings }))

    await waitFor(() => { expect(bench.saveApiKey).toHaveBeenCalledWith('webiq-secret') })
    await waitFor(() => {
      expect(bench.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: 'https://proxy.test/web' }),
      )
    })
  })

  it('toggles the provider on and off through one switch', async () => {
    const bench = mount()
    const toggle = screen.getByRole('switch', { name: en.useAsDefault })
    expect(toggle.getAttribute('aria-checked')).toBe('false')

    fireEvent.click(toggle)
    await waitFor(() => { expect(bench.setDefault).toHaveBeenCalledWith(true) })

    act(() => { bench.store.set({ ...READY, isDefault: true }) })
    expect(screen.getByRole('switch', { name: en.useAsDefault }).getAttribute('aria-checked')).toBe('true')

    fireEvent.click(screen.getByRole('switch', { name: en.useAsDefault }))
    await waitFor(() => { expect(bench.setDefault).toHaveBeenLastCalledWith(false) })
  })

  it('explains a key the launch environment owns instead of a dead control', () => {
    mount({ apiKeyConfigured: true, apiKeyWritable: false })

    expect(screen.getByLabelText(en.apiKey)).toHaveProperty('disabled', true)
    expect(screen.getByText(en.apiKeyLocked)).toBeTruthy()
  })

  it('stages and saves non-secret provider settings together', async () => {
    const bench = mount()

    fireEvent.change(screen.getByLabelText(en.endpoint), { target: { value: 'https://proxy.test/web' } })
    fireEvent.change(screen.getByLabelText(en.language), { target: { value: 'zh' } })
    fireEvent.change(screen.getByLabelText(en.region), { target: { value: 'CN' } })
    fireEvent.change(screen.getByLabelText(en.maxLength), { target: { value: '8000' } })
    fireEvent.change(screen.getByLabelText(en.safeSearch), { target: { value: 'off' } })
    fireEvent.click(screen.getByRole('button', { name: en.saveSettings }))

    await waitFor(() => {
      expect(bench.saveSettings).toHaveBeenCalledWith({
        endpoint: 'https://proxy.test/web',
        language: 'zh',
        region: 'CN',
        maxLength: 8000,
        safeSearch: 'off',
      })
    })
  })

  it('exposes no credential reference control', () => {
    mount()

    expect(screen.getAllByRole('textbox').map(field => field.getAttribute('id')))
      .toEqual(['webiq-endpoint', 'webiq-language', 'webiq-region', 'webiq-max-length'])
  })

  it('sends an explicit clear for an emptied optional setting', async () => {
    const bench = mount()

    fireEvent.change(screen.getByLabelText(en.language), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: en.saveSettings }))

    await waitFor(() => {
      expect(bench.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ language: undefined }))
    })
  })

  it('preserves drafts the Host did not accept during a partial save', async () => {
    const bench = mount()
    const endpoint = screen.getByLabelText(en.endpoint)
    fireEvent.change(endpoint, { target: { value: 'https://unaccepted.test/web' } })
    bench.saveSettings.mockImplementation(async () => {
      act(() => {
        bench.store.set({
          ...READY,
          savingSettings: true,
          settings: { ...READY.settings, language: 'fr' },
        })
      })
      act(() => {
        bench.store.set({
          ...READY,
          failedAction: 'settings',
          settings: { ...READY.settings, language: 'fr' },
        })
      })
      return false
    })

    fireEvent.click(screen.getByRole('button', { name: en.saveSettings }))

    await waitFor(() => { expect(bench.saveSettings).toHaveBeenCalledOnce() })
    expect(endpoint).toHaveProperty('value', 'https://unaccepted.test/web')
    expect(screen.getByRole('status')).toHaveProperty('textContent', en.settingsFailed)
  })

  it('blocks an HTTPS-prefixed endpoint that is not a parseable URL', () => {
    mount()

    fireEvent.change(screen.getByLabelText(en.endpoint), { target: { value: 'https://[' } })

    expect(screen.getByRole('button', { name: en.saveSettings })).toHaveProperty('disabled', true)
    expect(screen.getByRole('status')).toHaveProperty('textContent', en.invalidSettings)
  })

  it('keeps credential writes independent from a read-only settings document', () => {
    mount({ writable: false, apiKeyWritable: true })

    expect(screen.getByLabelText(en.apiKey)).toHaveProperty('disabled', false)
    expect(screen.getByLabelText(en.endpoint)).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: en.saveSettings })).toHaveProperty('disabled', true)
  })

  it('reports the command the Host did not accept', () => {
    mount({ failedAction: 'default' })

    expect(screen.getByRole('status')).toHaveProperty('textContent', en.defaultFailed)
  })
})
