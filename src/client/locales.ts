/** Locale bundles owned by the Microsoft Web IQ settings card. */

/** Locale keys rendered by this package's browser half. */
export type MicrosoftWebIqLocaleKey =
  | 'title' | 'description' | 'expand' | 'collapse'
  | 'apiKey' | 'apiKeyHint' | 'apiKeySet' | 'apiKeyUnset' | 'apiKeyLocked'
  | 'apiKeyFailed' | 'apiSection' | 'parameterSection'
  | 'endpoint' | 'language' | 'region' | 'maxLength'
  | 'safeSearch' | 'strict' | 'off' | 'saveSettings' | 'savingSettings'
  | 'invalidSettings' | 'readOnly' | 'settingsFailed'
  | 'useAsDefault' | 'useAsDefaultHint' | 'settingDefault' | 'defaultFailed'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Microsoft Web IQ provider configuration copy. */
    'web-search.microsoft-webiq': MicrosoftWebIqLocaleKey
  }
}

/** English copy. */
export const en: Record<MicrosoftWebIqLocaleKey, string> = {
  title: 'Microsoft Web IQ',
  description: 'Web grounding through Microsoft Web IQ.',
  expand: 'Show settings',
  collapse: 'Hide settings',
  apiKey: 'API key',
  apiKeyHint: 'Stored through the credential service. Leave blank to keep the current key.',
  apiKeySet: 'A key is configured.',
  apiKeyUnset: 'No key is configured.',
  apiKeyLocked: 'The launch environment supplies this key, so it cannot be replaced here. Unset it in the environment to manage the key from this card.',
  apiKeyFailed: 'The API key was not accepted.',
  apiSection: 'API configuration',
  parameterSection: 'Search parameters',
  endpoint: 'Endpoint',
  language: 'Language',
  region: 'Region',
  maxLength: 'Passage length',
  safeSearch: 'SafeSearch',
  strict: 'Strict',
  off: 'Off',
  saveSettings: 'Save configuration',
  savingSettings: 'Saving...',
  invalidSettings: 'Correct the invalid setting values before saving.',
  readOnly: 'This deployment stores provider settings read-only.',
  settingsFailed: 'The provider settings were not accepted.',
  useAsDefault: 'Use Web IQ for web search',
  useAsDefaultHint: 'Turned off, web_search keeps the deployment default provider.',
  settingDefault: 'Applying...',
  defaultFailed: 'The default search provider was not changed.',
}

/** Simplified Chinese copy. */
export const zh: Record<MicrosoftWebIqLocaleKey, string> = {
  title: 'Microsoft Web IQ',
  description: '通过 Microsoft Web IQ 提供网页检索依据。',
  expand: '展开设置',
  collapse: '收起设置',
  apiKey: 'API Key',
  apiKeyHint: '通过凭据服务存储；留空表示保留当前密钥。',
  apiKeySet: '已配置密钥。',
  apiKeyUnset: '未配置密钥。',
  apiKeyLocked: '该密钥来自启动环境，无法在此替换。从环境中取消设置后，即可在本卡片中管理。',
  apiKeyFailed: 'API Key 未被接受。',
  apiSection: 'API 配置',
  parameterSection: '参数配置',
  endpoint: '接口地址',
  language: '语言',
  region: '地区',
  maxLength: '段落长度',
  safeSearch: '安全搜索',
  strict: '严格',
  off: '关闭',
  saveSettings: '保存配置',
  savingSettings: '正在保存...',
  invalidSettings: '请先修正无效的设置值。',
  readOnly: '本部署的提供方设置为只读。',
  settingsFailed: '提供方设置未被接受。',
  useAsDefault: '使用 Web IQ 进行网页搜索',
  useAsDefaultHint: '关闭后，web_search 仍使用本部署的默认提供方。',
  settingDefault: '正在应用...',
  defaultFailed: '默认搜索提供方未更改。',
}
