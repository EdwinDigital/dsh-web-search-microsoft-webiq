/** Browser entry for the package-local Microsoft Web IQ settings card. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { MicrosoftWebIqSettingsCard } from './MicrosoftWebIqSettingsCard.tsx'
import {
  MicrosoftWebIqSettingsController,
  type MicrosoftWebIqClientSettings,
  type WebRuntimeClientSettings,
} from './controller.ts'
import { en, zh } from './locales.ts'

/** Locale namespace owned by this browser plugin. */
const NS = 'web-search.microsoft-webiq'

/** Host settings namespace this card edits, which is also its slot key. */
const SETTINGS_NS = 'web-search-microsoft-webiq'

/** Installed bundle whose Plugins detail page owns this configuration. */
const PACKAGE_NAME = '@edwindigital/dsh-web-search-microsoft-webiq'

/** Browser services used by this package. */
export const inject = ['slots', 'locale', 'remote', 'remote.credentials', 'configForms']

/**
 * Mount the package-local card and its two settings scopes.
 * @param ctx - browser plugin context carrying the injected client services.
 */
export function apply(ctx: ClientContext): void {
  const providerScope = ctx.configForms.get<MicrosoftWebIqClientSettings>(SETTINGS_NS)
  const webScope = ctx.configForms.get<WebRuntimeClientSettings>('web')
  const controller = new MicrosoftWebIqSettingsController(providerScope, webScope, ctx.remote)

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-search-microsoft-webiq: dictionary')
  ctx.effect(
    () => ctx.remote.$on('credentials/reference-updated', (ref) => { controller.refreshCredential(ref) }),
    'web-search-microsoft-webiq: credential invalidation',
  )
  ctx.effect(
    () => () => { controller.dispose() },
    'web-search-microsoft-webiq: settings controller',
  )

  ctx.effect(() => ctx.configForms.whileServed([SETTINGS_NS], () =>
    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
      name: 'plugins.bundle.config',
      key: PACKAGE_NAME,
      locale: NS,
      inject: () => ({
        hooks: { microsoftWebIqSettings: controller.store },
        saveApiKey: (value: string) => controller.saveApiKey(value),
        setDefault: (enabled: boolean) => controller.setDefault(enabled),
        saveSettings: (patch: Parameters<typeof controller.saveSettings>[0]) =>
          controller.saveSettings(patch),
      }),
    }, MicrosoftWebIqSettingsCard))), 'web-search-microsoft-webiq: settings page')
}

export type {
  MicrosoftWebIqSettingsCardFace,
  MicrosoftWebIqSettingsCardProps,
} from './MicrosoftWebIqSettingsCard.tsx'
export type {
  MicrosoftWebIqClientSettings,
  MicrosoftWebIqSettingsPatch,
  MicrosoftWebIqSettingsState,
  WebRuntimeClientSettings,
} from './controller.ts'
