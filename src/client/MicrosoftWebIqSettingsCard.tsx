/** Package-local browser card for Microsoft Web IQ configuration. */

import { useEffect, useState } from 'react'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type {
  MicrosoftWebIqClientSettings,
  MicrosoftWebIqSettingsPatch,
  MicrosoftWebIqSettingsState,
} from './controller.ts'
import css from './MicrosoftWebIqSettingsCard.module.css'

/** Injection face supplied by this package's slot registration. */
export interface MicrosoftWebIqSettingsCardFace {
  /** Snapshot bound by the slot renderer as `useMicrosoftWebIqSettings`. */
  readonly hooks: {
    readonly microsoftWebIqSettings: SnapshotStore<MicrosoftWebIqSettingsState>
  }
  /** Store one replacement credential literal. */
  readonly saveApiKey: (value: string) => Promise<boolean>
  /** Select or release Microsoft Web IQ in the shared web namespace. */
  readonly setDefault: (enabled: boolean) => Promise<boolean>
  /** Store non-secret provider settings. */
  readonly saveSettings: (patch: MicrosoftWebIqSettingsPatch) => Promise<boolean>
}

/** Props bound by the `settings.plugin.item` renderer. */
export type MicrosoftWebIqSettingsCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'web-search.microsoft-webiq'>
  & InjectFace<MicrosoftWebIqSettingsCardFace>

interface SettingsDraft {
  endpoint: string
  language: string
  region: string
  maxLength: string
  safeSearch: 'strict' | 'off'
}

/** Render the provider's package-local settings card. */
export function MicrosoftWebIqSettingsCard(props: MicrosoftWebIqSettingsCardProps) {
  const { t } = props
  const state = props.useMicrosoftWebIqSettings(value => value)
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [keyRejected, setKeyRejected] = useState(false)
  const [draft, setDraft] = useState<SettingsDraft>(() => draftOf(state.settings))

  useEffect(() => {
    if (state.savingSettings || state.failedAction === 'settings') return
    setDraft(draftOf(state.settings))
  }, [state.failedAction, state.savingSettings, state.settings])

  if (!state.available) return null
  const validity = validateDraft(draft)
  const settingsDirty = !sameSettings(draft, state.settings)
  const keyPending = apiKey.trim().length > 0
  const busy = state.savingApiKey || state.savingSettings
  const savesKey = state.apiKeyWritable && keyPending
  const savesSettings = state.writable && settingsDirty
  const saveDisabled = busy || !validity.valid || !(savesKey || savesSettings)

  // One command covers both owners: the credential crosses the credentials RPC
  // and the rest goes to the settings namespace, so each reports its own outcome.
  const submitAll = async (): Promise<void> => {
    if (!validity.valid) return
    if (savesKey) {
      const accepted = await props.saveApiKey(apiKey.trim())
      setKeyRejected(!accepted)
      if (accepted) setApiKey('')
    } else {
      setKeyRejected(false)
    }
    if (savesSettings) await props.saveSettings(patchOf(draft))
  }

  return (
    <li className={css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${t(open ? 'collapse' : 'expand')}: ${t('title')}`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.title}>{t('title')}</span>
          <span className={css.description}>{t('description')}</span>
        </span>
        <IconChevronDownOutline14 className={`${css.chevron} ${open ? css.chevronOpen : ''}`} />
      </button>
      {open
        ? (
          <div className={css.body}>
            <div className={css.actionRow}>
              <div className={css.actionText}>
                <span className={css.label}>{t('useAsDefault')}</span>
                <p className={css.hint}>
                  {state.settingDefault ? t('settingDefault') : t('useAsDefaultHint')}
                </p>
              </div>
              <button
                type="button"
                className={css.toggle}
                role="switch"
                aria-checked={state.isDefault}
                aria-label={t('useAsDefault')}
                disabled={!state.defaultWritable || state.settingDefault}
                onClick={() => { void props.setDefault(!state.isDefault) }}
              >
                <span
                  className={css.toggleTrack}
                  data-on={state.isDefault || undefined}
                  aria-hidden="true"
                >
                  <span className={css.toggleThumb} />
                </span>
              </button>
            </div>
            {state.failedAction === 'default'
              ? <p className={css.error} role="status">{t('defaultFailed')}</p>
              : null}

            <div className={css.form}>
              {!state.writable ? <p className={css.status}>{t('readOnly')}</p> : null}
              <section className={css.group}>
                <h4 className={css.groupTitle}>{t('apiSection')}</h4>
                <div className={css.fields}>
                  <TextField
                    id="webiq-endpoint"
                    label={t('endpoint')}
                    value={draft.endpoint}
                    disabled={!state.writable}
                    invalid={!validity.endpoint}
                    wide
                    onChange={(value) => { setDraft({ ...draft, endpoint: value }) }}
                  />
                  <div className={css.fieldWide}>
                    <label className={css.label} htmlFor="webiq-api-key">{t('apiKey')}</label>
                    <input
                      id="webiq-api-key"
                      className={css.input}
                      type="password"
                      autoComplete="off"
                      value={apiKey}
                      disabled={!state.apiKeyWritable}
                      onChange={(event) => { setApiKey(event.target.value) }}
                    />
                    <p className={css.hint}>{t('apiKeyHint')}</p>
                    <span className={css.badge}>
                      {t(state.apiKeyConfigured ? 'apiKeySet' : 'apiKeyUnset')}
                    </span>
                    {state.apiKeyWritable
                      ? null
                      : <p className={css.status} role="status">{t('apiKeyLocked')}</p>}
                  </div>
                </div>
              </section>
              <section className={css.group}>
                <h4 className={css.groupTitle}>{t('parameterSection')}</h4>
                <div className={css.fields}>
                  <TextField
                    id="webiq-language"
                    label={t('language')}
                    value={draft.language}
                    disabled={!state.writable}
                    invalid={!validity.language}
                    onChange={(value) => { setDraft({ ...draft, language: value }) }}
                  />
                  <TextField
                    id="webiq-region"
                    label={t('region')}
                    value={draft.region}
                    disabled={!state.writable}
                    invalid={!validity.region}
                    onChange={(value) => { setDraft({ ...draft, region: value }) }}
                  />
                  <TextField
                    id="webiq-max-length"
                    label={t('maxLength')}
                    value={draft.maxLength}
                    disabled={!state.writable}
                    invalid={!validity.maxLength}
                    onChange={(value) => { setDraft({ ...draft, maxLength: value }) }}
                  />
                  <label className={css.field} htmlFor="webiq-safe-search">
                    <span className={css.label}>{t('safeSearch')}</span>
                    <select
                      id="webiq-safe-search"
                      className={css.select}
                      value={draft.safeSearch}
                      disabled={!state.writable}
                      onChange={(event) => {
                        setDraft({ ...draft, safeSearch: event.target.value as 'strict' | 'off' })
                      }}
                    >
                      <option value="strict">{t('strict')}</option>
                      <option value="off">{t('off')}</option>
                    </select>
                  </label>
                </div>
              </section>
              <div className={css.formFooter}>
                {!validity.valid
                  ? <p className={css.error} role="status">{t('invalidSettings')}</p>
                  : keyRejected
                    ? <p className={css.error} role="status">{t('apiKeyFailed')}</p>
                    : state.failedAction === 'settings'
                      ? <p className={css.error} role="status">{t('settingsFailed')}</p>
                      : null}
                <button
                  type="button"
                  className={css.button}
                  disabled={saveDisabled}
                  onClick={() => { void submitAll() }}
                >
                  {t(busy ? 'savingSettings' : 'saveSettings')}
                </button>
              </div>
            </div>
          </div>
        )
        : null}
    </li>
  )
}

/** One package-local labelled text control. */
function TextField(props: {
  id: string
  label: string
  value: string
  disabled: boolean
  invalid: boolean
  wide?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className={props.wide === true ? css.fieldWide : css.field} htmlFor={props.id}>
      <span className={css.label}>{props.label}</span>
      <input
        id={props.id}
        className={`${css.input} ${props.invalid ? css.invalid : ''}`}
        type="text"
        value={props.value}
        disabled={props.disabled}
        {...props.invalid ? { 'aria-invalid': true } : {}}
        onChange={(event) => { props.onChange(event.target.value) }}
      />
    </label>
  )
}

/** Seed local drafts only from non-secret settings state. */
function draftOf(settings: MicrosoftWebIqClientSettings): SettingsDraft {
  return {
    endpoint: settings.endpoint ?? 'https://api.microsoft.ai/v3/search/web',
    language: settings.language ?? '',
    region: settings.region ?? '',
    maxLength: String(settings.maxLength ?? 5000),
    safeSearch: settings.safeSearch ?? 'strict',
  }
}

/** Normalize one draft into the settings namespace's scalar values. */
function patchOf(draft: SettingsDraft): MicrosoftWebIqSettingsPatch {
  const language = draft.language.trim()
  const region = draft.region.trim()
  return {
    endpoint: draft.endpoint.trim(),
    language: language.length === 0 ? undefined : language,
    region: region.length === 0 ? undefined : region,
    maxLength: Number(draft.maxLength.trim()),
    safeSearch: draft.safeSearch,
  }
}

/** Compare normalized drafts against the resolved settings currently shown. */
function sameSettings(draft: SettingsDraft, settings: MicrosoftWebIqClientSettings): boolean {
  const patch = patchOf(draft)
  return patch.endpoint === (settings.endpoint ?? 'https://api.microsoft.ai/v3/search/web')
    && patch.language === settings.language
    && patch.region === settings.region
    && patch.maxLength === (settings.maxLength ?? 5000)
    && patch.safeSearch === (settings.safeSearch ?? 'strict')
}

/** Validate the constraints enforced by the Host schema before enabling save. */
function validateDraft(draft: SettingsDraft): {
  valid: boolean
  endpoint: boolean
  language: boolean
  region: boolean
  maxLength: boolean
} {
  const endpointText = draft.endpoint.trim()
  const endpoint = URL.canParse(endpointText) && new URL(endpointText).protocol === 'https:'
  const language = draft.language.trim() === '' || /^[A-Za-z]{2}$/u.test(draft.language.trim())
  const region = draft.region.trim() === '' || /^[A-Za-z]{2}$/u.test(draft.region.trim())
  const maxLength = Number.isInteger(Number(draft.maxLength.trim()))
    && Number(draft.maxLength.trim()) >= 1
    && Number(draft.maxLength.trim()) <= 500000
  return {
    valid: endpoint && language && region && maxLength,
    endpoint,
    language,
    region,
    maxLength,
  }
}
