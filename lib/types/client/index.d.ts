/** Browser entry for the package-local Microsoft Web IQ settings card. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Browser services used by this package. */
export declare const inject: string[];
/**
 * Mount the package-local card and its two settings scopes.
 * @param ctx - browser plugin context carrying the injected client services.
 */
export declare function apply(ctx: ClientContext): void;
export type { MicrosoftWebIqSettingsCardFace, MicrosoftWebIqSettingsCardProps, } from './MicrosoftWebIqSettingsCard.tsx';
export type { MicrosoftWebIqClientSettings, MicrosoftWebIqSettingsPatch, MicrosoftWebIqSettingsState, WebRuntimeClientSettings, } from './controller.ts';
//# sourceMappingURL=index.d.ts.map