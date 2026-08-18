/** Browser entry for the package-local Microsoft Web IQ settings card. */

import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MicrosoftWebIqSettingsCard } from './MicrosoftWebIqSettingsCard.tsx'
import {
  MicrosoftWebIqSettingsController,
  type MicrosoftWebIqClientSettings,
  type WebRuntimeClientSettings,
} from './controller.ts'
import { en, zh } from './locales.ts'

/** Locale namespace owned by this browser plugin. */
export const NS = 'web-search.microsoft-webiq'

/** Browser services used by this package. */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope']

/** Mount the package-local card and its two settings scopes. */
export function apply(ctx: ClientContext): void {
  const { api } = ctx.get('connection') as ConnectionHandle
  const providerScope = ctx.settingsScope.bind<MicrosoftWebIqClientSettings>({
    namespace: 'web-search-microsoft-webiq',
  })
  const webScope = ctx.settingsScope.bind<WebRuntimeClientSettings>({ namespace: 'web' })
  const controller = new MicrosoftWebIqSettingsController(providerScope, webScope, api)

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-search-microsoft-webiq: dictionary')
  ctx.effect(
    () => ctx.remote.$on('credentials/updated', (ref) => { controller.refreshCredential(ref) }),
    'web-search-microsoft-webiq: credential invalidation',
  )
  ctx.effect(
    () => () => { controller.dispose() },
    'web-search-microsoft-webiq: settings controller',
  )

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'web-search-microsoft-webiq',
    order: 30,
    locale: NS,
    inject: () => ({
      hooks: { microsoftWebIqSettings: controller.store },
      saveApiKey: (value: string) => controller.saveApiKey(value),
      setDefault: (enabled: boolean) => controller.setDefault(enabled),
      saveSettings: (patch: Parameters<typeof controller.saveSettings>[0]) =>
        controller.saveSettings(patch),
    }),
  }, MicrosoftWebIqSettingsCard))
}

export { MicrosoftWebIqSettingsCard } from './MicrosoftWebIqSettingsCard.tsx'
export type {
  MicrosoftWebIqSettingsCardFace,
  MicrosoftWebIqSettingsCardProps,
} from './MicrosoftWebIqSettingsCard.tsx'
export {
  MicrosoftWebIqSettingsController,
} from './controller.ts'
export type {
  MicrosoftWebIqClientSettings,
  MicrosoftWebIqSettingsPatch,
  MicrosoftWebIqSettingsState,
  WebRuntimeClientSettings,
} from './controller.ts'
