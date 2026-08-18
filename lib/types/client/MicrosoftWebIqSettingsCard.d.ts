/** Package-local browser card for Microsoft Web IQ configuration. */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { MicrosoftWebIqSettingsPatch, MicrosoftWebIqSettingsState } from './controller.ts';
/** Injection face supplied by this package's slot registration. */
export interface MicrosoftWebIqSettingsCardFace {
    /** Snapshot bound by the slot renderer as `useMicrosoftWebIqSettings`. */
    readonly hooks: {
        readonly microsoftWebIqSettings: SnapshotStore<MicrosoftWebIqSettingsState>;
    };
    /** Store one replacement credential literal. */
    readonly saveApiKey: (value: string) => Promise<boolean>;
    /** Select or release Microsoft Web IQ in the shared web namespace. */
    readonly setDefault: (enabled: boolean) => Promise<boolean>;
    /** Store non-secret provider settings. */
    readonly saveSettings: (patch: MicrosoftWebIqSettingsPatch) => Promise<boolean>;
}
/** Props bound by the `settings.plugin.item` renderer. */
export type MicrosoftWebIqSettingsCardProps = PropsRuntime<'settings.plugin.item'> & PropsLocale<'web-search.microsoft-webiq'> & InjectFace<MicrosoftWebIqSettingsCardFace>;
/** Render the provider's package-local settings card. */
export declare function MicrosoftWebIqSettingsCard(props: MicrosoftWebIqSettingsCardProps): import("react").JSX.Element | null;
//# sourceMappingURL=MicrosoftWebIqSettingsCard.d.ts.map