window.__ModuleLoader__.load({
	id: "@edwindigital/dsh-web-search-microsoft-webiq",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region \0dsh-css:/Users/edwin/Development/dsh-web-search-microsoft-webiq/src/client/MicrosoftWebIqSettingsCard.module.css.mjs
		const css = ".fyNIla_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;list-style:none}.fyNIla_header{width:100%;min-height:70px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;align-items:center;gap:12px;padding:13px 15px;display:flex}.fyNIla_header:focus-visible,.fyNIla_button:focus-visible,.fyNIla_input:focus-visible,.fyNIla_select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.fyNIla_headText{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.fyNIla_title{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.fyNIla_description,.fyNIla_hint,.fyNIla_status,.fyNIla_error{margin:0;font-size:12px;line-height:1.5}.fyNIla_description,.fyNIla_hint,.fyNIla_status{color:var(--dsw-alias-label-tertiary)}.fyNIla_error{color:var(--dsw-alias-label-error)}.fyNIla_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.fyNIla_chevronOpen{transform:rotate(180deg)}.fyNIla_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 15px;padding:14px 0 15px}.fyNIla_actionRow{justify-content:space-between;align-items:center;gap:12px;min-height:38px;display:flex}.fyNIla_actionRow+.fyNIla_actionRow,.fyNIla_form{border-top:1px solid var(--dsw-alias-border-l2);margin-top:14px;padding-top:14px}.fyNIla_actionText{min-width:0}.fyNIla_badge{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:999px;margin-top:3px;padding:1px 8px;font-size:11px;line-height:17px;display:inline-block}.fyNIla_button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);min-height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:7px;flex:none;padding:5px 12px;font-size:13px;line-height:1.5}.fyNIla_button:disabled,.fyNIla_input:disabled,.fyNIla_select:disabled{opacity:.45;cursor:default}.fyNIla_fields{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;display:grid}.fyNIla_field,.fyNIla_fieldWide{flex-direction:column;gap:5px;min-width:0;display:flex}.fyNIla_fieldWide{grid-column:1/-1}.fyNIla_label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:1.5}.fyNIla_input,.fyNIla_select{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);width:100%;height:34px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;padding:0 10px;font-size:13px}.fyNIla_invalid{border-color:var(--dsw-alias-label-error)}.fyNIla_group+.fyNIla_group{border-top:1px solid var(--dsw-alias-border-l2);margin-top:16px;padding-top:14px}.fyNIla_groupTitle{color:var(--dsw-alias-label-secondary);margin:0 0 10px;font-size:12px;font-weight:600;line-height:1.5}.fyNIla_toggle{cursor:pointer;background:0 0;border:0;border-radius:7px;flex:none;align-items:center;padding:6px;display:inline-flex}.fyNIla_toggle:disabled{opacity:.45;cursor:default}.fyNIla_toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.fyNIla_toggleTrack{background:var(--dsw-alias-border-l2);width:28px;height:16px;transition:background-color .12s var(--ds-ease-in-out);border-radius:8px;flex:none;display:inline-block;position:relative}.fyNIla_toggleThumb{background:var(--dsw-alias-bg-layer-1);width:10px;height:10px;transition:transform .12s var(--ds-ease-in-out);border-radius:50%;position:absolute;top:3px;left:3px}.fyNIla_toggleTrack[data-on=true]{background:var(--dsw-alias-state-business-primary)}.fyNIla_toggleTrack[data-on=true] .fyNIla_toggleThumb{transform:translate(12px)}.fyNIla_formFooter{justify-content:flex-end;align-items:center;gap:12px;min-height:34px;margin-top:12px;display:flex}.fyNIla_formFooter .fyNIla_error{flex:1}@media (width<=640px){.fyNIla_fields{grid-template-columns:minmax(0,1fr)}.fyNIla_fieldWide{grid-column:auto}.fyNIla_actionRow{flex-direction:column;align-items:flex-start}.fyNIla_button{width:100%}}";
		const tagId = "@edwindigital/dsh-web-search-microsoft-webiq/MicrosoftWebIqSettingsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@edwindigital/dsh-web-search-microsoft-webiq";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MicrosoftWebIqSettingsCard_module_css_default = {
			"label": "fyNIla_label",
			"actionRow": "fyNIla_actionRow",
			"error": "fyNIla_error",
			"title": "fyNIla_title",
			"fields": "fyNIla_fields",
			"header": "fyNIla_header",
			"description": "fyNIla_description",
			"form": "fyNIla_form",
			"toggleTrack": "fyNIla_toggleTrack",
			"hint": "fyNIla_hint",
			"badge": "fyNIla_badge",
			"button": "fyNIla_button",
			"card": "fyNIla_card",
			"chevronOpen": "fyNIla_chevronOpen",
			"input": "fyNIla_input",
			"body": "fyNIla_body",
			"field": "fyNIla_field",
			"toggle": "fyNIla_toggle",
			"chevron": "fyNIla_chevron",
			"fieldWide": "fyNIla_fieldWide",
			"group": "fyNIla_group",
			"formFooter": "fyNIla_formFooter",
			"headText": "fyNIla_headText",
			"select": "fyNIla_select",
			"actionText": "fyNIla_actionText",
			"invalid": "fyNIla_invalid",
			"toggleThumb": "fyNIla_toggleThumb",
			"groupTitle": "fyNIla_groupTitle",
			"status": "fyNIla_status"
		};
		//#endregion
		//#region lib/types/client/MicrosoftWebIqSettingsCard.js
		/** Package-local browser card for Microsoft Web IQ configuration. */
		/** Render the provider's package-local settings card. */
		function MicrosoftWebIqSettingsCard(props) {
			const { t } = props;
			const state = props.useMicrosoftWebIqSettings((value) => value);
			const [open, setOpen] = (0, react.useState)(false);
			const [apiKey, setApiKey] = (0, react.useState)("");
			const [keyRejected, setKeyRejected] = (0, react.useState)(false);
			const [draft, setDraft] = (0, react.useState)(() => draftOf(state.settings));
			(0, react.useEffect)(() => {
				if (state.savingSettings || state.failedAction === "settings") return;
				setDraft(draftOf(state.settings));
			}, [
				state.failedAction,
				state.savingSettings,
				state.settings
			]);
			if (!state.available) return null;
			const validity = validateDraft(draft);
			const settingsDirty = !sameSettings(draft, state.settings);
			const keyPending = apiKey.trim().length > 0;
			const busy = state.savingApiKey || state.savingSettings;
			const savesKey = state.apiKeyWritable && keyPending;
			const savesSettings = state.writable && settingsDirty;
			const saveDisabled = busy || !validity.valid || !(savesKey || savesSettings);
			const submitAll = async () => {
				if (!validity.valid) return;
				if (savesKey) {
					const accepted = await props.saveApiKey(apiKey.trim());
					setKeyRejected(!accepted);
					if (accepted) setApiKey("");
				} else setKeyRejected(false);
				if (savesSettings) await props.saveSettings(patchOf(draft));
			};
			return (0, react_jsx_runtime.jsxs)("li", {
				className: MicrosoftWebIqSettingsCard_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: MicrosoftWebIqSettingsCard_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${t(open ? "collapse" : "expand")}: ${t("title")}`,
					onClick: () => {
						setOpen(!open);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: MicrosoftWebIqSettingsCard_module_css_default.headText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: MicrosoftWebIqSettingsCard_module_css_default.title,
							children: t("title")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: MicrosoftWebIqSettingsCard_module_css_default.description,
							children: t("description")
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: `${MicrosoftWebIqSettingsCard_module_css_default.chevron} ${open ? MicrosoftWebIqSettingsCard_module_css_default.chevronOpen : ""}` })]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: MicrosoftWebIqSettingsCard_module_css_default.body,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: MicrosoftWebIqSettingsCard_module_css_default.actionRow,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: MicrosoftWebIqSettingsCard_module_css_default.actionText,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: MicrosoftWebIqSettingsCard_module_css_default.label,
									children: t("useAsDefault")
								}), (0, react_jsx_runtime.jsx)("p", {
									className: MicrosoftWebIqSettingsCard_module_css_default.hint,
									children: state.settingDefault ? t("settingDefault") : t("useAsDefaultHint")
								})]
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MicrosoftWebIqSettingsCard_module_css_default.toggle,
								role: "switch",
								"aria-checked": state.isDefault,
								"aria-label": t("useAsDefault"),
								disabled: !state.defaultWritable || state.settingDefault,
								onClick: () => {
									props.setDefault(!state.isDefault);
								},
								children: (0, react_jsx_runtime.jsx)("span", {
									className: MicrosoftWebIqSettingsCard_module_css_default.toggleTrack,
									"data-on": state.isDefault || void 0,
									"aria-hidden": "true",
									children: (0, react_jsx_runtime.jsx)("span", { className: MicrosoftWebIqSettingsCard_module_css_default.toggleThumb })
								})
							})]
						}),
						state.failedAction === "default" ? (0, react_jsx_runtime.jsx)("p", {
							className: MicrosoftWebIqSettingsCard_module_css_default.error,
							role: "status",
							children: t("defaultFailed")
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: MicrosoftWebIqSettingsCard_module_css_default.form,
							children: [
								!state.writable ? (0, react_jsx_runtime.jsx)("p", {
									className: MicrosoftWebIqSettingsCard_module_css_default.status,
									children: t("readOnly")
								}) : null,
								(0, react_jsx_runtime.jsxs)("section", {
									className: MicrosoftWebIqSettingsCard_module_css_default.group,
									children: [(0, react_jsx_runtime.jsx)("h4", {
										className: MicrosoftWebIqSettingsCard_module_css_default.groupTitle,
										children: t("apiSection")
									}), (0, react_jsx_runtime.jsxs)("div", {
										className: MicrosoftWebIqSettingsCard_module_css_default.fields,
										children: [(0, react_jsx_runtime.jsx)(TextField, {
											id: "webiq-endpoint",
											label: t("endpoint"),
											value: draft.endpoint,
											disabled: !state.writable,
											invalid: !validity.endpoint,
											wide: true,
											onChange: (value) => {
												setDraft({
													...draft,
													endpoint: value
												});
											}
										}), (0, react_jsx_runtime.jsxs)("div", {
											className: MicrosoftWebIqSettingsCard_module_css_default.fieldWide,
											children: [
												(0, react_jsx_runtime.jsx)("label", {
													className: MicrosoftWebIqSettingsCard_module_css_default.label,
													htmlFor: "webiq-api-key",
													children: t("apiKey")
												}),
												(0, react_jsx_runtime.jsx)("input", {
													id: "webiq-api-key",
													className: MicrosoftWebIqSettingsCard_module_css_default.input,
													type: "password",
													autoComplete: "off",
													value: apiKey,
													disabled: !state.apiKeyWritable,
													onChange: (event) => {
														setApiKey(event.target.value);
													}
												}),
												(0, react_jsx_runtime.jsx)("p", {
													className: MicrosoftWebIqSettingsCard_module_css_default.hint,
													children: t("apiKeyHint")
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: MicrosoftWebIqSettingsCard_module_css_default.badge,
													children: t(state.apiKeyConfigured ? "apiKeySet" : "apiKeyUnset")
												}),
												state.apiKeyWritable ? null : (0, react_jsx_runtime.jsx)("p", {
													className: MicrosoftWebIqSettingsCard_module_css_default.status,
													role: "status",
													children: t("apiKeyLocked")
												})
											]
										})]
									})]
								}),
								(0, react_jsx_runtime.jsxs)("section", {
									className: MicrosoftWebIqSettingsCard_module_css_default.group,
									children: [(0, react_jsx_runtime.jsx)("h4", {
										className: MicrosoftWebIqSettingsCard_module_css_default.groupTitle,
										children: t("parameterSection")
									}), (0, react_jsx_runtime.jsxs)("div", {
										className: MicrosoftWebIqSettingsCard_module_css_default.fields,
										children: [
											(0, react_jsx_runtime.jsx)(TextField, {
												id: "webiq-language",
												label: t("language"),
												value: draft.language,
												disabled: !state.writable,
												invalid: !validity.language,
												onChange: (value) => {
													setDraft({
														...draft,
														language: value
													});
												}
											}),
											(0, react_jsx_runtime.jsx)(TextField, {
												id: "webiq-region",
												label: t("region"),
												value: draft.region,
												disabled: !state.writable,
												invalid: !validity.region,
												onChange: (value) => {
													setDraft({
														...draft,
														region: value
													});
												}
											}),
											(0, react_jsx_runtime.jsx)(TextField, {
												id: "webiq-max-length",
												label: t("maxLength"),
												value: draft.maxLength,
												disabled: !state.writable,
												invalid: !validity.maxLength,
												onChange: (value) => {
													setDraft({
														...draft,
														maxLength: value
													});
												}
											}),
											(0, react_jsx_runtime.jsxs)("label", {
												className: MicrosoftWebIqSettingsCard_module_css_default.field,
												htmlFor: "webiq-safe-search",
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: MicrosoftWebIqSettingsCard_module_css_default.label,
													children: t("safeSearch")
												}), (0, react_jsx_runtime.jsxs)("select", {
													id: "webiq-safe-search",
													className: MicrosoftWebIqSettingsCard_module_css_default.select,
													value: draft.safeSearch,
													disabled: !state.writable,
													onChange: (event) => {
														setDraft({
															...draft,
															safeSearch: event.target.value
														});
													},
													children: [(0, react_jsx_runtime.jsx)("option", {
														value: "strict",
														children: t("strict")
													}), (0, react_jsx_runtime.jsx)("option", {
														value: "off",
														children: t("off")
													})]
												})]
											})
										]
									})]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: MicrosoftWebIqSettingsCard_module_css_default.formFooter,
									children: [!validity.valid ? (0, react_jsx_runtime.jsx)("p", {
										className: MicrosoftWebIqSettingsCard_module_css_default.error,
										role: "status",
										children: t("invalidSettings")
									}) : keyRejected ? (0, react_jsx_runtime.jsx)("p", {
										className: MicrosoftWebIqSettingsCard_module_css_default.error,
										role: "status",
										children: t("apiKeyFailed")
									}) : state.failedAction === "settings" ? (0, react_jsx_runtime.jsx)("p", {
										className: MicrosoftWebIqSettingsCard_module_css_default.error,
										role: "status",
										children: t("settingsFailed")
									}) : null, (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: MicrosoftWebIqSettingsCard_module_css_default.button,
										disabled: saveDisabled,
										onClick: () => {
											submitAll();
										},
										children: t(busy ? "savingSettings" : "saveSettings")
									})]
								})
							]
						})
					]
				}) : null]
			});
		}
		/** One package-local labelled text control. */
		function TextField(props) {
			return (0, react_jsx_runtime.jsxs)("label", {
				className: props.wide === true ? MicrosoftWebIqSettingsCard_module_css_default.fieldWide : MicrosoftWebIqSettingsCard_module_css_default.field,
				htmlFor: props.id,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: MicrosoftWebIqSettingsCard_module_css_default.label,
					children: props.label
				}), (0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: `${MicrosoftWebIqSettingsCard_module_css_default.input} ${props.invalid ? MicrosoftWebIqSettingsCard_module_css_default.invalid : ""}`,
					type: "text",
					value: props.value,
					disabled: props.disabled,
					...props.invalid ? { "aria-invalid": true } : {},
					onChange: (event) => {
						props.onChange(event.target.value);
					}
				})]
			});
		}
		/** Seed local drafts only from non-secret settings state. */
		function draftOf(settings) {
			return {
				endpoint: settings.endpoint ?? "https://api.microsoft.ai/v3/search/web",
				language: settings.language ?? "",
				region: settings.region ?? "",
				maxLength: String(settings.maxLength ?? 5e3),
				safeSearch: settings.safeSearch ?? "strict"
			};
		}
		/** Normalize one draft into the settings namespace's scalar values. */
		function patchOf(draft) {
			const language = draft.language.trim();
			const region = draft.region.trim();
			return {
				endpoint: draft.endpoint.trim(),
				language: language.length === 0 ? void 0 : language,
				region: region.length === 0 ? void 0 : region,
				maxLength: Number(draft.maxLength.trim()),
				safeSearch: draft.safeSearch
			};
		}
		/** Compare normalized drafts against the resolved settings currently shown. */
		function sameSettings(draft, settings) {
			const patch = patchOf(draft);
			return patch.endpoint === (settings.endpoint ?? "https://api.microsoft.ai/v3/search/web") && patch.language === settings.language && patch.region === settings.region && patch.maxLength === (settings.maxLength ?? 5e3) && patch.safeSearch === (settings.safeSearch ?? "strict");
		}
		/** Validate the constraints enforced by the Host schema before enabling save. */
		function validateDraft(draft) {
			const endpointText = draft.endpoint.trim();
			const endpoint = URL.canParse(endpointText) && new URL(endpointText).protocol === "https:";
			const language = draft.language.trim() === "" || /^[A-Za-z]{2}$/u.test(draft.language.trim());
			const region = draft.region.trim() === "" || /^[A-Za-z]{2}$/u.test(draft.region.trim());
			const maxLength = Number.isInteger(Number(draft.maxLength.trim())) && Number(draft.maxLength.trim()) >= 1 && Number(draft.maxLength.trim()) <= 5e5;
			return {
				valid: endpoint && language && region && maxLength,
				endpoint,
				language,
				region,
				maxLength
			};
		}
		//#endregion
		//#region lib/types/client/controller.js
		/** Browser-side state controller for Microsoft Web IQ configuration. */
		const DEFAULT_API_KEY_REF = "MICROSOFT_WEBIQ_API_KEY";
		const PROVIDER_ID = "microsoft-webiq";
		/** Coordinate the provider namespace, shared selection namespace, and credential domain. */
		var MicrosoftWebIqSettingsController = class {
			providerScope;
			webScope;
			api;
			/** Snapshot source consumed by the card. */
			store;
			credential = {
				ref: DEFAULT_API_KEY_REF,
				configured: false,
				writable: true
			};
			savingApiKey = false;
			settingDefault = false;
			savingSettings = false;
			failedAction;
			credentialGeneration = 0;
			disposed = false;
			disposers;
			/**
			* @param providerScope - provider-owned settings namespace.
			* @param webScope - shared provider-selection namespace.
			* @param api - credential wire face; key literals cross only this boundary.
			*/
			constructor(providerScope, webScope, api) {
				this.providerScope = providerScope;
				this.webScope = webScope;
				this.api = api;
				this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(this.projection());
				this.disposers = [providerScope.subscribe(() => {
					this.publish();
					this.readCredential();
				}), webScope.subscribe(() => {
					this.publish();
				})];
				this.readCredential();
			}
			/**
			* Re-read credential metadata after an external write notification.
			* @param ref - credential reference reported by the Host.
			*/
			refreshCredential(ref) {
				if (ref !== credentialRefOf(this.providerScope.getSnapshot())) return;
				this.readCredential();
			}
			/**
			* Store a replacement API key through the write-only credential RPC.
			* @param value - user-entered credential literal.
			* @returns whether a subsequent describe confirms a configured key.
			*/
			async saveApiKey(value) {
				const trimmed = value.trim();
				if (trimmed.length === 0 || this.savingApiKey || !this.credential.writable || this.disposed) return false;
				this.savingApiKey = true;
				this.failedAction = void 0;
				this.publish();
				const ref = credentialRefOf(this.providerScope.getSnapshot());
				try {
					await this.api.credentials.set({
						ref,
						value: trimmed
					});
				} catch (_credentialWriteFailure) {}
				await this.readCredential();
				const landed = ref === this.credential.ref && this.credential.configured;
				this.savingApiKey = false;
				this.failedAction = landed ? void 0 : "apiKey";
				this.publish();
				return landed;
			}
			/**
			* Select or release Microsoft Web IQ in the shared web settings namespace.
			* Releasing clears the user override so the composed default applies again.
			* @param enabled - whether Web IQ should own `web.searchProvider`.
			* @returns whether the scope confirms the requested state after settlement.
			*/
			async setDefault(enabled) {
				const snapshot = this.webScope.getSnapshot();
				if (snapshot.value?.searchProvider === PROVIDER_ID === enabled) return true;
				if (snapshot.status !== "ready" || !snapshot.writable || this.settingDefault || this.disposed) return false;
				this.settingDefault = true;
				this.failedAction = void 0;
				this.publish();
				try {
					if (enabled) await this.webScope.set("searchProvider", PROVIDER_ID);
					else await this.webScope.unset("searchProvider");
				} catch (_settingsWriteFailure) {}
				const landed = this.webScope.getSnapshot().value?.searchProvider === PROVIDER_ID === enabled;
				this.settingDefault = false;
				this.failedAction = landed ? void 0 : "default";
				this.publish();
				return landed;
			}
			/**
			* Store non-secret provider settings through their owning namespace.
			* @param patch - fields to set; `undefined` clears an override.
			* @returns whether every write is reflected by the scope after settlement.
			*/
			async saveSettings(patch) {
				const snapshot = this.providerScope.getSnapshot();
				if (snapshot.status !== "ready" || !snapshot.writable || this.savingSettings || this.disposed) return false;
				this.savingSettings = true;
				this.failedAction = void 0;
				this.publish();
				let landed = true;
				for (const [field, value] of Object.entries(patch)) {
					try {
						if (value === void 0) await this.providerScope.unset(field);
						else await this.providerScope.set(field, value);
					} catch (_settingsWriteFailure) {}
					landed = settingMatches(this.providerScope.getSnapshot(), field, value) && landed;
				}
				this.savingSettings = false;
				this.failedAction = landed ? void 0 : "settings";
				this.publish();
				return landed;
			}
			/** Stop both scope subscriptions and suppress pending credential publications. */
			dispose() {
				if (this.disposed) return;
				this.disposed = true;
				this.credentialGeneration += 1;
				for (const dispose of this.disposers) dispose();
			}
			/** Read credential metadata with generation and effective-reference fencing. */
			async readCredential() {
				const ref = credentialRefOf(this.providerScope.getSnapshot());
				if (ref !== this.credential.ref) {
					this.credential = {
						ref,
						configured: false,
						writable: true
					};
					this.publish();
				}
				const generation = ++this.credentialGeneration;
				let response;
				try {
					response = await this.api.credentials.describe({ refs: [ref] });
				} catch (_credentialReadFailure) {
					return;
				}
				if (this.disposed || generation !== this.credentialGeneration || ref !== credentialRefOf(this.providerScope.getSnapshot()) || !response.result.ok) return;
				const view = response.result.value.credentials[ref];
				this.credential = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				this.publish();
			}
			/** Build the current secret-free card state. */
			projection() {
				const provider = this.providerScope.getSnapshot();
				const web = this.webScope.getSnapshot();
				return {
					available: provider.status === "ready",
					writable: provider.writable,
					settings: provider.value ?? {},
					credentialRef: credentialRefOf(provider),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: this.credential.writable,
					isDefault: web.value?.searchProvider === PROVIDER_ID,
					defaultWritable: web.status === "ready" && web.writable,
					savingApiKey: this.savingApiKey,
					settingDefault: this.settingDefault,
					savingSettings: this.savingSettings,
					...this.failedAction === void 0 ? {} : { failedAction: this.failedAction }
				};
			}
			/** Publish a fresh projection unless the controller has been released. */
			publish() {
				if (!this.disposed) this.store.set(this.projection());
			}
		};
		/** Resolve the configured credential reference or the provider default. */
		function credentialRefOf(snapshot) {
			const ref = snapshot.value?.apiKeyEnv;
			return ref !== void 0 && ref.length > 0 ? ref : DEFAULT_API_KEY_REF;
		}
		/** Verify one settings mutation from the scope's accepted state. */
		function settingMatches(snapshot, field, expected) {
			if (expected === void 0) {
				const user = snapshot.user;
				return user === void 0 || !Object.hasOwn(user, field);
			}
			return snapshot.value?.[field] === expected;
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Locale bundles owned by the Microsoft Web IQ settings card. */
		/** English copy. */
		const en = {
			title: "Microsoft Web IQ",
			description: "Web grounding through Microsoft Web IQ.",
			expand: "Show settings",
			collapse: "Hide settings",
			apiKey: "API key",
			apiKeyHint: "Stored through the credential service. Leave blank to keep the current key.",
			apiKeySet: "A key is configured.",
			apiKeyUnset: "No key is configured.",
			apiKeyLocked: "The launch environment supplies this key, so it cannot be replaced here. Unset it in the environment to manage the key from this card.",
			apiKeyFailed: "The API key was not accepted.",
			apiSection: "API configuration",
			parameterSection: "Search parameters",
			endpoint: "Endpoint",
			language: "Language",
			region: "Region",
			maxLength: "Passage length",
			safeSearch: "SafeSearch",
			strict: "Strict",
			off: "Off",
			saveSettings: "Save configuration",
			savingSettings: "Saving...",
			invalidSettings: "Correct the invalid setting values before saving.",
			readOnly: "This deployment stores provider settings read-only.",
			settingsFailed: "The provider settings were not accepted.",
			useAsDefault: "Use Web IQ for web search",
			useAsDefaultHint: "Turned off, web_search keeps the deployment default provider.",
			settingDefault: "Applying...",
			defaultFailed: "The default search provider was not changed."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "Microsoft Web IQ",
			description: "通过 Microsoft Web IQ 提供网页检索依据。",
			expand: "展开设置",
			collapse: "收起设置",
			apiKey: "API Key",
			apiKeyHint: "通过凭据服务存储；留空表示保留当前密钥。",
			apiKeySet: "已配置密钥。",
			apiKeyUnset: "未配置密钥。",
			apiKeyLocked: "该密钥来自启动环境，无法在此替换。从环境中取消设置后，即可在本卡片中管理。",
			apiKeyFailed: "API Key 未被接受。",
			apiSection: "API 配置",
			parameterSection: "参数配置",
			endpoint: "接口地址",
			language: "语言",
			region: "地区",
			maxLength: "段落长度",
			safeSearch: "安全搜索",
			strict: "严格",
			off: "关闭",
			saveSettings: "保存配置",
			savingSettings: "正在保存...",
			invalidSettings: "请先修正无效的设置值。",
			readOnly: "本部署的提供方设置为只读。",
			settingsFailed: "提供方设置未被接受。",
			useAsDefault: "使用 Web IQ 进行网页搜索",
			useAsDefaultHint: "关闭后，web_search 仍使用本部署的默认提供方。",
			settingDefault: "正在应用...",
			defaultFailed: "默认搜索提供方未更改。"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser entry for the package-local Microsoft Web IQ settings card. */
		/** Locale namespace owned by this browser plugin. */
		const NS = "web-search.microsoft-webiq";
		/** Browser services used by this package. */
		const inject = [
			"slots",
			"locale",
			"connection",
			"remote",
			"settingsScope"
		];
		/** Mount the package-local card and its two settings scopes. */
		function apply(ctx) {
			const { api } = ctx.get("connection");
			const controller = new MicrosoftWebIqSettingsController(ctx.settingsScope.bind({ namespace: "web-search-microsoft-webiq" }), ctx.settingsScope.bind({ namespace: "web" }), api);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "web-search-microsoft-webiq: dictionary");
			ctx.effect(() => ctx.remote.$on("credentials/updated", (ref) => {
				controller.refreshCredential(ref);
			}), "web-search-microsoft-webiq: credential invalidation");
			ctx.effect(() => () => {
				controller.dispose();
			}, "web-search-microsoft-webiq: settings controller");
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "web-search-microsoft-webiq",
				order: 30,
				locale: NS,
				inject: () => ({
					hooks: { microsoftWebIqSettings: controller.store },
					saveApiKey: (value) => controller.saveApiKey(value),
					setDefault: (enabled) => controller.setDefault(enabled),
					saveSettings: (patch) => controller.saveSettings(patch)
				})
			}, MicrosoftWebIqSettingsCard));
		}
		//#endregion
		exports.MicrosoftWebIqSettingsCard = MicrosoftWebIqSettingsCard;
		exports.MicrosoftWebIqSettingsController = MicrosoftWebIqSettingsController;
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map