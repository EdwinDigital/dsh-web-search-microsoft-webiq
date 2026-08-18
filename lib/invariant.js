//#region lib/types/invariant.js
/** Package-owned invariant companion for Microsoft Web IQ search. */
const PACKAGE_NAME = "@edwindigital/dsh-web-search-microsoft-webiq";
/** Cordis companion plugin name. */
const name = "web-search-microsoft-webiq-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: this package exposes no independent event sequence or mutable data relation
* beyond contracts enforced at its owning seam.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
