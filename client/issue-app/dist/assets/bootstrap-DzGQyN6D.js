import { n as __toESM, t as __commonJSMin } from "./chunk-DP_BRqTB.js";
import { r as importShared } from "./_virtual___federation_fn_import-B7yY7AuE.js";
import { B as equal, F as __extends, L as __read, R as __spreadArray, V as invariant, Y as maybe, c as mergeOptions, f as observeOn, h as AsyncAction, l as maybeDeepFreeze, m as AsyncScheduler, o as variablesUnknownSymbol, s as preventUnhandledRejection } from "./index.production-Cp3j_UcU.js";
//#region node_modules/@apollo/client/react/context/ApolloContext.js
var React$9 = await importShared("react");
var contextKey = Symbol.for("__APOLLO_CONTEXT__");
function getApolloContext() {
	invariant("createContext" in React$9, 37);
	let context = React$9.createContext[contextKey];
	if (!context) {
		Object.defineProperty(React$9.createContext, contextKey, {
			value: context = React$9.createContext({}),
			enumerable: false,
			writable: false,
			configurable: true
		});
		context.displayName = "ApolloContext";
	}
	return context;
}
//#endregion
//#region node_modules/@apollo/client/react/context/ApolloProvider.js
var React$8 = await importShared("react");
var ApolloProvider = ({ client, children }) => {
	const ApolloContext = getApolloContext();
	const parentContext = React$8.useContext(ApolloContext);
	const context = React$8.useMemo(() => {
		return {
			...parentContext,
			client: client || parentContext.client
		};
	}, [parentContext, client]);
	invariant(context.client, 38);
	return React$8.createElement(ApolloContext.Provider, { value: context }, children);
};
//#endregion
//#region node_modules/@apollo/client/react/hooks/useApolloClient.js
var React$7 = await importShared("react");
/**
* @example
*
* ```jsx
* import { useApolloClient } from "@apollo/client/react";
*
* function SomeComponent() {
*   const client = useApolloClient();
*   // `client` is now set to the `ApolloClient` instance being used by the
*   // application (that was configured using something like `ApolloProvider`)
* }
* ```
*
* @returns The `ApolloClient` instance being used by the application.
*/
function useApolloClient(override) {
	const context = React$7.useContext(getApolloContext());
	const client = override || context.client;
	invariant(!!client, 28);
	return client;
}
//#endregion
//#region node_modules/@apollo/client/utilities/internal/canUseDOM.js
/**
* @internal
* 
* @deprecated This is an internal API and should not be used directly. This can be removed or changed at any time.
*/
var canUseDOM = typeof maybe(() => window.document.createElement) === "function";
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/Immediate.js
var nextHandle = 1;
var resolved;
var activeHandles = {};
function findAndClearHandle(handle) {
	if (handle in activeHandles) {
		delete activeHandles[handle];
		return true;
	}
	return false;
}
var Immediate = {
	setImmediate: function(cb) {
		var handle = nextHandle++;
		activeHandles[handle] = true;
		if (!resolved) resolved = Promise.resolve();
		resolved.then(function() {
			return findAndClearHandle(handle) && cb();
		});
		return handle;
	},
	clearImmediate: function(handle) {
		findAndClearHandle(handle);
	}
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduler/immediateProvider.js
var setImmediate = Immediate.setImmediate, clearImmediate = Immediate.clearImmediate;
var immediateProvider = {
	setImmediate: function() {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
		var delegate = immediateProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
	},
	clearImmediate: function(handle) {
		var delegate = immediateProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
	},
	delegate: void 0
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduler/AsapAction.js
var AsapAction = function(_super) {
	__extends(AsapAction, _super);
	function AsapAction(scheduler, work) {
		var _this = _super.call(this, scheduler, work) || this;
		_this.scheduler = scheduler;
		_this.work = work;
		return _this;
	}
	AsapAction.prototype.requestAsyncId = function(scheduler, id, delay) {
		if (delay === void 0) delay = 0;
		if (delay !== null && delay > 0) return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
		scheduler.actions.push(this);
		return scheduler._scheduled || (scheduler._scheduled = immediateProvider.setImmediate(scheduler.flush.bind(scheduler, void 0)));
	};
	AsapAction.prototype.recycleAsyncId = function(scheduler, id, delay) {
		var _a;
		if (delay === void 0) delay = 0;
		if (delay != null ? delay > 0 : this.delay > 0) return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
		var actions = scheduler.actions;
		if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
			immediateProvider.clearImmediate(id);
			if (scheduler._scheduled === id) scheduler._scheduled = void 0;
		}
	};
	return AsapAction;
}(AsyncAction);
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduler/asap.js
var asapScheduler = new (function(_super) {
	__extends(AsapScheduler, _super);
	function AsapScheduler() {
		return _super !== null && _super.apply(this, arguments) || this;
	}
	AsapScheduler.prototype.flush = function(action) {
		this._active = true;
		var flushId = this._scheduled;
		this._scheduled = void 0;
		var actions = this.actions;
		var error;
		action = action || actions.shift();
		do
			if (error = action.execute(action.state, action.delay)) break;
		while ((action = actions[0]) && action.id === flushId && actions.shift());
		this._active = false;
		if (error) {
			while ((action = actions[0]) && action.id === flushId && actions.shift()) action.unsubscribe();
			throw error;
		}
	};
	return AsapScheduler;
}(AsyncScheduler))(AsapAction);
//#endregion
//#region node_modules/@apollo/client/react/hooks/internal/useDeepMemo.js
var React$6 = await importShared("react");
function useDeepMemo(memoFn, deps) {
	const ref = React$6.useRef(void 0);
	if (!ref.current || !equal(ref.current.deps, deps)) ref.current = {
		value: memoFn(),
		deps
	};
	return ref.current.value;
}
//#endregion
//#region node_modules/@apollo/client/react/hooks/constants.js
var skipToken = Symbol.for("apollo.skipToken");
//#endregion
//#region node_modules/@apollo/client/react/internal/index.js
var wrapperSymbol = Symbol.for("apollo.hook.wrappers");
//#endregion
//#region node_modules/@apollo/client/react/hooks/internal/wrapHook.js
var React$5 = await importShared("react");
/**
* @internal
*
* Makes an Apollo Client hook "wrappable".
* That means that the Apollo Client instance can expose a "wrapper" that will be
* used to wrap the original hook implementation with additional logic.
* @example
*
* ```tsx
* // this is already done in `@apollo/client` for all wrappable hooks (see `WrappableHooks`)
* // following this pattern
* function useQuery() {
*   return wrapHook('useQuery', _useQuery, options.client)(query, options);
* }
* function _useQuery(query, options) {
*   // original implementation
* }
*
* // this is what a library like `@apollo/client-react-streaming` would do
* class ApolloClientWithStreaming extends ApolloClient {
*   constructor(options) {
*     super(options);
*     this.queryManager[Symbol.for("apollo.hook.wrappers")] = {
*       useQuery: (original) => (query, options) => {
*         console.log("useQuery was called with options", options);
*         return original(query, options);
*       }
*     }
*   }
* }
*
* // this will now log the options and then call the original `useQuery`
* const client = new ApolloClientWithStreaming({ ... });
* useQuery(query, { client });
* ```
* 
* @deprecated This is an internal API and should not be used directly. This can be removed or changed at any time.
*/
function wrapHook(hookName, useHook, clientOrObsQuery) {
	const wrapperSources = [clientOrObsQuery["queryManager"], hookName.startsWith("use") ? React$5.useContext(getApolloContext()) : void 0];
	let wrapped = useHook;
	for (const source of wrapperSources) {
		const wrapper = source?.[wrapperSymbol]?.[hookName];
		if (wrapper) wrapped = wrapper(wrapped);
	}
	return wrapped;
}
//#endregion
//#region node_modules/@apollo/client/react/hooks/internal/useIsomorphicLayoutEffect.js
var React$4 = await importShared("react");
var useIsomorphicLayoutEffect = canUseDOM ? React$4.useLayoutEffect : React$4.useEffect;
//#endregion
//#region node_modules/@apollo/client/react/hooks/useSyncExternalStore.js
var React$3 = await importShared("react");
var realHook = React$3["useSyncExternalStore"];
var isReactNative = maybe(() => navigator.product) == "ReactNative";
var usingJSDOM = maybe(() => navigator.userAgent.indexOf("jsdom") >= 0) || false;
var canUseLayoutEffect = (canUseDOM || isReactNative) && !usingJSDOM;
var useSyncExternalStore = realHook || ((subscribe, getSnapshot, getServerSnapshot) => {
	const value = getSnapshot();
	const [{ inst }, forceUpdate] = React$3.useState({ inst: {
		value,
		getSnapshot
	} });
	if (canUseLayoutEffect) React$3.useLayoutEffect(() => {
		Object.assign(inst, {
			value,
			getSnapshot
		});
		if (checkIfSnapshotChanged(inst)) forceUpdate({ inst });
	}, [
		subscribe,
		value,
		getSnapshot
	]);
	else Object.assign(inst, {
		value,
		getSnapshot
	});
	React$3.useEffect(() => {
		if (checkIfSnapshotChanged(inst)) forceUpdate({ inst });
		return subscribe(function handleStoreChange() {
			if (checkIfSnapshotChanged(inst)) forceUpdate({ inst });
		});
	}, [subscribe]);
	return value;
});
function checkIfSnapshotChanged({ value, getSnapshot }) {
	try {
		return value !== getSnapshot();
	} catch {
		return true;
	}
}
//#endregion
//#region node_modules/@apollo/client/react/hooks/useMutation.js
var React$2 = await importShared("react");
/**
* > Refer to the [Mutations](https://www.apollographql.com/docs/react/data/mutations/) section for a more in-depth overview of `useMutation`.
*
* @example
*
* ```jsx
* import { gql, useMutation } from "@apollo/client";
*
* const ADD_TODO = gql`
*   mutation AddTodo($type: String!) {
*     addTodo(type: $type) {
*       id
*       type
*     }
*   }
* `;
*
* function AddTodo() {
*   let input;
*   const [addTodo, { data }] = useMutation(ADD_TODO);
*
*   return (
*     <div>
*       <form
*         onSubmit={(e) => {
*           e.preventDefault();
*           addTodo({ variables: { type: input.value } });
*           input.value = "";
*         }}
*       >
*         <input
*           ref={(node) => {
*             input = node;
*           }}
*         />
*         <button type="submit">Add Todo</button>
*       </form>
*     </div>
*   );
* }
* ```
*
* @param mutation - A GraphQL mutation document parsed into an AST by `gql`.
* @param options - Options to control how the mutation is executed.
* @returns A tuple in the form of `[mutate, result]`
*/
function useMutation(mutation, options) {
	const client = useApolloClient(options?.client);
	const [result, setResult] = React$2.useState(() => createInitialResult(client));
	const ref = React$2.useRef({
		result,
		mutationId: 0,
		isMounted: true,
		client,
		mutation,
		options
	});
	useIsomorphicLayoutEffect(() => {
		Object.assign(ref.current, {
			client,
			options,
			mutation
		});
	});
	const execute = React$2.useCallback((executeOptions = {}) => {
		const { options, mutation } = ref.current;
		const baseOptions = {
			...options,
			mutation
		};
		const client = executeOptions.client || ref.current.client;
		const context = typeof executeOptions.context === "function" ? executeOptions.context(options?.context) : executeOptions.context;
		if (!ref.current.result.loading && ref.current.isMounted) setResult(ref.current.result = {
			loading: true,
			error: void 0,
			data: void 0,
			called: true,
			client
		});
		const mutationId = ++ref.current.mutationId;
		const clientOptions = mergeOptions(baseOptions, {
			...executeOptions,
			context
		});
		return preventUnhandledRejection(client.mutate(clientOptions).then((response) => {
			const { data, error } = response;
			const onError = executeOptions.onError || ref.current.options?.onError;
			if (error && onError) onError(error, clientOptions);
			if (mutationId === ref.current.mutationId) {
				const result = {
					called: true,
					loading: false,
					data,
					error,
					client
				};
				if (ref.current.isMounted && !equal(ref.current.result, result)) setResult(ref.current.result = result);
			}
			const onCompleted = executeOptions.onCompleted || ref.current.options?.onCompleted;
			if (!error) onCompleted?.(response.data, clientOptions);
			return response;
		}, (error) => {
			if (mutationId === ref.current.mutationId && ref.current.isMounted) {
				const result = {
					loading: false,
					error,
					data: void 0,
					called: true,
					client
				};
				if (!equal(ref.current.result, result)) setResult(ref.current.result = result);
			}
			const onError = executeOptions.onError || ref.current.options?.onError;
			if (onError) onError(error, clientOptions);
			throw error;
		}));
	}, []);
	const reset = React$2.useCallback(() => {
		if (ref.current.isMounted) {
			const result = createInitialResult(ref.current.client);
			Object.assign(ref.current, {
				mutationId: 0,
				result
			});
			setResult(result);
		}
	}, []);
	React$2.useEffect(() => {
		const current = ref.current;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);
	return [execute, {
		reset,
		...result
	}];
}
function createInitialResult(client) {
	return {
		data: void 0,
		error: void 0,
		called: false,
		loading: false,
		client
	};
}
//#endregion
//#region node_modules/@apollo/client/react/hooks/useQuery.js
/**
* Function parameters in this file try to follow a common order for the sake of
* readability and consistency. The order is as follows:
*
* resultData
* observable
* client
* query
* options
* watchQueryOptions
* makeWatchQueryOptions
*/
/**  */
var React$1 = await importShared("react");
var { NetworkStatus } = await importShared("@apollo/client");
var lastWatchOptions = Symbol();
function useQuery(query, ...[options]) {
	"use no memo";
	return wrapHook("useQuery", useQuery_, useApolloClient(typeof options === "object" ? options.client : void 0))(query, options);
}
function useQuery_(query, options = {}) {
	const client = useApolloClient(typeof options === "object" ? options.client : void 0);
	const { ssr } = typeof options === "object" ? options : {};
	const watchQueryOptions = useOptions(query, options, client.defaultOptions.watchQuery);
	function createState(previous) {
		const observable = client.watchQuery(watchQueryOptions);
		return {
			client,
			query,
			observable,
			resultData: {
				current: observable.getCurrentResult(),
				previousData: previous?.resultData.current.data,
				variables: observable.variables
			}
		};
	}
	let [state, setState] = React$1.useState(createState);
	if (client !== state.client || query !== state.query) setState(state = createState(state));
	const { observable, resultData } = state;
	useInitialFetchPolicyIfNecessary(watchQueryOptions, observable);
	useResubscribeIfNecessary(resultData, observable, watchQueryOptions);
	const result = useResult(observable, resultData, ssr);
	const obsQueryFields = React$1.useMemo(() => ({
		refetch: observable.refetch.bind(observable),
		fetchMore: observable.fetchMore.bind(observable),
		updateQuery: observable.updateQuery.bind(observable),
		startPolling: observable.startPolling.bind(observable),
		stopPolling: observable.stopPolling.bind(observable),
		subscribeToMore: observable.subscribeToMore.bind(observable)
	}), [observable]);
	const previousData = resultData.previousData;
	return React$1.useMemo(() => {
		const { partial, ...rest } = result;
		return {
			...rest,
			client,
			observable,
			variables: observable.variables,
			previousData,
			...obsQueryFields
		};
	}, [
		result,
		client,
		observable,
		previousData,
		obsQueryFields
	]);
}
var fromSkipToken = Symbol();
function useOptions(query, options, defaultOptions) {
	return useDeepMemo(() => {
		if (options === skipToken) {
			const opts = {
				...mergeOptions(defaultOptions, {
					query,
					fetchPolicy: "standby"
				}),
				[variablesUnknownSymbol]: true
			};
			opts[fromSkipToken] = true;
			return opts;
		}
		const watchQueryOptions = mergeOptions(defaultOptions, {
			...options,
			query
		});
		if (options.skip) {
			watchQueryOptions.initialFetchPolicy = options.initialFetchPolicy || options.fetchPolicy;
			watchQueryOptions.fetchPolicy = "standby";
		}
		return watchQueryOptions;
	}, [
		query,
		options,
		defaultOptions
	]);
}
function useInitialFetchPolicyIfNecessary(watchQueryOptions, observable) {
	"use no memo";
	if (!watchQueryOptions.fetchPolicy) watchQueryOptions.fetchPolicy = observable.options.initialFetchPolicy;
}
function useResult(observable, resultData, ssr) {
	"use no memo";
	const fetchPolicy = observable.options.fetchPolicy;
	return useSyncExternalStore(React$1.useCallback((handleStoreChange) => {
		const subscription = observable.pipe(observeOn(asapScheduler)).subscribe((result) => {
			const previous = resultData.current;
			if (equal(previous, result) && equal(resultData.variables, observable.variables)) return;
			resultData.variables = observable.variables;
			if (previous.data && !equal(previous.data, result.data)) resultData.previousData = previous.data;
			resultData.current = result;
			handleStoreChange();
		});
		return () => {
			setTimeout(() => subscription.unsubscribe());
		};
	}, [observable, resultData]), () => resultData.current, () => fetchPolicy !== "standby" && ssr === false || fetchPolicy === "no-cache" ? useQuery.ssrDisabledResult : resultData.current);
}
function useResubscribeIfNecessary(resultData, observable, watchQueryOptions) {
	"use no memo";
	if (observable[lastWatchOptions] && !equal(observable[lastWatchOptions], watchQueryOptions)) {
		if (observable[lastWatchOptions][fromSkipToken] && !watchQueryOptions.initialFetchPolicy) watchQueryOptions.initialFetchPolicy = watchQueryOptions.fetchPolicy;
		if (shouldReobserve(observable[lastWatchOptions], watchQueryOptions)) observable.reobserve(watchQueryOptions);
		else observable.applyOptions(watchQueryOptions);
		const result = observable.getCurrentResult();
		if (!equal(result.data, resultData.current.data)) resultData.previousData = resultData.current.data || resultData.previousData;
		resultData.current = result;
		resultData.variables = observable.variables;
	}
	observable[lastWatchOptions] = watchQueryOptions;
}
function shouldReobserve(previousOptions, options) {
	return previousOptions.query !== options.query || !equal(previousOptions.variables, options.variables) || previousOptions.fetchPolicy !== options.fetchPolicy && (options.fetchPolicy === "standby" || previousOptions.fetchPolicy === "standby");
}
useQuery.ssrDisabledResult = maybeDeepFreeze({
	loading: true,
	data: void 0,
	dataState: "empty",
	error: void 0,
	networkStatus: NetworkStatus.loading,
	partial: true
});
//#endregion
//#region node_modules/@vis.gl/react-google-maps/dist/index.modern.mjs
var import_fast_deep_equal = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function equal(a, b) {
		if (a === b) return true;
		if (a && b && typeof a == "object" && typeof b == "object") {
			if (a.constructor !== b.constructor) return false;
			var length, i, keys;
			if (Array.isArray(a)) {
				length = a.length;
				if (length != b.length) return false;
				for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
				return true;
			}
			if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
			if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
			if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
			keys = Object.keys(a);
			length = keys.length;
			if (length !== Object.keys(b).length) return false;
			for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
			for (i = length; i-- !== 0;) {
				var key = keys[i];
				if (!equal(a[key], b[key])) return false;
			}
			return true;
		}
		return a !== a && b !== b;
	};
})))(), 1);
var React = await importShared("react");
var React__default = await importShared("react");
var { useMemo, useState: useState$4, useReducer, useCallback, useEffect, useRef: useRef$1, useContext, useLayoutEffect: useLayoutEffect$1, forwardRef, useImperativeHandle, Children, createContext } = React__default;
var { createPortal } = await importShared("react-dom");
var VERSION = "1.8.3";
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(s, e) {
	var t = {};
	for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	if (s != null && typeof Object.getOwnPropertySymbols === "function") {
		for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	}
	return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
function setScriptSrc(script, src) {
	script.src = src;
}
var bootstrap = (bootstrapParams) => {
	var bootstrapPromise;
	var script;
	var bootstrapParamsKey;
	var PRODUCT_NAME = "The Google Maps JavaScript API";
	var GOOGLE = "google";
	var IMPORT_API_NAME = "importLibrary";
	var PENDING_BOOTSTRAP_KEY = "__ib__";
	var doc = document;
	var global_ = window;
	var google_ = global_[GOOGLE] || (global_[GOOGLE] = {});
	var namespace = google_.maps || (google_.maps = {});
	var libraries = /* @__PURE__ */ new Set();
	var searchParams = new URLSearchParams();
	var triggerBootstrap = () => bootstrapPromise || (bootstrapPromise = new Promise(async (resolve, reject) => {
		await (script = doc.createElement("script"));
		searchParams.set("libraries", [...libraries] + "");
		for (bootstrapParamsKey in bootstrapParams) searchParams.set(bootstrapParamsKey.replace(/[A-Z]/g, (g) => "_" + g[0].toLowerCase()), bootstrapParams[bootstrapParamsKey]);
		searchParams.set("callback", GOOGLE + ".maps." + PENDING_BOOTSTRAP_KEY);
		setScriptSrc(script, "https://maps.googleapis.com/maps/api/js?" + searchParams);
		namespace[PENDING_BOOTSTRAP_KEY] = resolve;
		script.onerror = () => bootstrapPromise = reject(Error(PRODUCT_NAME + " could not load."));
		script.nonce = doc.querySelector("script[nonce]")?.nonce || "";
		doc.head.append(script);
	}));
	namespace[IMPORT_API_NAME] ? console.warn(PRODUCT_NAME + " only loads once. Ignoring:", bootstrapParams) : namespace[IMPORT_API_NAME] = (libraryName, ...args) => libraries.add(libraryName) && triggerBootstrap().then(() => namespace[IMPORT_API_NAME](libraryName, ...args));
};
var MSG_REPEATED_SET_OPTIONS = (options) => `The setOptions() function should only be called once. The options passed to the additional call (${JSON.stringify(options)}) will be ignored.`;
var MSG_IMPORT_LIBRARY_EXISTS = (options) => `The google.maps.importLibrary() function is already defined, and @googlemaps/js-api-loader will use the existing function instead of overwriting it. The options passed to setOptions (${JSON.stringify(options)}) will be ignored.`;
var MSG_SET_OPTIONS_NOT_CALLED = "No options were set before calling importLibrary. Make sure to configure the loader using setOptions().";
var logDevWarning = () => {};
var logDevNotice = () => {};
var setOptionsWasCalled_ = false;
/**
* Sets the options for the Maps JavaScript API.
*
* Has to be called before any library is loaded.
*
* See https://developers.google.com/maps/documentation/javascript/load-maps-js-api#required_parameters
* for the full documentation of available options.
*
* @param options The options to set.
*/
function setOptions(options) {
	if (setOptionsWasCalled_) {
		logDevWarning(MSG_REPEATED_SET_OPTIONS(options));
		return;
	}
	installImportLibrary_(options);
	setOptionsWasCalled_ = true;
}
async function importLibrary(libraryName) {
	if (!setOptionsWasCalled_) logDevWarning(MSG_SET_OPTIONS_NOT_CALLED);
	if (!window?.google?.maps?.importLibrary) throw new Error("google.maps.importLibrary is not installed.");
	return await google.maps.importLibrary(libraryName);
}
/**
* The installImportLibrary_ function makes sure that a usable version of the
* `google.maps.importLibrary` function exists.
*/
function installImportLibrary_(options) {
	const importLibraryExists = Boolean(window.google?.maps?.importLibrary);
	if (importLibraryExists) logDevNotice(MSG_IMPORT_LIBRARY_EXISTS(options));
	if (!importLibraryExists) bootstrap(options);
}
var APILoadingStatus = {
	NOT_LOADED: "NOT_LOADED",
	LOADING: "LOADING",
	LOADED: "LOADED",
	FAILED: "FAILED",
	AUTH_FAILURE: "AUTH_FAILURE"
};
var DEFAULT_SOLUTION_CHANNEL = "GMP_visgl_rgmlibrary_v1_default";
var DEFAULT_INTERNAL_USAGE_ATTRIBUTION_IDS = [`gmp_visgl_reactgooglemaps_v${VERSION}`];
var APIProviderContext = React__default.createContext(null);
var loadingStatus = APILoadingStatus.NOT_LOADED;
var serializedApiParams;
var listeners = /* @__PURE__ */ new Set();
/**
* Called to update the local status and notify the listeners for any mounted
* components.
* @internal
*/
function updateLoadingStatus(status) {
	if (status === loadingStatus) return;
	loadingStatus = status;
	listeners.forEach((listener) => listener(loadingStatus));
}
/**
* Local hook to set up the map-instance management context.
* @internal
*/
function useMapInstances() {
	const [mapInstances, setMapInstances] = useState$4({});
	const addMapInstance = (mapInstance, id = "default") => {
		setMapInstances((instances) => Object.assign(Object.assign({}, instances), { [id]: mapInstance }));
	};
	const removeMapInstance = (id = "default") => {
		setMapInstances((_a) => {
			var _b = id;
			_a[_b];
			return __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
		});
	};
	const clearMapInstances = () => {
		setMapInstances({});
	};
	return {
		mapInstances,
		addMapInstance,
		removeMapInstance,
		clearMapInstances
	};
}
/**
* local hook to set up the 3D map-instance management context.
*/
function useMap3DInstances() {
	const [map3dInstances, setMap3DInstances] = useState$4({});
	const addMap3DInstance = (map3dInstance, id = "default") => {
		setMap3DInstances((instances) => Object.assign(Object.assign({}, instances), { [id]: map3dInstance }));
	};
	const removeMap3DInstance = (id = "default") => {
		setMap3DInstances((_a) => {
			var _b = id;
			_a[_b];
			return __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
		});
	};
	const clearMap3DInstances = () => {
		setMap3DInstances({});
	};
	return {
		map3dInstances,
		addMap3DInstance,
		removeMap3DInstance,
		clearMap3DInstances
	};
}
/**
* Local hook to handle the loading of the maps API.
* @internal
*/
function useGoogleMapsApiLoader(props) {
	const { onLoad, onError, apiKey, version, libraries = [], region, language, authReferrerPolicy, channel, solutionChannel, fetchAppCheckToken } = props;
	const [status, setStatus] = useState$4(loadingStatus);
	const [loadedLibraries, addLoadedLibrary] = useReducer((loadedLibraries, action) => {
		return loadedLibraries[action.name] ? loadedLibraries : Object.assign(Object.assign({}, loadedLibraries), { [action.name]: action.value });
	}, {});
	const currentSerializedParams = useMemo(() => {
		const params = {
			apiKey,
			version,
			libraries: libraries.join(","),
			region,
			language,
			authReferrerPolicy,
			channel,
			solutionChannel
		};
		return JSON.stringify(params);
	}, [
		apiKey,
		version,
		libraries,
		region,
		language,
		authReferrerPolicy,
		channel,
		solutionChannel
	]);
	const importLibraryCallback = useCallback((name) => __awaiter(this, void 0, void 0, function* () {
		if (loadedLibraries[name]) return loadedLibraries[name];
		const res = yield importLibrary(name);
		addLoadedLibrary({
			name,
			value: res
		});
		return res;
	}), [loadedLibraries]);
	useEffect(() => {
		listeners.add(setStatus);
		setStatus(loadingStatus);
		return () => {
			listeners.delete(setStatus);
		};
	}, []);
	useEffect(() => {
		__awaiter(this, void 0, void 0, function* () {
			var _a, _b;
			try {
				if (serializedApiParams && serializedApiParams !== currentSerializedParams) console.warn("The Google Maps JavaScript API has already been loaded with different parameters. The new parameters will be ignored. If you need to use different parameters, please refresh the page.");
				const librariesToLoad = [
					"core",
					"maps",
					...libraries
				];
				if ((_b = (_a = window.google) === null || _a === void 0 ? void 0 : _a.maps) === null || _b === void 0 ? void 0 : _b.importLibrary) {
					if (!serializedApiParams) updateLoadingStatus(APILoadingStatus.LOADED);
					yield Promise.all(librariesToLoad.map((name) => importLibraryCallback(name)));
					if (onLoad) onLoad();
					return;
				}
				if (loadingStatus === APILoadingStatus.LOADING || loadingStatus === APILoadingStatus.LOADED) {
					if (loadingStatus === APILoadingStatus.LOADED && onLoad) onLoad();
					return;
				}
				serializedApiParams = currentSerializedParams;
				updateLoadingStatus(APILoadingStatus.LOADING);
				const options = Object.fromEntries(Object.entries({
					key: apiKey,
					v: version,
					libraries,
					region,
					language,
					authReferrerPolicy
				}).filter(([, value]) => value !== void 0));
				if (channel !== void 0 && channel >= 0 && channel <= 999) options.channel = String(channel);
				if (solutionChannel === void 0) options.solutionChannel = DEFAULT_SOLUTION_CHANNEL;
				else if (solutionChannel !== "") options.solutionChannel = solutionChannel;
				setOptions(options);
				yield Promise.all(librariesToLoad.map((name) => importLibraryCallback(name)));
				updateLoadingStatus(APILoadingStatus.LOADED);
				if (onLoad) onLoad();
			} catch (error) {
				updateLoadingStatus(APILoadingStatus.FAILED);
				if (onError) onError(error);
				else console.error("The Google Maps JavaScript API failed to load.", error);
			}
		});
	}, [
		currentSerializedParams,
		onLoad,
		onError,
		importLibraryCallback,
		libraries
	]);
	useEffect(() => {
		if (status !== APILoadingStatus.LOADED) return;
		const settings = google.maps.Settings.getInstance();
		if (fetchAppCheckToken) settings.fetchAppCheckToken = fetchAppCheckToken;
		else if (settings.fetchAppCheckToken) settings.fetchAppCheckToken = null;
	}, [status, fetchAppCheckToken]);
	return {
		status,
		loadedLibraries,
		importLibrary: importLibraryCallback
	};
}
function useInternalUsageAttributionIds(props) {
	return useMemo(() => props.disableUsageAttribution ? null : DEFAULT_INTERNAL_USAGE_ATTRIBUTION_IDS, [props.disableUsageAttribution]);
}
/**
* Component to wrap the components from this library and load the Google Maps JavaScript API
*/
var APIProvider = (props) => {
	const { children } = props, loaderProps = __rest(props, ["children"]);
	const { mapInstances, addMapInstance, removeMapInstance, clearMapInstances } = useMapInstances();
	const { map3dInstances, addMap3DInstance, removeMap3DInstance, clearMap3DInstances } = useMap3DInstances();
	const { status, loadedLibraries, importLibrary } = useGoogleMapsApiLoader(loaderProps);
	const internalUsageAttributionIds = useInternalUsageAttributionIds(loaderProps);
	const contextValue = useMemo(() => ({
		mapInstances,
		addMapInstance,
		removeMapInstance,
		clearMapInstances,
		map3dInstances,
		addMap3DInstance,
		removeMap3DInstance,
		clearMap3DInstances,
		status,
		loadedLibraries,
		importLibrary,
		internalUsageAttributionIds
	}), [
		mapInstances,
		addMapInstance,
		removeMapInstance,
		clearMapInstances,
		map3dInstances,
		addMap3DInstance,
		removeMap3DInstance,
		clearMap3DInstances,
		status,
		loadedLibraries,
		importLibrary,
		internalUsageAttributionIds
	]);
	return React__default.createElement(APIProviderContext.Provider, { value: contextValue }, children);
};
/**
* Sets up effects to bind event-handlers for all event-props in MapEventProps.
* @internal
*/
function useMapEvents(map, props) {
	for (const propName of eventPropNames) {
		const handler = props[propName];
		const eventType = propNameToEventType[propName];
		useEffect(() => {
			if (!map) return;
			if (!handler) return;
			const listener = google.maps.event.addListener(map, eventType, (ev) => {
				handler(createMapEvent(eventType, map, ev));
			});
			return () => listener.remove();
		}, [
			map,
			eventType,
			handler
		]);
	}
}
/**
* Create the wrapped map-events used for the event-props.
* @param type the event type as it is specified to the maps api
* @param map the map instance the event originates from
* @param srcEvent the source-event if there is one.
*/
function createMapEvent(type, map, srcEvent) {
	var _a;
	const ev = {
		type,
		map,
		detail: {},
		stoppable: false,
		stop: () => {}
	};
	if (cameraEventTypes.includes(type)) {
		const camEvent = ev;
		const center = map.getCenter();
		const zoom = map.getZoom();
		const heading = map.getHeading() || 0;
		const tilt = map.getTilt() || 0;
		const bounds = map.getBounds();
		if (!center || !bounds || !Number.isFinite(zoom)) console.warn("[createEvent] at least one of the values from the map returned undefined. This is not expected to happen. Please report an issue at https://github.com/visgl/react-google-maps/issues/new");
		camEvent.detail = {
			center: (center === null || center === void 0 ? void 0 : center.toJSON()) || {
				lat: 0,
				lng: 0
			},
			zoom: zoom || 0,
			heading,
			tilt,
			bounds: (bounds === null || bounds === void 0 ? void 0 : bounds.toJSON()) || {
				north: 90,
				east: 180,
				south: -90,
				west: -180
			}
		};
		return camEvent;
	} else if (mouseEventTypes.includes(type)) {
		if (!srcEvent) throw new Error("[createEvent] mouse events must provide a srcEvent");
		const mouseEvent = ev;
		mouseEvent.domEvent = srcEvent.domEvent;
		mouseEvent.stoppable = true;
		mouseEvent.stop = () => srcEvent.stop();
		mouseEvent.detail = {
			latLng: ((_a = srcEvent.latLng) === null || _a === void 0 ? void 0 : _a.toJSON()) || null,
			placeId: srcEvent.placeId
		};
		return mouseEvent;
	}
	return ev;
}
/**
* maps the camelCased names of event-props to the corresponding event-types
* used in the maps API.
*/
var propNameToEventType = {
	onBoundsChanged: "bounds_changed",
	onCenterChanged: "center_changed",
	onClick: "click",
	onContextmenu: "contextmenu",
	onDblclick: "dblclick",
	onDrag: "drag",
	onDragend: "dragend",
	onDragstart: "dragstart",
	onHeadingChanged: "heading_changed",
	onIdle: "idle",
	onIsFractionalZoomEnabledChanged: "isfractionalzoomenabled_changed",
	onMapCapabilitiesChanged: "mapcapabilities_changed",
	onMapTypeIdChanged: "maptypeid_changed",
	onMousemove: "mousemove",
	onMouseout: "mouseout",
	onMouseover: "mouseover",
	onProjectionChanged: "projection_changed",
	onRenderingTypeChanged: "renderingtype_changed",
	onTilesLoaded: "tilesloaded",
	onTiltChanged: "tilt_changed",
	onZoomChanged: "zoom_changed",
	onCameraChanged: "bounds_changed"
};
var cameraEventTypes = [
	"bounds_changed",
	"center_changed",
	"heading_changed",
	"tilt_changed",
	"zoom_changed"
];
var mouseEventTypes = [
	"click",
	"contextmenu",
	"dblclick",
	"mousemove",
	"mouseout",
	"mouseover"
];
var eventPropNames = Object.keys(propNameToEventType);
function useMemoized(value, isEqual) {
	const ref = useRef$1(value);
	if (!isEqual(value, ref.current)) ref.current = value;
	return ref.current;
}
function useCustomCompareEffect(effect, dependencies, isEqual) {
	useEffect(effect, [useMemoized(dependencies, isEqual)]);
}
function useDeepCompareEffect(effect, dependencies) {
	useCustomCompareEffect(effect, dependencies, import_fast_deep_equal.default);
}
var mapOptionKeys = new Set([
	"backgroundColor",
	"clickableIcons",
	"controlSize",
	"disableDefaultUI",
	"disableDoubleClickZoom",
	"draggable",
	"draggableCursor",
	"draggingCursor",
	"fullscreenControl",
	"fullscreenControlOptions",
	"gestureHandling",
	"headingInteractionEnabled",
	"isFractionalZoomEnabled",
	"keyboardShortcuts",
	"mapTypeControl",
	"mapTypeControlOptions",
	"mapTypeId",
	"maxZoom",
	"minZoom",
	"noClear",
	"panControl",
	"panControlOptions",
	"restriction",
	"rotateControl",
	"rotateControlOptions",
	"scaleControl",
	"scaleControlOptions",
	"scrollwheel",
	"streetView",
	"streetViewControl",
	"streetViewControlOptions",
	"styles",
	"tiltInteractionEnabled",
	"zoomControl",
	"zoomControlOptions"
]);
/**
* Internal hook to update the map-options when props are changed.
*
* @param map the map instance
* @param mapProps the props to update the map-instance with
* @internal
*/
function useMapOptions(map, mapProps) {
	const mapOptions = {};
	const keys = Object.keys(mapProps);
	for (const key of keys) {
		if (!mapOptionKeys.has(key)) continue;
		mapOptions[key] = mapProps[key];
	}
	useDeepCompareEffect(() => {
		if (!map) return;
		map.setOptions(mapOptions);
	}, [mapOptions]);
}
function useApiLoadingStatus() {
	var _a;
	return ((_a = useContext(APIProviderContext)) === null || _a === void 0 ? void 0 : _a.status) || APILoadingStatus.NOT_LOADED;
}
/**
* Internal hook that updates the camera when deck.gl viewState changes.
* @internal
*/
function useDeckGLCameraUpdate(map, props) {
	const { viewport, viewState } = props;
	const isDeckGlControlled = !!viewport;
	useLayoutEffect$1(() => {
		if (!map || !viewState) return;
		const { latitude, longitude, bearing: heading, pitch: tilt, zoom } = viewState;
		map.moveCamera({
			center: {
				lat: latitude,
				lng: longitude
			},
			heading,
			tilt,
			zoom: zoom + 1
		});
	}, [map, viewState]);
	return isDeckGlControlled;
}
function isLatLngLiteral(obj) {
	if (!obj || typeof obj !== "object") return false;
	if (!("lat" in obj && "lng" in obj)) return false;
	return Number.isFinite(obj.lat) && Number.isFinite(obj.lng);
}
function latLngEquals(a, b) {
	if (!a || !b) return false;
	const A = toLatLngLiteral(a);
	const B = toLatLngLiteral(b);
	if (A.lat !== B.lat || A.lng !== B.lng) return false;
	return true;
}
function toLatLngLiteral(obj) {
	if (isLatLngLiteral(obj)) return obj;
	return obj.toJSON();
}
function toLatLngBoundsLiteral(obj) {
	if ("north" in obj && "south" in obj && "east" in obj && "west" in obj) return obj;
	const ne = obj.getNorthEast().toJSON();
	const sw = obj.getSouthWest().toJSON();
	return {
		north: ne.lat,
		east: ne.lng,
		south: sw.lat,
		west: sw.lng
	};
}
function boundsEquals(a, b) {
	if (!a || !b) return false;
	const A = toLatLngBoundsLiteral(a);
	const B = toLatLngBoundsLiteral(b);
	return A.north === B.north && A.south === B.south && A.east === B.east && A.west === B.west;
}
/**
* Compares two paths (arrays of LatLng points) for equality.
*/
function pathEquals(a, b) {
	if (!a || !b) return a === b;
	const arrayB = "getArray" in b ? b.getArray() : b;
	if (a.length !== arrayB.length) return false;
	for (let i = 0; i < a.length; i++) if (!latLngEquals(a[i], arrayB[i])) return false;
	return true;
}
/**
* Compares two arrays of paths (for Polygon) for equality.
*/
function pathsEquals(a, b) {
	if (!a || !b) return a === b;
	const arrayB = "getArray" in b ? b.getArray().map((inner) => inner.getArray()) : b;
	if (a.length !== arrayB.length) return false;
	for (let i = 0; i < a.length; i++) if (!pathEquals(a[i], arrayB[i])) return false;
	return true;
}
function useMapCameraParams(map, cameraStateRef, mapProps) {
	const center = mapProps.center ? toLatLngLiteral(mapProps.center) : null;
	let lat = null;
	let lng = null;
	if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
		lat = center.lat;
		lng = center.lng;
	}
	const zoom = Number.isFinite(mapProps.zoom) ? mapProps.zoom : null;
	const heading = Number.isFinite(mapProps.heading) ? mapProps.heading : null;
	const tilt = Number.isFinite(mapProps.tilt) ? mapProps.tilt : null;
	useLayoutEffect$1(() => {
		if (!map) return;
		const nextCamera = {};
		let needsUpdate = false;
		if (lat !== null && lng !== null && (cameraStateRef.current.center.lat !== lat || cameraStateRef.current.center.lng !== lng)) {
			nextCamera.center = {
				lat,
				lng
			};
			needsUpdate = true;
		}
		if (zoom !== null && cameraStateRef.current.zoom !== zoom) {
			nextCamera.zoom = zoom;
			needsUpdate = true;
		}
		if (heading !== null && cameraStateRef.current.heading !== heading) {
			nextCamera.heading = heading;
			needsUpdate = true;
		}
		if (tilt !== null && cameraStateRef.current.tilt !== tilt) {
			nextCamera.tilt = tilt;
			needsUpdate = true;
		}
		if (needsUpdate) map.moveCamera(nextCamera);
	});
}
var AuthFailureMessage = () => {
	return React__default.createElement("div", { style: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		zIndex: 999,
		display: "flex",
		flexFlow: "column nowrap",
		textAlign: "center",
		justifyContent: "center",
		fontSize: ".8rem",
		color: "rgba(0,0,0,0.6)",
		background: "#dddddd",
		padding: "1rem 1.5rem"
	} }, React__default.createElement("h2", null, "Error: AuthFailure"), React__default.createElement("p", null, "A problem with your API key prevents the map from rendering correctly. Please make sure the value of the ", React__default.createElement("code", null, "APIProvider.apiKey"), " prop is correct. Check the error-message in the console for further details."));
};
function useCallbackRef() {
	const [el, setEl] = useState$4(null);
	return [el, useCallback((value) => setEl(value), [setEl])];
}
/**
* Hook to check if the Maps JavaScript API is loaded
*/
function useApiIsLoaded() {
	return useApiLoadingStatus() === APILoadingStatus.LOADED;
}
function useForceUpdate() {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	return forceUpdate;
}
function handleBoundsChange(map, ref) {
	const center = map.getCenter();
	const zoom = map.getZoom();
	const heading = map.getHeading() || 0;
	const tilt = map.getTilt() || 0;
	const bounds = map.getBounds();
	if (!center || !bounds || !Number.isFinite(zoom)) console.warn("[useTrackedCameraState] at least one of the values from the map returned undefined. This is not expected to happen. Please report an issue at https://github.com/visgl/react-google-maps/issues/new");
	Object.assign(ref.current, {
		center: (center === null || center === void 0 ? void 0 : center.toJSON()) || {
			lat: 0,
			lng: 0
		},
		zoom: zoom || 0,
		heading,
		tilt
	});
}
/**
* Creates a mutable ref object to track the last known state of the map camera.
* This is used in `useMapCameraParams` to reduce stuttering in normal operation
* by avoiding updates of the map camera with values that have already been processed.
*/
function useTrackedCameraStateRef(map) {
	const forceUpdate = useForceUpdate();
	const ref = useRef$1({
		center: {
			lat: 0,
			lng: 0
		},
		heading: 0,
		tilt: 0,
		zoom: 0
	});
	useEffect(() => {
		if (!map) return;
		const listener = google.maps.event.addListener(map, "bounds_changed", () => {
			handleBoundsChange(map, ref);
			forceUpdate();
		});
		return () => listener.remove();
	}, [map, forceUpdate]);
	return ref;
}
/**
* Stores a stack of map-instances for each mapId. Whenever an
* instance is used, it is removed from the stack while in use,
* and returned to the stack when the component unmounts.
* This allows us to correctly implement caching for multiple
* maps om the same page, while reusing as much as possible.
*
* FIXME: while it should in theory be possible to reuse maps solely
*   based on mapId/renderingType/colorScheme (as all other parameters can be
*   changed at runtime), we don't yet have good enough tracking of options to
*   reliably unset all the options that have been set.
*/
var CachedMapStack = class {
	static has(key) {
		return this.entries[key] && this.entries[key].length > 0;
	}
	static pop(key) {
		if (!this.entries[key]) return null;
		return this.entries[key].pop() || null;
	}
	static push(key, value) {
		if (!this.entries[key]) this.entries[key] = [];
		this.entries[key].push(value);
	}
};
CachedMapStack.entries = {};
/**
* The main hook takes care of creating map-instances and registering them in
* the api-provider context.
* @return a tuple of the map-instance created (or null) and the callback
*   ref that will be used to pass the map-container into this hook.
* @internal
*/
function useMapInstance(props, context) {
	const apiIsLoaded = useApiIsLoaded();
	const [map, setMap] = useState$4(null);
	const [container, containerRef] = useCallbackRef();
	const cameraStateRef = useTrackedCameraStateRef(map);
	const { id, defaultBounds, defaultCenter, defaultZoom, defaultHeading, defaultTilt, reuseMaps, renderingType, colorScheme } = props, mapOptions = __rest(props, [
		"id",
		"defaultBounds",
		"defaultCenter",
		"defaultZoom",
		"defaultHeading",
		"defaultTilt",
		"reuseMaps",
		"renderingType",
		"colorScheme"
	]);
	const hasZoom = props.zoom !== void 0 || props.defaultZoom !== void 0;
	const hasCenter = props.center !== void 0 || props.defaultCenter !== void 0;
	if (!defaultBounds && (!hasZoom || !hasCenter)) console.warn("<Map> component is missing configuration. You have to provide zoom and center (via the `zoom`/`defaultZoom` and `center`/`defaultCenter` props) or specify the region to show using `defaultBounds`. See https://visgl.github.io/react-google-maps/docs/api-reference/components/map#required");
	if (!mapOptions.center && defaultCenter) mapOptions.center = defaultCenter;
	if (!mapOptions.zoom && Number.isFinite(defaultZoom)) mapOptions.zoom = defaultZoom;
	if (!mapOptions.heading && Number.isFinite(defaultHeading)) mapOptions.heading = defaultHeading;
	if (!mapOptions.tilt && Number.isFinite(defaultTilt)) mapOptions.tilt = defaultTilt;
	const customIds = mapOptions.internalUsageAttributionIds;
	if (customIds == null) mapOptions.internalUsageAttributionIds = context.internalUsageAttributionIds;
	else mapOptions.internalUsageAttributionIds = [...context.internalUsageAttributionIds || [], ...customIds];
	for (const key of Object.keys(mapOptions)) if (mapOptions[key] === void 0) delete mapOptions[key];
	const savedMapStateRef = useRef$1(void 0);
	useEffect(() => {
		if (!container || !apiIsLoaded) return;
		const { addMapInstance, removeMapInstance } = context;
		const { mapId } = props;
		const cacheKey = `${mapId || "default"}:${renderingType || "default"}:${colorScheme || "LIGHT"}`;
		let mapDiv;
		let map;
		if (reuseMaps && CachedMapStack.has(cacheKey)) {
			map = CachedMapStack.pop(cacheKey);
			mapDiv = map.getDiv();
			container.appendChild(mapDiv);
			map.setOptions(mapOptions);
			setTimeout(() => map.moveCamera({}), 0);
		} else {
			mapDiv = document.createElement("div");
			mapDiv.style.height = "100%";
			container.appendChild(mapDiv);
			map = new google.maps.Map(mapDiv, Object.assign(Object.assign(Object.assign({}, mapOptions), renderingType ? { renderingType } : {}), colorScheme ? { colorScheme } : {}));
		}
		setMap(map);
		addMapInstance(map, id);
		if (defaultBounds) {
			const { padding } = defaultBounds, defBounds = __rest(defaultBounds, ["padding"]);
			map.fitBounds(defBounds, padding);
		} else if (!hasZoom || !hasCenter) map.fitBounds({
			east: 180,
			west: -180,
			south: -90,
			north: 90
		});
		if (savedMapStateRef.current) {
			const { mapId: savedMapId, cameraState: savedCameraState } = savedMapStateRef.current;
			if (savedMapId !== mapId) map.moveCamera(savedCameraState);
		}
		return () => {
			savedMapStateRef.current = {
				mapId,
				cameraState: cameraStateRef.current
			};
			mapDiv.remove();
			if (reuseMaps) CachedMapStack.push(cacheKey, map);
			else google.maps.event.clearInstanceListeners(map);
			setMap(null);
			removeMapInstance(id);
		};
	}, [
		container,
		apiIsLoaded,
		id,
		props.mapId,
		props.renderingType,
		props.colorScheme
	]);
	return [
		map,
		containerRef,
		cameraStateRef
	];
}
var GoogleMapsContext = React__default.createContext(null);
var Map = (props) => {
	const { children, id, className, style } = props;
	const context = useContext(APIProviderContext);
	const loadingStatus = useApiLoadingStatus();
	if (!context) throw new Error("<Map> can only be used inside an <ApiProvider> component.");
	const [map, mapRef, cameraStateRef] = useMapInstance(props, context);
	useMapCameraParams(map, cameraStateRef, props);
	useMapEvents(map, props);
	useMapOptions(map, props);
	const isDeckGlControlled = useDeckGLCameraUpdate(map, props);
	const isControlledExternally = !!props.controlled;
	useEffect(() => {
		if (!map) return;
		if (isDeckGlControlled) map.setOptions({ disableDefaultUI: true });
		if (isDeckGlControlled || isControlledExternally) map.setOptions({
			gestureHandling: "none",
			keyboardShortcuts: false
		});
		return () => {
			map.setOptions({
				gestureHandling: props.gestureHandling,
				keyboardShortcuts: props.keyboardShortcuts
			});
		};
	}, [
		map,
		isDeckGlControlled,
		isControlledExternally,
		props.gestureHandling,
		props.keyboardShortcuts
	]);
	const center = props.center ? toLatLngLiteral(props.center) : null;
	let lat = null;
	let lng = null;
	if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
		lat = center.lat;
		lng = center.lng;
	}
	const cameraOptions = useMemo(() => {
		var _a, _b, _c;
		return {
			center: {
				lat: lat !== null && lat !== void 0 ? lat : 0,
				lng: lng !== null && lng !== void 0 ? lng : 0
			},
			zoom: (_a = props.zoom) !== null && _a !== void 0 ? _a : 0,
			heading: (_b = props.heading) !== null && _b !== void 0 ? _b : 0,
			tilt: (_c = props.tilt) !== null && _c !== void 0 ? _c : 0
		};
	}, [
		lat,
		lng,
		props.zoom,
		props.heading,
		props.tilt
	]);
	useLayoutEffect$1(() => {
		if (!map || !isControlledExternally) return;
		map.moveCamera(cameraOptions);
		const listener = map.addListener("bounds_changed", () => {
			map.moveCamera(cameraOptions);
		});
		return () => listener.remove();
	}, [
		map,
		isControlledExternally,
		cameraOptions
	]);
	const combinedStyle = useMemo(() => Object.assign({
		width: "100%",
		height: "100%",
		position: "relative",
		zIndex: isDeckGlControlled ? -1 : 0
	}, style), [style, isDeckGlControlled]);
	const contextValue = useMemo(() => ({ map }), [map]);
	if (loadingStatus === APILoadingStatus.AUTH_FAILURE) return React__default.createElement("div", {
		style: Object.assign({ position: "relative" }, className ? {} : combinedStyle),
		className
	}, React__default.createElement(AuthFailureMessage, null));
	return React__default.createElement("div", Object.assign({
		ref: mapRef,
		"data-testid": "map",
		style: className ? void 0 : combinedStyle,
		className
	}, id ? { id } : {}), map ? React__default.createElement(GoogleMapsContext.Provider, { value: contextValue }, children) : null);
};
Map.deckGLViewProps = true;
var shownMessages = /* @__PURE__ */ new Set();
function logErrorOnce(...args) {
	const key = JSON.stringify(args);
	if (!shownMessages.has(key)) {
		shownMessages.add(key);
		console.error(...args);
	}
}
/**
* Retrieves a map-instance from the context. This is either an instance
* identified by id or the parent map instance if no id is specified.
* Returns null if neither can be found.
*/
var useMap = (id = null) => {
	const ctx = useContext(APIProviderContext);
	const { map } = useContext(GoogleMapsContext) || {};
	if (ctx === null) {
		logErrorOnce("useMap(): failed to retrieve APIProviderContext. Make sure that the <APIProvider> component exists and that the component you are calling `useMap()` from is a sibling of the <APIProvider>.");
		return null;
	}
	const { mapInstances } = ctx;
	if (id !== null) return mapInstances[id] || null;
	if (map) return map;
	return mapInstances["default"] || null;
};
function useMapsLibrary(name) {
	const apiIsLoaded = useApiIsLoaded();
	const ctx = useContext(APIProviderContext);
	useEffect(() => {
		if (!apiIsLoaded || !ctx) return;
		ctx.importLibrary(name);
	}, [
		apiIsLoaded,
		ctx,
		name
	]);
	return (ctx === null || ctx === void 0 ? void 0 : ctx.loadedLibraries[name]) || null;
}
var _a;
var { useLayoutEffect, useRef } = React;
var useBeforeEffect = (_a = React.useInsertionEffect) !== null && _a !== void 0 ? _a : useLayoutEffect;
function forbiddenInRender() {
	throw new Error("useEffectEvent: invalid call during rendering.");
}
function useEffectEventPolyfill(fn) {
	/**
	* Initialize the ref with `forbiddenInRender`, to catch illegal calls during
	* rendering. After the insertion effect ran, the ref will contain the actual
	* function, so all effects can see the actual value.
	*/
	const ref = useRef(forbiddenInRender);
	useBeforeEffect(() => {
		ref.current = fn;
	}, [fn]);
	return ((...args) => ref.current(...args));
}
/**
* Uses a polyfill implementation of `useEffectEvent`. The native useEffectEvent
* implementation was causing issues that we do not fully understand yet.
*/
var useEffectEvent = useEffectEventPolyfill;
var noop$1 = () => {};
/**
* Internally used to bind events to Maps JavaScript API objects.
* @internal
*/
function useMapsEventListener(target, name, callback) {
	const eventFn = useEffectEvent(callback !== null && callback !== void 0 ? callback : noop$1);
	const isCallbackDefined = Boolean(callback);
	useEffect(() => {
		if (!target || !name || !isCallbackDefined) return;
		const listener = google.maps.event.addListener(target, name, eventFn);
		return () => listener.remove();
	}, [
		target,
		name,
		isCallbackDefined
	]);
}
/**
* Internally used to copy values from props into API-Objects
* whenever they change.
*
* @example
*   usePropBinding(marker, 'position', position);
*
* @internal
*/
function usePropBinding(object, prop, value) {
	useEffect(() => {
		if (!object) return;
		object[prop] = value;
	}, [
		object,
		prop,
		value
	]);
}
var noop = () => {};
/**
* Internally used to bind events to DOM nodes.
* @internal
*/
function useDomEventListener(target, name, callback) {
	const eventFn = useEffectEvent(callback !== null && callback !== void 0 ? callback : noop);
	const isCallbackDefined = Boolean(callback);
	useEffect(() => {
		if (!target || !name || !isCallbackDefined) return;
		const listenerCallback = eventFn;
		target.addEventListener(name, listenerCallback);
		return () => target.removeEventListener(name, listenerCallback);
	}, [
		target,
		name,
		isCallbackDefined
	]);
}
var GlobalStyleManager = class {
	constructor() {
		this.renderedStyles = /* @__PURE__ */ new Set();
		this.styleElement = null;
	}
	getStyleElement() {
		if (!this.styleElement) {
			this.styleElement = document.createElement("style");
			this.styleElement.setAttribute("data-rgm-anchor-styles", "");
			document.head.appendChild(this.styleElement);
		}
		return this.styleElement;
	}
	addAdvancedMarkerPointerEventsOverwrite() {
		if (this.renderedStyles.has("marker-pointer-events")) return;
		const styleElement = this.getStyleElement();
		styleElement.textContent += `
      gmp-advanced-marker[data-origin='rgm'] {
        pointer-events: none !important;
      }
    `;
		this.renderedStyles.add("marker-pointer-events");
	}
	cleanup() {
		if (this.styleElement) {
			this.styleElement.remove();
			this.styleElement = null;
			this.renderedStyles.clear();
		}
	}
};
var globalStyleManager = new GlobalStyleManager();
function isVersionGreaterEqual(major, minor) {
	var _a;
	if (!((_a = google === null || google === void 0 ? void 0 : google.maps) === null || _a === void 0 ? void 0 : _a.version)) return void 0;
	const version = google.maps.version.split(".");
	const currentMajor = parseInt(version[0], 10);
	const currentMinor = parseInt(version[1], 10);
	return currentMajor > major || currentMajor === major && currentMinor >= minor;
}
var AdvancedMarkerContext = React__default.createContext(null);
/**
* @deprecated Using `anchorPosition` is deprecated.
*   Use `anchorLeft` and `anchorTop` instead.
*/
var AdvancedMarkerAnchorPoint = {
	TOP_LEFT: ["0%", "0%"],
	TOP_CENTER: ["50%", "0%"],
	TOP: ["50%", "0%"],
	TOP_RIGHT: ["100%", "0%"],
	LEFT_CENTER: ["0%", "50%"],
	LEFT_TOP: ["0%", "0%"],
	LEFT: ["0%", "50%"],
	LEFT_BOTTOM: ["0%", "100%"],
	RIGHT_TOP: ["100%", "0%"],
	RIGHT: ["100%", "50%"],
	RIGHT_CENTER: ["100%", "50%"],
	RIGHT_BOTTOM: ["100%", "100%"],
	BOTTOM_LEFT: ["0%", "100%"],
	BOTTOM_CENTER: ["50%", "100%"],
	BOTTOM: ["50%", "100%"],
	BOTTOM_RIGHT: ["100%", "100%"],
	CENTER: ["50%", "50%"]
};
var AdvancedMarker = forwardRef((props, ref) => {
	const { children, style, className, anchorPoint } = props;
	const [marker, contentContainer] = useAdvancedMarker(props);
	const advancedMarkerContextValue = useMemo(() => marker ? { marker } : null, [marker]);
	useImperativeHandle(ref, () => marker, [marker]);
	if (!contentContainer) return null;
	return React__default.createElement(AdvancedMarkerContext.Provider, { value: advancedMarkerContextValue }, createPortal(React__default.createElement(MarkerContent, {
		anchorPoint,
		styles: style,
		className
	}, children), contentContainer));
});
AdvancedMarker.displayName = "AdvancedMarker";
function isElementNode(node) {
	return node.nodeType === Node.ELEMENT_NODE;
}
var MarkerContent = ({ children, styles, className }) => {
	return React__default.createElement("div", {
		className,
		style: styles
	}, children);
};
function useAdvancedMarker(props) {
	const [marker, setMarker] = useState$4(null);
	const [contentContainer, setContentContainer] = useState$4(null);
	const map = useMap();
	const markerLibrary = useMapsLibrary("marker");
	const { children, onClick, className, onMouseEnter, onMouseLeave, onDrag, onDragStart, onDragEnd, collisionBehavior, clickable, draggable, position, title, zIndex, anchorPoint, anchorLeft, anchorTop } = props;
	const numChildren = Children.count(children);
	useEffect(() => {
		if (!map || !markerLibrary) return;
		const newMarker = new markerLibrary.AdvancedMarkerElement();
		newMarker.map = map;
		setMarker(newMarker);
		let contentElement = null;
		if (numChildren > 0) {
			contentElement = document.createElement("div");
			newMarker.content = contentElement;
			setContentContainer(contentElement);
		}
		return () => {
			newMarker.map = null;
			contentElement === null || contentElement === void 0 || contentElement.remove();
			setMarker(null);
			setContentContainer(null);
		};
	}, [
		map,
		markerLibrary,
		numChildren
	]);
	useEffect(() => {
		if (!(marker === null || marker === void 0 ? void 0 : marker.content) || !isElementNode(marker.content) || numChildren > 0) return;
		marker.content.className = className !== null && className !== void 0 ? className : "";
	}, [
		marker,
		className,
		numChildren
	]);
	useAdvancedMarkerAnchoring(marker, anchorPoint, anchorLeft, anchorTop, numChildren > 0);
	usePropBinding(marker, "position", position);
	usePropBinding(marker, "title", title !== null && title !== void 0 ? title : "");
	usePropBinding(marker, "zIndex", zIndex);
	usePropBinding(marker, "collisionBehavior", collisionBehavior);
	useEffect(() => {
		if (!marker) return;
		if (draggable !== void 0) marker.gmpDraggable = draggable;
		else if (onDrag || onDragStart || onDragEnd) marker.gmpDraggable = true;
		else marker.gmpDraggable = false;
	}, [
		marker,
		draggable,
		onDrag,
		onDragEnd,
		onDragStart
	]);
	useEffect(() => {
		if (!marker) return;
		const gmpClickable = clickable !== void 0 ? clickable : Boolean(onClick) || Boolean(onMouseEnter) || Boolean(onMouseLeave);
		marker.gmpClickable = gmpClickable;
		if (gmpClickable && (marker === null || marker === void 0 ? void 0 : marker.content) && isElementNode(marker.content)) {
			marker.content.style.pointerEvents = "all";
			if (onClick) marker.content.style.cursor = "pointer";
		}
	}, [
		marker,
		clickable,
		onClick,
		onMouseEnter,
		onMouseLeave
	]);
	useMapsEventListener(marker, "click", onClick);
	useMapsEventListener(marker, "drag", onDrag);
	useMapsEventListener(marker, "dragstart", onDragStart);
	useMapsEventListener(marker, "dragend", onDragEnd);
	useDomEventListener(marker === null || marker === void 0 ? void 0 : marker.element, "mouseenter", onMouseEnter);
	useDomEventListener(marker === null || marker === void 0 ? void 0 : marker.element, "mouseleave", onMouseLeave);
	return [marker, contentContainer];
}
function useAdvancedMarkerAnchoring(marker, anchorPoint, anchorLeft, anchorTop, hasChildren) {
	useEffect(() => {
		if (!marker || !hasChildren) return;
		const anchorOptionsSupported = isVersionGreaterEqual(3, 62);
		const contentElement = marker.content;
		if (!contentElement || !isElementNode(contentElement)) return;
		if (anchorLeft !== void 0 || anchorTop !== void 0) {
			if (!anchorOptionsSupported) console.warn(`AdvancedMarker: The anchorLeft and anchorTop props are only supported in Google Maps API version 3.62 and above. The current version is ${google.maps.version}.`);
			marker.anchorLeft = anchorLeft;
			marker.anchorTop = anchorTop;
			if (anchorPoint !== void 0) console.warn("AdvancedMarker: the anchorPoint prop is ignored when anchorLeft and/or anchorTop are set.");
			return;
		}
		if (anchorPoint !== void 0) {
			const [x, y] = anchorPoint !== null && anchorPoint !== void 0 ? anchorPoint : AdvancedMarkerAnchorPoint["BOTTOM"];
			const translateX = `calc(-1 * ${x})`;
			const translateY = `calc(-1 * ${y})`;
			if (anchorOptionsSupported) {
				marker.anchorLeft = translateX;
				marker.anchorTop = translateY;
				contentElement.style.transform = "";
			} else {
				contentElement.style.transform = `translate(50%, 100%) translate(${translateX}, ${translateY})`;
				marker.dataset.origin = "rgm";
				globalStyleManager.addAdvancedMarkerPointerEventsOverwrite();
			}
		}
	}, [
		marker,
		anchorPoint,
		anchorLeft,
		anchorTop,
		hasChildren
	]);
}
function useCircle(props) {
	var _a, _b, _c;
	const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onRadiusChanged, onCenterChanged, center, defaultCenter, radius, defaultRadius } = props, destructuredOptions = __rest(props, [
		"onClick",
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onMouseOver",
		"onMouseOut",
		"onRadiusChanged",
		"onCenterChanged",
		"center",
		"defaultCenter",
		"radius",
		"defaultRadius"
	]);
	const [circle, setCircle] = useState$4(null);
	const map = useMap();
	const circleOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), {
		clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick),
		draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onCenterChanged),
		editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onRadiusChanged)
	}), import_fast_deep_equal.default);
	useEffect(() => {
		if (!map) {
			if (map === void 0) console.error("<Circle> has to be inside a Map component.");
			return;
		}
		const newCircle = new google.maps.Circle(Object.assign(Object.assign({}, circleOptions), {
			center: center !== null && center !== void 0 ? center : defaultCenter,
			radius: radius !== null && radius !== void 0 ? radius : defaultRadius
		}));
		newCircle.setMap(map);
		setCircle(newCircle);
		return () => {
			newCircle.setMap(null);
			setCircle(null);
		};
	}, [map]);
	useMapsEventListener(circle, "click", onClick);
	useMapsEventListener(circle, "drag", onDrag);
	useMapsEventListener(circle, "dragstart", onDragStart);
	useMapsEventListener(circle, "dragend", onDragEnd);
	useMapsEventListener(circle, "mouseover", onMouseOver);
	useMapsEventListener(circle, "mouseout", onMouseOut);
	useMapsEventListener(circle, "radius_changed", onRadiusChanged ? () => {
		const newRadius = circle === null || circle === void 0 ? void 0 : circle.getRadius();
		if (newRadius !== void 0) onRadiusChanged(newRadius);
	} : null);
	useMapsEventListener(circle, "center_changed", onCenterChanged ? () => {
		onCenterChanged(circle === null || circle === void 0 ? void 0 : circle.getCenter());
	} : null);
	useEffect(() => {
		if (!circle) return;
		circle.setOptions(circleOptions);
	}, [circle, circleOptions]);
	useEffect(() => {
		if (!circle || !center) return;
		if (!latLngEquals(center, circle.getCenter())) circle.setCenter(center);
	}, [circle, center]);
	useEffect(() => {
		if (!circle || radius === void 0) return;
		if (radius !== circle.getRadius()) circle.setRadius(radius);
	}, [circle, radius]);
	return circle;
}
var Circle = forwardRef((props, ref) => {
	const circle = useCircle(props);
	useImperativeHandle(ref, () => circle, [circle]);
	return React__default.createElement(React__default.Fragment, null);
});
Circle.displayName = "Circle";
function setValueForStyles(element, styles, prevStyles) {
	if (styles != null && typeof styles !== "object") throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
	const elementStyle = element.style;
	if (prevStyles == null) {
		if (styles == null) return;
		for (const styleName in styles) {
			if (!styles.hasOwnProperty(styleName)) continue;
			setValueForStyle(elementStyle, styleName, styles[styleName]);
		}
		return;
	}
	for (const styleName in prevStyles) if (prevStyles.hasOwnProperty(styleName) && (styles == null || !styles.hasOwnProperty(styleName))) if (styleName.indexOf("--") === 0) elementStyle.setProperty(styleName, "");
	else if (styleName === "float") elementStyle.cssFloat = "";
	else elementStyle[styleName] = "";
	if (styles == null) return;
	for (const styleName in styles) {
		const value = styles[styleName];
		if (styles.hasOwnProperty(styleName) && prevStyles[styleName] !== value) setValueForStyle(elementStyle, styleName, value);
	}
}
function setValueForStyle(elementStyle, styleName, value) {
	const isCustomProperty = styleName.indexOf("--") === 0;
	if (value == null || typeof value === "boolean" || value === "") if (isCustomProperty) elementStyle.setProperty(styleName, "");
	else if (styleName === "float") elementStyle.cssFloat = "";
	else elementStyle[styleName] = "";
	else if (isCustomProperty) elementStyle.setProperty(styleName, value);
	else if (typeof value === "number" && value !== 0 && !isUnitlessNumber(styleName)) elementStyle[styleName] = value + "px";
	else if (styleName === "float") elementStyle.cssFloat = value;
	else elementStyle[styleName] = ("" + value).trim();
}
var unitlessNumbers = new Set([
	"animationIterationCount",
	"aspectRatio",
	"borderImageOutset",
	"borderImageSlice",
	"borderImageWidth",
	"boxFlex",
	"boxFlexGroup",
	"boxOrdinalGroup",
	"columnCount",
	"columns",
	"flex",
	"flexGrow",
	"flexPositive",
	"flexShrink",
	"flexNegative",
	"flexOrder",
	"gridArea",
	"gridRow",
	"gridRowEnd",
	"gridRowSpan",
	"gridRowStart",
	"gridColumn",
	"gridColumnEnd",
	"gridColumnSpan",
	"gridColumnStart",
	"fontWeight",
	"lineClamp",
	"lineHeight",
	"opacity",
	"order",
	"orphans",
	"scale",
	"tabSize",
	"widows",
	"zIndex",
	"zoom",
	"fillOpacity",
	"floodOpacity",
	"stopOpacity",
	"strokeDasharray",
	"strokeDashoffset",
	"strokeMiterlimit",
	"strokeOpacity",
	"strokeWidth"
]);
function isUnitlessNumber(name) {
	return unitlessNumbers.has(name);
}
/**
* Extracts paths as a nested array from a Polygon instance.
*/
function getPathsArray(polygon) {
	const mvcPaths = polygon.getPaths();
	const result = [];
	for (let i = 0; i < mvcPaths.getLength(); i++) result.push(mvcPaths.getAt(i).getArray());
	return result;
}
function usePolygon(props) {
	var _a, _b, _c;
	const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onPathsChanged, polygon: externalPolygon, encodedPaths, paths, defaultPaths } = props, destructuredOptions = __rest(props, [
		"onClick",
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onMouseOver",
		"onMouseOut",
		"onPathsChanged",
		"polygon",
		"encodedPaths",
		"paths",
		"defaultPaths"
	]);
	const [polygon, setPolygon] = useState$4(null);
	const map = useMap();
	const geometryLibrary = useMapsLibrary("geometry");
	const isUpdatingRef = useRef$1(false);
	const polygonOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), {
		clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick),
		draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onPathsChanged),
		editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onPathsChanged)
	}), import_fast_deep_equal.default);
	useEffect(() => {
		if (!map) {
			if (map === void 0) console.error("<Polygon> has to be inside a Map component.");
			return;
		}
		let instance;
		if (externalPolygon) {
			instance = externalPolygon;
			const initialPaths = paths !== null && paths !== void 0 ? paths : defaultPaths;
			if (initialPaths && Array.isArray(initialPaths)) instance.setPaths(initialPaths);
			instance.setOptions(polygonOptions);
		} else {
			const initialPaths = paths !== null && paths !== void 0 ? paths : defaultPaths;
			const polygonOptionsWithPaths = Object.assign({}, polygonOptions);
			if (initialPaths && Array.isArray(initialPaths)) polygonOptionsWithPaths.paths = initialPaths;
			instance = new google.maps.Polygon(polygonOptionsWithPaths);
		}
		instance.setMap(map);
		setPolygon(instance);
		return () => {
			instance.setMap(null);
			setPolygon(null);
		};
	}, [map, externalPolygon]);
	useMapsEventListener(polygon, "click", onClick);
	useMapsEventListener(polygon, "drag", onDrag);
	useMapsEventListener(polygon, "dragstart", onDragStart);
	useMapsEventListener(polygon, "mouseover", onMouseOver);
	useMapsEventListener(polygon, "mouseout", onMouseOut);
	useMapsEventListener(polygon, "dragend", (e) => {
		onDragEnd === null || onDragEnd === void 0 || onDragEnd(e);
		if (onPathsChanged && polygon && !isUpdatingRef.current) onPathsChanged(getPathsArray(polygon));
	});
	useEffect(() => {
		if (!polygon || !onPathsChanged) return;
		const listeners = [];
		const mvcPaths = polygon.getPaths();
		if (typeof mvcPaths.getLength !== "function" || typeof mvcPaths.getAt !== "function") return;
		const handlePathsChange = () => {
			if (!isUpdatingRef.current) onPathsChanged(getPathsArray(polygon));
		};
		const subscribeToInnerPath = (innerPath) => {
			listeners.push(google.maps.event.addListener(innerPath, "insert_at", handlePathsChange));
			listeners.push(google.maps.event.addListener(innerPath, "remove_at", handlePathsChange));
			listeners.push(google.maps.event.addListener(innerPath, "set_at", handlePathsChange));
		};
		for (let i = 0; i < mvcPaths.getLength(); i++) subscribeToInnerPath(mvcPaths.getAt(i));
		listeners.push(google.maps.event.addListener(mvcPaths, "insert_at", (index) => {
			subscribeToInnerPath(mvcPaths.getAt(index));
			handlePathsChange();
		}));
		listeners.push(google.maps.event.addListener(mvcPaths, "set_at", (index) => {
			subscribeToInnerPath(mvcPaths.getAt(index));
			handlePathsChange();
		}));
		listeners.push(google.maps.event.addListener(mvcPaths, "remove_at", handlePathsChange));
		return () => {
			listeners.forEach((listener) => listener.remove());
		};
	}, [
		polygon,
		onPathsChanged,
		paths,
		encodedPaths,
		polygonOptions.editable,
		polygonOptions.draggable
	]);
	useEffect(() => {
		if (!polygon) return;
		polygon.setOptions(polygonOptions);
	}, [polygon, polygonOptions]);
	useEffect(() => {
		if (!polygon || !paths) return;
		if (!Array.isArray(paths)) return;
		const firstPath = paths[0];
		if (!pathsEquals(Array.isArray(firstPath) ? paths : [paths], polygon.getPaths())) {
			isUpdatingRef.current = true;
			polygon.setPaths(paths);
			isUpdatingRef.current = false;
		}
	}, [polygon, paths]);
	useEffect(() => {
		if (!polygon || !encodedPaths || !geometryLibrary) return;
		isUpdatingRef.current = true;
		const decodedPaths = encodedPaths.map((encodedPath) => geometryLibrary.encoding.decodePath(encodedPath));
		polygon.setPaths(decodedPaths);
		isUpdatingRef.current = false;
	}, [
		polygon,
		encodedPaths,
		geometryLibrary
	]);
	return polygon;
}
var Polygon = forwardRef((props, ref) => {
	const polygon = usePolygon(props);
	useImperativeHandle(ref, () => polygon, [polygon]);
	return React__default.createElement(React__default.Fragment, null);
});
Polygon.displayName = "Polygon";
function usePolyline(props) {
	var _a, _b, _c;
	const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onPathChanged, polyline: externalPolyline, encodedPath, path, defaultPath } = props, destructuredOptions = __rest(props, [
		"onClick",
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onMouseOver",
		"onMouseOut",
		"onPathChanged",
		"polyline",
		"encodedPath",
		"path",
		"defaultPath"
	]);
	const [polyline, setPolyline] = useState$4(null);
	const map = useMap();
	const geometryLibrary = useMapsLibrary("geometry");
	const isUpdatingRef = useRef$1(false);
	const polylineOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), {
		clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick),
		draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onPathChanged),
		editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onPathChanged)
	}), import_fast_deep_equal.default);
	useEffect(() => {
		if (!map) {
			if (map === void 0) console.error("<Polyline> has to be inside a Map component.");
			return;
		}
		let instance;
		if (externalPolyline) {
			instance = externalPolyline;
			const initialPath = path !== null && path !== void 0 ? path : defaultPath;
			if (initialPath && Array.isArray(initialPath)) instance.setPath(initialPath);
			instance.setOptions(polylineOptions);
		} else {
			const initialPath = path !== null && path !== void 0 ? path : defaultPath;
			const polylineOptionsWithPath = Object.assign({}, polylineOptions);
			if (initialPath && Array.isArray(initialPath)) polylineOptionsWithPath.path = initialPath;
			instance = new google.maps.Polyline(polylineOptionsWithPath);
		}
		instance.setMap(map);
		setPolyline(instance);
		return () => {
			instance.setMap(null);
			setPolyline(null);
		};
	}, [map, externalPolyline]);
	useMapsEventListener(polyline, "click", onClick);
	useMapsEventListener(polyline, "drag", onDrag);
	useMapsEventListener(polyline, "dragstart", onDragStart);
	useMapsEventListener(polyline, "mouseover", onMouseOver);
	useMapsEventListener(polyline, "mouseout", onMouseOut);
	useMapsEventListener(polyline, "dragend", (e) => {
		onDragEnd === null || onDragEnd === void 0 || onDragEnd(e);
		if (onPathChanged && polyline && !isUpdatingRef.current) onPathChanged(polyline.getPath().getArray());
	});
	useEffect(() => {
		if (!polyline || !onPathChanged) return;
		const mvcPath = polyline.getPath();
		if (!mvcPath) return;
		const handlePathChange = () => {
			if (!isUpdatingRef.current) onPathChanged(mvcPath.getArray());
		};
		const listeners = [
			google.maps.event.addListener(mvcPath, "insert_at", handlePathChange),
			google.maps.event.addListener(mvcPath, "remove_at", handlePathChange),
			google.maps.event.addListener(mvcPath, "set_at", handlePathChange)
		];
		return () => {
			listeners.forEach((listener) => listener.remove());
		};
	}, [
		polyline,
		onPathChanged,
		path,
		encodedPath,
		polylineOptions.editable,
		polylineOptions.draggable
	]);
	useEffect(() => {
		if (!polyline) return;
		polyline.setOptions(polylineOptions);
	}, [polyline, polylineOptions]);
	useEffect(() => {
		if (!polyline || !path) return;
		if (!pathEquals(path, polyline.getPath())) {
			isUpdatingRef.current = true;
			polyline.setPath(path);
			isUpdatingRef.current = false;
		}
	}, [polyline, path]);
	useEffect(() => {
		if (!polyline || !encodedPath || !geometryLibrary) return;
		isUpdatingRef.current = true;
		const decodedPath = geometryLibrary.encoding.decodePath(encodedPath);
		polyline.setPath(decodedPath);
		isUpdatingRef.current = false;
	}, [
		polyline,
		encodedPath,
		geometryLibrary
	]);
	return polyline;
}
var Polyline = forwardRef((props, ref) => {
	const polyline = usePolyline(props);
	useImperativeHandle(ref, () => polyline, [polyline]);
	return React__default.createElement(React__default.Fragment, null);
});
Polyline.displayName = "Polyline";
var DEFAULT_CAMERA_STATE = {
	center: {
		lat: 0,
		lng: 0,
		altitude: 0
	},
	range: 0,
	heading: 0,
	tilt: 0,
	roll: 0
};
/**
* Camera property names that correspond to gmp-*change events.
*/
var CAMERA_PROPS = [
	"center",
	"range",
	"heading",
	"tilt",
	"roll"
];
/**
* Updates the camera state ref with values from the map element.
*/
function updateCameraState(map3d, ref, prop) {
	const value = map3d[prop];
	if (value == null) return;
	if (prop === "center") {
		const center = value;
		ref.current.center = center.toJSON ? center.toJSON() : center;
	} else ref.current[prop] = value;
}
/**
* Creates a mutable ref object to track the last known state of the 3D map camera.
* This is used in `useMap3DCameraParams` to reduce stuttering by avoiding updates
* of the map camera with values that have already been processed.
*
* @internal
*/
function useTrackedCameraStateRef3D(map3d) {
	const forceUpdate = useForceUpdate();
	const ref = useRef$1(Object.assign({}, DEFAULT_CAMERA_STATE));
	useEffect(() => {
		if (!map3d) return;
		const listeners = [];
		for (const prop of CAMERA_PROPS) {
			const eventName = `gmp-${prop}change`;
			const handler = () => {
				updateCameraState(map3d, ref, prop);
				forceUpdate();
			};
			map3d.addEventListener(eventName, handler);
			listeners.push(() => map3d.removeEventListener(eventName, handler));
		}
		return () => {
			for (const removeListener of listeners) removeListener();
		};
	}, [map3d, forceUpdate]);
	return ref;
}
/**
* Hook to manage the Map3DElement instance lifecycle.
*
* Handles:
* - Waiting for the 'maps3d' library to load
* - Waiting for the 'gmp-map-3d' custom element to be defined
* - Creating a callback ref for the element
* - Applying initial options when the element is ready
* - Tracking camera state
*
* @internal
*/
function useMap3DInstance(props) {
	const maps3dLib = useMapsLibrary("maps3d");
	const [customElementReady, setCustomElementReady] = useState$4(false);
	const [, containerRef] = useCallbackRef();
	const [map3d, map3dRef] = useCallbackRef();
	const cameraStateRef = useTrackedCameraStateRef3D(map3d);
	useEffect(() => {
		customElements.whenDefined("gmp-map-3d").then(() => {
			setCustomElementReady(true);
		});
	}, []);
	useEffect(() => {
		if (!map3d) return;
		const { center, heading, tilt, range, roll, defaultCenter, defaultHeading, defaultTilt, defaultRange, defaultRoll, id, style, className, children, onCenterChanged, onHeadingChanged, onTiltChanged, onRangeChanged, onRollChanged, onCameraChanged, onClick, onSteadyChange, onAnimationEnd, onError, mode, gestureHandling } = props, elementOptions = __rest(props, [
			"center",
			"heading",
			"tilt",
			"range",
			"roll",
			"defaultCenter",
			"defaultHeading",
			"defaultTilt",
			"defaultRange",
			"defaultRoll",
			"id",
			"style",
			"className",
			"children",
			"onCenterChanged",
			"onHeadingChanged",
			"onTiltChanged",
			"onRangeChanged",
			"onRollChanged",
			"onCameraChanged",
			"onClick",
			"onSteadyChange",
			"onAnimationEnd",
			"onError",
			"mode",
			"gestureHandling"
		]);
		const initialCenter = center !== null && center !== void 0 ? center : defaultCenter;
		const initialHeading = heading !== null && heading !== void 0 ? heading : defaultHeading;
		const initialTilt = tilt !== null && tilt !== void 0 ? tilt : defaultTilt;
		const initialRange = range !== null && range !== void 0 ? range : defaultRange;
		const initialRoll = roll !== null && roll !== void 0 ? roll : defaultRoll;
		const initialOptions = Object.assign({}, elementOptions);
		if (initialCenter) initialOptions.center = initialCenter;
		if (initialHeading !== void 0) initialOptions.heading = initialHeading;
		if (initialTilt !== void 0) initialOptions.tilt = initialTilt;
		if (initialRange !== void 0) initialOptions.range = initialRange;
		if (initialRoll !== void 0) initialOptions.roll = initialRoll;
		Object.assign(map3d, initialOptions);
	}, [map3d]);
	return [
		map3d,
		containerRef,
		map3dRef,
		cameraStateRef,
		!!maps3dLib && customElementReady
	];
}
/**
* Converts a LatLngAltitude or LatLngAltitudeLiteral to a literal object.
*/
function toLatLngAltitudeLiteral(value) {
	if (!value) return null;
	if ("toJSON" in value && typeof value.toJSON === "function") return value.toJSON();
	return value;
}
/**
* Hook to update Map3D camera parameters when props change.
* Compares the current camera state with props and updates only when there are differences.
*
* @internal
*/
function useMap3DCameraParams(map3d, cameraStateRef, props) {
	var _a, _b, _c, _d, _e, _f, _g;
	const centerLiteral = toLatLngAltitudeLiteral(props.center);
	const lat = (_a = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.lat) !== null && _a !== void 0 ? _a : null;
	const lng = (_b = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.lng) !== null && _b !== void 0 ? _b : null;
	const altitude = (_c = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.altitude) !== null && _c !== void 0 ? _c : null;
	const range = (_d = props.range) !== null && _d !== void 0 ? _d : null;
	const heading = (_e = props.heading) !== null && _e !== void 0 ? _e : null;
	const tilt = (_f = props.tilt) !== null && _f !== void 0 ? _f : null;
	const roll = (_g = props.roll) !== null && _g !== void 0 ? _g : null;
	useLayoutEffect$1(() => {
		var _a;
		if (!map3d) return;
		const currentState = cameraStateRef.current;
		if (lat !== null && lng !== null && (currentState.center.lat !== lat || currentState.center.lng !== lng || altitude !== null && currentState.center.altitude !== altitude)) map3d.center = {
			lat,
			lng,
			altitude: (_a = altitude !== null && altitude !== void 0 ? altitude : currentState.center.altitude) !== null && _a !== void 0 ? _a : 0
		};
		if (range !== null && currentState.range !== range) map3d.range = range;
		if (heading !== null && currentState.heading !== heading) map3d.heading = heading;
		if (tilt !== null && currentState.tilt !== tilt) map3d.tilt = tilt;
		if (roll !== null && currentState.roll !== roll) map3d.roll = roll;
	});
}
/**
* Camera-related event types for the aggregated onCameraChanged handler.
*/
var CAMERA_EVENTS = [
	"gmp-centerchange",
	"gmp-headingchange",
	"gmp-tiltchange",
	"gmp-rangechange",
	"gmp-rollchange"
];
/**
* Creates a camera changed event with current camera state.
*/
function createCameraEvent(map3d, type) {
	const center = map3d.center;
	let centerLiteral;
	if (center && "toJSON" in center && typeof center.toJSON === "function") centerLiteral = center.toJSON();
	else if (center) centerLiteral = center;
	else centerLiteral = {
		lat: 0,
		lng: 0,
		altitude: 0
	};
	return {
		type,
		map3d,
		detail: {
			center: centerLiteral,
			range: map3d.range || 0,
			heading: map3d.heading || 0,
			tilt: map3d.tilt || 0,
			roll: map3d.roll || 0
		}
	};
}
/**
* Creates a click event from a LocationClickEvent or PlaceClickEvent.
*/
function createClickEvent(map3d, srcEvent) {
	const placeClickEvent = srcEvent;
	return {
		type: "gmp-click",
		map3d,
		detail: {
			position: srcEvent.position || null,
			placeId: placeClickEvent.placeId
		}
	};
}
/**
* Creates a steady change event.
*/
function createSteadyChangeEvent(map3d, srcEvent) {
	return {
		type: "gmp-steadychange",
		map3d,
		detail: { isSteady: srcEvent.isSteady }
	};
}
/**
* Hook to set up event handlers for Map3D events.
*
* @internal
*/
function useMap3DEvents(map3d, props) {
	const { onCenterChanged, onHeadingChanged, onTiltChanged, onRangeChanged, onRollChanged, onCameraChanged, onClick, onSteadyChange, onAnimationEnd, onError } = props;
	useMap3DEvent(map3d, "gmp-centerchange", onCenterChanged, createCameraEvent);
	useMap3DEvent(map3d, "gmp-headingchange", onHeadingChanged, createCameraEvent);
	useMap3DEvent(map3d, "gmp-tiltchange", onTiltChanged, createCameraEvent);
	useMap3DEvent(map3d, "gmp-rangechange", onRangeChanged, createCameraEvent);
	useMap3DEvent(map3d, "gmp-rollchange", onRollChanged, createCameraEvent);
	useEffect(() => {
		if (!map3d || !onCameraChanged) return;
		const handler = () => {
			onCameraChanged(createCameraEvent(map3d, "camerachange"));
		};
		for (const eventName of CAMERA_EVENTS) map3d.addEventListener(eventName, handler);
		return () => {
			for (const eventName of CAMERA_EVENTS) map3d.removeEventListener(eventName, handler);
		};
	}, [map3d, onCameraChanged]);
	useEffect(() => {
		if (!map3d || !onClick) return;
		const handler = (ev) => {
			onClick(createClickEvent(map3d, ev));
		};
		map3d.addEventListener("gmp-click", handler);
		return () => map3d.removeEventListener("gmp-click", handler);
	}, [map3d, onClick]);
	useEffect(() => {
		if (!map3d || !onSteadyChange) return;
		const handler = (ev) => {
			onSteadyChange(createSteadyChangeEvent(map3d, ev));
		};
		map3d.addEventListener("gmp-steadychange", handler);
		return () => map3d.removeEventListener("gmp-steadychange", handler);
	}, [map3d, onSteadyChange]);
	useMap3DEvent(map3d, "gmp-animationend", onAnimationEnd, (map3d, type) => ({
		type,
		map3d
	}));
	useMap3DEvent(map3d, "gmp-error", onError, (map3d, type) => ({
		type,
		map3d
	}));
}
/**
* Helper hook for individual events.
*/
function useMap3DEvent(map3d, eventName, handler, createEvent) {
	useEffect(() => {
		if (!map3d || !handler) return;
		const listener = () => {
			handler(createEvent(map3d, eventName));
		};
		map3d.addEventListener(eventName, listener);
		return () => map3d.removeEventListener(eventName, listener);
	}, [
		map3d,
		eventName,
		handler,
		createEvent
	]);
}
/**
* Set of option keys that can be updated on Map3DElement.
* Camera props (center, heading, tilt, range, roll) are handled separately.
*/
var MAP_3D_OPTION_KEYS = new Set([
	"bounds",
	"defaultUIHidden",
	"gestureHandling",
	"internalUsageAttributionIds",
	"maxAltitude",
	"maxHeading",
	"maxTilt",
	"minAltitude",
	"minHeading",
	"minTilt",
	"mode"
]);
/**
* Hook to update Map3D options when props change.
*
* @internal
*/
function useMap3DOptions(map3d, props) {
	const options = useMemo(() => {
		const result = {};
		const keys = Object.keys(props);
		for (const key of keys) {
			if (!MAP_3D_OPTION_KEYS.has(key)) continue;
			const value = props[key];
			if (value === void 0) continue;
			result[key] = value;
		}
		return result;
	}, [props]);
	useDeepCompareEffect(() => {
		if (!map3d) return;
		Object.assign(map3d, options);
	}, [map3d, options]);
}
/**
* React context for accessing the Map3D instance from child components.
*/
var GoogleMaps3DContext = React__default.createContext(null);
/**
* Default styles for the map container.
*/
var DEFAULT_CONTAINER_STYLE = {
	width: "100%",
	height: "100%",
	position: "relative"
};
/**
* A React component that renders a 3D map using the Google Maps JavaScript API.
*
* @example
* ```tsx
* <APIProvider apiKey={API_KEY}>
*   <Map3D
*     defaultCenter={{ lat: 37.7749, lng: -122.4194, altitude: 1000 }}
*     defaultRange={5000}
*     defaultHeading={0}
*     defaultTilt={45}
*   />
* </APIProvider>
* ```
*/
var Map3D = forwardRef((props, ref) => {
	const { children, id, className, style } = props;
	const context = useContext(APIProviderContext);
	if (!context) throw new Error("<Map3D> can only be used inside an <APIProvider> component.");
	const { addMap3DInstance, removeMap3DInstance } = context;
	const [map3d, containerRef, map3dRef, cameraStateRef, isReady] = useMap3DInstance(props);
	useMap3DCameraParams(map3d, cameraStateRef, props);
	useMap3DEvents(map3d, props);
	useMap3DOptions(map3d, props);
	useEffect(() => {
		if (!map3d) return;
		const instanceId = id !== null && id !== void 0 ? id : "default";
		addMap3DInstance(map3d, instanceId);
		return () => {
			removeMap3DInstance(instanceId);
		};
	}, [map3d, id]);
	useImperativeHandle(ref, () => ({
		map3d,
		flyCameraAround: (options) => {
			map3d === null || map3d === void 0 || map3d.flyCameraAround(options);
		},
		flyCameraTo: (options) => {
			map3d === null || map3d === void 0 || map3d.flyCameraTo(options);
		},
		stopCameraAnimation: () => {
			map3d === null || map3d === void 0 || map3d.stopCameraAnimation();
		}
	}), [map3d]);
	const combinedStyle = useMemo(() => Object.assign(Object.assign({}, DEFAULT_CONTAINER_STYLE), style), [style]);
	const contextValue = useMemo(() => ({ map3d }), [map3d]);
	if (!isReady) return React__default.createElement("div", Object.assign({
		ref: containerRef,
		"data-testid": "map-3d",
		style: className ? void 0 : combinedStyle,
		className
	}, id ? { id } : {}));
	return React__default.createElement("div", Object.assign({
		ref: containerRef,
		"data-testid": "map-3d",
		style: className ? void 0 : combinedStyle,
		className
	}, id ? { id } : {}), React__default.createElement("gmp-map-3d", {
		ref: map3dRef,
		style: {
			width: "100%",
			height: "100%"
		}
	}, map3d && React__default.createElement(GoogleMaps3DContext.Provider, { value: contextValue }, children)));
});
Map3D.displayName = "Map3D";
var Marker3DContext = createContext(null);
/**
* Marker3D component for displaying markers on a Map3D.
*
* Automatically uses Marker3DInteractiveElement when onClick is provided,
* otherwise uses Marker3DElement.
*
* Children can include:
* - `<img>` elements (automatically wrapped in <template>)
* - `<svg>` elements (automatically wrapped in <template>)
* - PinElement instances (passed through directly)
*
* @example
* ```tsx
* // Basic marker
* <Marker3D position={{ lat: 37.7749, lng: -122.4194 }} label="SF" />
*
* // Interactive marker
* <Marker3D
*   position={{ lat: 37.7749, lng: -122.4194 }}
*   onClick={() => console.log('clicked')}
*   title="Click me"
* />
*
* // Custom marker with image
* <Marker3D position={{ lat: 37.7749, lng: -122.4194 }}>
*   <img src="/icon.png" width={32} height={32} />
* </Marker3D>
* ```
*/
var Marker3D = forwardRef(function Marker3D(props, ref) {
	const { children, onClick, position, altitudeMode, collisionBehavior, drawsWhenOccluded, extruded, label, sizePreserved, zIndex, title } = props;
	const isInteractive = Boolean(onClick);
	const [marker, setMarker] = useState$4(null);
	const [contentHandledExternally, setContentHandledExternally] = useState$4(false);
	const contentContainer = useMemo(() => {
		const container = document.createElement("div");
		container.style.display = "none";
		document.body.appendChild(container);
		return container;
	}, []);
	useEffect(() => {
		return () => contentContainer.remove();
	}, [contentContainer]);
	const markerRef = useCallback((node) => {
		setMarker(node);
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	useDomEventListener(marker, "gmp-click", onClick);
	useLayoutEffect$1(() => {
		if (contentHandledExternally) return;
		if (!marker || !contentContainer) return;
		while (marker.firstChild) marker.removeChild(marker.firstChild);
		const childNodes = Array.from(contentContainer.childNodes);
		for (const node of childNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE) continue;
			const element = node;
			const tagName = element.tagName.toLowerCase();
			if (tagName === "img" || tagName === "svg") {
				const template = document.createElement("template");
				template.content.appendChild(element.cloneNode(true));
				marker.appendChild(template);
			} else marker.appendChild(element.cloneNode(true));
		}
	}, [
		marker,
		contentContainer,
		children,
		contentHandledExternally
	]);
	const contextValue = useMemo(() => ({
		marker,
		setContentHandledExternally
	}), [marker]);
	usePropBinding(marker, "position", position);
	usePropBinding(marker, "altitudeMode", altitudeMode);
	usePropBinding(marker, "collisionBehavior", collisionBehavior);
	usePropBinding(marker, "drawsWhenOccluded", drawsWhenOccluded);
	usePropBinding(marker, "extruded", extruded);
	usePropBinding(marker, "label", label);
	usePropBinding(marker, "sizePreserved", sizePreserved);
	usePropBinding(marker, "zIndex", zIndex);
	usePropBinding(marker, "title", title !== null && title !== void 0 ? title : "");
	return React__default.createElement(Marker3DContext.Provider, { value: contextValue }, isInteractive ? React__default.createElement("gmp-marker-3d-interactive", { ref: markerRef }) : React__default.createElement("gmp-marker-3d", { ref: markerRef }), createPortal(children, contentContainer));
});
Marker3D.displayName = "Marker3D";
/**
* Popover component for displaying info windows on a Map3D.
*
* Similar to InfoWindow for 2D maps, Popover provides a way to show
* contextual information at a specific location or attached to a marker
* on a 3D map.
*
* @example
* ```tsx
* // Basic popover at position
* <Popover
*   position={{ lat: 37.7749, lng: -122.4194 }}
*   open={isOpen}
* >
*   <div>Hello from San Francisco!</div>
* </Popover>
*
* // Popover anchored to a marker (place as sibling, use anchor prop)
* <Marker3D
*   ref={markerRef}
*   position={{ lat: 37.7749, lng: -122.4194 }}
*   onClick={() => setOpen(true)}
* />
* <Popover
*   anchor={markerRef.current}
*   open={isOpen}
*   onClose={() => setOpen(false)}
* >
*   <div>Marker info</div>
* </Popover>
* ```
*/
var Popover = forwardRef(function Popover(props, ref) {
	var _a;
	const { children, headerContent, style, className, open = true, position, anchor, anchorId, altitudeMode, lightDismissDisabled, autoPanDisabled, onClose } = props;
	const [popover, setPopover] = useState$4(null);
	const prevStyleRef = useRef$1(null);
	useImperativeHandle(ref, () => popover, [popover]);
	usePopoverCloseObserver(popover, open, onClose);
	usePropBinding(popover, "open", open !== null && open !== void 0 ? open : false);
	usePropBinding(popover, "altitudeMode", altitudeMode);
	usePropBinding(popover, "lightDismissDisabled", lightDismissDisabled);
	usePropBinding(popover, "autoPanDisabled", autoPanDisabled);
	usePropBinding(popover, "positionAnchor", (_a = anchor !== null && anchor !== void 0 ? anchor : anchorId) !== null && _a !== void 0 ? _a : position);
	useLayoutEffect$1(() => {
		if (!popover) return;
		setValueForStyles(popover, style || null, prevStyleRef.current);
		prevStyleRef.current = style || null;
	}, [popover, style]);
	return React__default.createElement("gmp-popover", {
		ref: setPopover,
		className
	}, headerContent && React__default.createElement("div", { slot: "header" }, headerContent), children);
});
Popover.displayName = "Popover";
/**
* Custom hook to observe the open attribute of a popover element
* and call onClose when it transitions from open to closed due to light dismiss.
* Does not call onClose when the open prop changes programmatically.
*/
function usePopoverCloseObserver(popover, open, onClose) {
	const previousOpenState = useRef$1(void 0);
	const openPropRef = useRef$1(open);
	useEffect(() => {
		openPropRef.current = open;
	}, [open]);
	useEffect(() => {
		if (!popover || !onClose) return;
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) if (mutation.type === "attributes" && mutation.attributeName === "open") {
				const isOpen = popover.hasAttribute("open");
				if (previousOpenState.current === true && !isOpen && openPropRef.current !== false) onClose();
				previousOpenState.current = isOpen;
			}
		});
		observer.observe(popover, {
			attributes: true,
			attributeFilter: ["open"]
		});
		previousOpenState.current = popover.hasAttribute("open");
		return () => {
			observer.disconnect();
		};
	}, [popover, onClose]);
}
function useMarker(props) {
	const [marker, setMarker] = useState$4(null);
	const map = useMap();
	const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut } = props, markerOptions = __rest(props, [
		"onClick",
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onMouseOver",
		"onMouseOut"
	]);
	const { position, draggable } = markerOptions;
	useEffect(() => {
		if (!map) {
			if (map === void 0) console.error("<Marker> has to be inside a Map component.");
			return;
		}
		const newMarker = new google.maps.Marker(markerOptions);
		newMarker.setMap(map);
		setMarker(newMarker);
		return () => {
			newMarker.setMap(null);
			setMarker(null);
		};
	}, [map]);
	useEffect(() => {
		if (!marker) return;
		const m = marker;
		const gme = google.maps.event;
		if (onClick) gme.addListener(m, "click", onClick);
		if (onDrag) gme.addListener(m, "drag", onDrag);
		if (onDragStart) gme.addListener(m, "dragstart", onDragStart);
		if (onDragEnd) gme.addListener(m, "dragend", onDragEnd);
		if (onMouseOver) gme.addListener(m, "mouseover", onMouseOver);
		if (onMouseOut) gme.addListener(m, "mouseout", onMouseOut);
		marker.setDraggable(Boolean(draggable));
		return () => {
			gme.clearInstanceListeners(m);
		};
	}, [
		marker,
		draggable,
		onClick,
		onDrag,
		onDragStart,
		onDragEnd,
		onMouseOver,
		onMouseOut
	]);
	useEffect(() => {
		if (!marker) return;
		if (markerOptions) marker.setOptions(markerOptions);
	}, [marker, markerOptions]);
	useEffect(() => {
		if (draggable || !position || !marker) return;
		marker.setPosition(position);
	}, [
		draggable,
		position,
		marker
	]);
	return marker;
}
/**
* Component to render a marker on a map
*/
var Marker = forwardRef((props, ref) => {
	const marker = useMarker(props);
	useImperativeHandle(ref, () => marker, [marker]);
	return React__default.createElement(React__default.Fragment, null);
});
Marker.displayName = "Marker";
function useRectangle(props) {
	var _a, _b, _c;
	const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onBoundsChanged, bounds, defaultBounds } = props, destructuredOptions = __rest(props, [
		"onClick",
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onMouseOver",
		"onMouseOut",
		"onBoundsChanged",
		"bounds",
		"defaultBounds"
	]);
	const [rectangle, setRectangle] = useState$4(null);
	const map = useMap();
	const rectangleOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), {
		clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick),
		draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onBoundsChanged),
		editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onBoundsChanged)
	}), import_fast_deep_equal.default);
	useEffect(() => {
		if (!map) {
			if (map === void 0) console.error("<Rectangle> has to be inside a Map component.");
			return;
		}
		const newRectangle = new google.maps.Rectangle(Object.assign(Object.assign({}, rectangleOptions), { bounds: bounds !== null && bounds !== void 0 ? bounds : defaultBounds }));
		newRectangle.setMap(map);
		setRectangle(newRectangle);
		return () => {
			newRectangle.setMap(null);
			setRectangle(null);
		};
	}, [map]);
	useMapsEventListener(rectangle, "click", onClick);
	useMapsEventListener(rectangle, "drag", onDrag);
	useMapsEventListener(rectangle, "dragstart", onDragStart);
	useMapsEventListener(rectangle, "dragend", onDragEnd);
	useMapsEventListener(rectangle, "mouseover", onMouseOver);
	useMapsEventListener(rectangle, "mouseout", onMouseOut);
	useMapsEventListener(rectangle, "bounds_changed", onBoundsChanged ? () => {
		onBoundsChanged(rectangle === null || rectangle === void 0 ? void 0 : rectangle.getBounds());
	} : null);
	useEffect(() => {
		if (!rectangle) return;
		rectangle.setOptions(rectangleOptions);
	}, [rectangle, rectangleOptions]);
	useEffect(() => {
		if (!rectangle || !bounds) return;
		if (!boundsEquals(bounds, rectangle.getBounds())) rectangle.setBounds(bounds);
	}, [rectangle, bounds]);
	return rectangle;
}
var Rectangle = forwardRef((props, ref) => {
	const rectangle = useRectangle(props);
	useImperativeHandle(ref, () => rectangle, [rectangle]);
	return React__default.createElement(React__default.Fragment, null);
});
Rectangle.displayName = "Rectangle";
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region src/components/map/MapPickerModal.jsx
var import_jsx_runtime = require_jsx_runtime();
var { useState: useState$3 } = await importShared("react");
function MapPickerModal({ onClose, onSelect }) {
	const [position, setPosition] = useState$3(null);
	const handleClick = (e) => {
		const lat = e.detail.latLng.lat;
		const lng = e.detail.latLng.lng;
		setPosition({
			lat,
			lng
		});
	};
	const handleConfirm = async () => {
		if (!position) return;
		const { lat, lng } = position;
		const data = await (await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyB7JR2Nt6B3iNPfMC2N_YyuMfKKDBVrtfU`)).json();
		onSelect({
			latitude: lat,
			longitude: lng,
			address: data.results[0]?.formatted_address || "",
			neighborhood: data.results[0]?.address_components.find((c) => c.types.includes("locality"))?.long_name || ""
		});
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "modal-overlay",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "modal-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Select Location" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(APIProvider, {
					apiKey: "AIzaSyB7JR2Nt6B3iNPfMC2N_YyuMfKKDBVrtfU",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, {
						style: {
							width: "100%",
							height: "400px"
						},
						defaultCenter: {
							lat: 43.6532,
							lng: -79.3832
						},
						defaultZoom: 12,
						gestureHandling: "greedy",
						onClick: handleClick,
						children: position && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, { position })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "secondary-btn",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "primary-btn",
						onClick: handleConfirm,
						children: "Confirm Location"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/components/resident/IssueForm.jsx
var { useState: useState$2 } = await importShared("react");
var initialForm = {
	title: "",
	description: "",
	category: "",
	priority: "medium",
	address: "",
	neighborhood: "",
	latitude: "",
	longitude: "",
	photoFile: null,
	previewUrl: ""
};
function IssueForm({ onSubmit, loading }) {
	const [form, setForm] = useState$2(initialForm);
	const [errors, setErrors] = useState$2({});
	const [uploading, setUploading] = useState$2(false);
	const [showMap, setShowMap] = useState$2(false);
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value
		}));
		setErrors((prev) => ({
			...prev,
			[name]: ""
		}));
	};
	const handleFileChange = (e) => {
		const file = e.target.files?.[0] || null;
		if (!file) return;
		setForm((prev) => ({
			...prev,
			photoFile: file,
			previewUrl: URL.createObjectURL(file)
		}));
	};
	const handleMapSelect = (data) => {
		setForm((prev) => ({
			...prev,
			address: data.address || "",
			neighborhood: data.neighborhood || "",
			latitude: data.latitude ?? "",
			longitude: data.longitude ?? ""
		}));
	};
	const validate = () => {
		const newErrors = {};
		const title = form.title.trim();
		const description = form.description.trim();
		if (!title) newErrors.title = "Please enter a title.";
		else if (title.length < 5) newErrors.title = "Title must be at least 5 characters.";
		else if (title.length > 150) newErrors.title = "Max 150 characters.";
		if (!description) newErrors.description = "Please enter a description.";
		else if (description.length < 10) newErrors.description = "Minimum 10 characters.";
		else if (description.length > 2e3) newErrors.description = "Max 2000 characters.";
		return newErrors;
	};
	const uploadImage = async (file) => {
		const cloudName = "dusnohn9w";
		const uploadPreset = "civiccase_upload";
		const data = new FormData();
		data.append("file", file);
		data.append("upload_preset", uploadPreset);
		return (await (await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
			method: "POST",
			body: data
		})).json()).secure_url;
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		let photoUrl = "";
		try {
			if (form.photoFile) {
				setUploading(true);
				photoUrl = await uploadImage(form.photoFile);
			}
			await onSubmit({
				title: form.title.trim(),
				description: form.description.trim(),
				category: form.category || "other",
				priority: form.priority || "medium",
				photoUrl,
				location: {
					address: form.address,
					neighborhood: form.neighborhood,
					latitude: form.latitude ? parseFloat(form.latitude) : null,
					longitude: form.longitude ? parseFloat(form.longitude) : null
				}
			});
			setForm(initialForm);
			setErrors({});
		} catch (err) {
			console.error(err);
			alert("Upload failed");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "card form-card",
		onSubmit: handleSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Report a New Issue" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group full-width",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Title" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								name: "title",
								value: form.title,
								onChange: handleChange,
								className: errors.title ? "input-error" : "",
								placeholder: "Enter issue title"
							}),
							!errors.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "field-hint",
								children: "5 to 150 characters"
							}),
							errors.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "form-error",
								children: errors.title
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group full-width",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Description" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								name: "description",
								value: form.description,
								onChange: handleChange,
								rows: "5",
								className: errors.description ? "input-error" : "",
								placeholder: "Describe the issue"
							}),
							!errors.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "field-hint",
								children: "10 to 2000 characters"
							}),
							errors.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "form-error",
								children: errors.description
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "category",
							value: form.category,
							onChange: handleChange,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "pothole",
									children: "Pothole"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "broken_streetlight",
									children: "Broken Streetlight"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "flooding",
									children: "Flooding"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "sidewalk_damage",
									children: "Sidewalk Damage"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "garbage",
									children: "Garbage"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "graffiti",
									children: "Graffiti"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "traffic_signal",
									children: "Traffic Signal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "safety_hazard",
									children: "Safety Hazard"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "other",
									children: "Other"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Priority" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "priority",
							value: form.priority,
							onChange: handleChange,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "low",
									children: "Low"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "medium",
									children: "Medium"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "high",
									children: "High"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "critical",
									children: "Critical"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group full-width",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Upload Image" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								onChange: handleFileChange
							}),
							form.previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: form.previewUrl,
								alt: "preview",
								className: "issue-photo"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group full-width",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							name: "address",
							value: form.address,
							onChange: handleChange,
							placeholder: "Enter address"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "form-group full-width",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "secondary-btn",
							onClick: () => setShowMap(true),
							children: "Pick on Map"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Neighborhood" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							name: "neighborhood",
							value: form.neighborhood,
							onChange: handleChange,
							placeholder: "Auto-filled from map"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Latitude" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							name: "latitude",
							value: form.latitude,
							onChange: handleChange,
							readOnly: true,
							placeholder: "Auto-filled from map"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Longitude" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							name: "longitude",
							value: form.longitude,
							onChange: handleChange,
							readOnly: true,
							placeholder: "Auto-filled from map"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "primary-btn",
				type: "submit",
				disabled: loading || uploading,
				children: uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Issue"
			})
		]
	}), showMap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPickerModal, {
		onClose: () => setShowMap(false),
		onSelect: handleMapSelect
	})] });
}
//#endregion
//#region src/graphql/mutations/issueMutations.js
var { gql: gql$4 } = await importShared("@apollo/client");
var REPORT_ISSUE = gql$4`
  mutation ReportIssue($input: ReportIssueInput!) {
    reportIssue(input: $input) {
      success
      message
      issue {
        id
        title
        description
        category
        aiCategory
        aiSummary
        priority
        status
        photoUrl
        urgentAlert
        createdAt
        updatedAt

        reportedByUsername
        assignedToUsername

        location {
          address
          latitude
          longitude
          neighborhood
        }
      }
    }
  }
`;
//#endregion
//#region src/graphql/queries/analyticsQueries.js
var { gql: gql$3 } = await importShared("@apollo/client");
var CLASSIFY_ISSUE_QUERY = gql$3`
  query ClassifyIssue($title: String!, $description: String!) {
    classifyIssue(title: $title, description: $description) {
      success
      message
      category
      priority
      summary
    }
  }
`;
//#endregion
//#region src/pages/resident/ReportIssuePage.jsx
var { useState: useState$1 } = await importShared("react");
var formatLabel$2 = (value) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";
function ReportIssuePage() {
	const apolloClient = useApolloClient();
	const [reportIssue, { loading, data, error }] = useMutation(REPORT_ISSUE);
	const [classificationError, setClassificationError] = useState$1("");
	const [createdIssue, setCreatedIssue] = useState$1(null);
	const handleSubmit = async (input) => {
		try {
			setClassificationError("");
			setCreatedIssue(null);
			let resolvedCategory = input.category || "other";
			let resolvedPriority = input.priority || "medium";
			let aiSummary = "";
			try {
				const { data: classifyData } = await apolloClient.query({
					query: CLASSIFY_ISSUE_QUERY,
					variables: {
						title: input.title,
						description: input.description
					},
					fetchPolicy: "no-cache"
				});
				const classification = classifyData?.classifyIssue;
				if (classification?.success) {
					resolvedCategory = classification.category || resolvedCategory;
					resolvedPriority = classification.priority || resolvedPriority;
					aiSummary = classification.summary || "";
				} else setClassificationError(classification?.message || "AI categorization was unavailable. The issue was still submitted.");
			} catch (classifyError) {
				console.error("Issue classification failed:", classifyError.message);
				setClassificationError("AI categorization was unavailable. The issue was still submitted with your selected values.");
			}
			setCreatedIssue((await reportIssue({ variables: { input: {
				...input,
				category: resolvedCategory,
				priority: resolvedPriority,
				aiCategory: resolvedCategory,
				aiSummary
			} } }))?.data?.reportIssue?.issue || null);
		} catch (err) {
			console.error("Report issue failed:", err.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-wrapper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueForm, {
				onSubmit: handleSubmit,
				loading
			}),
			data?.reportIssue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `message-card ${data.reportIssue.success ? "success-card" : "error-card"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: data.reportIssue.message })
			}),
			classificationError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "message-card error-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "AI Notice:" }),
					" ",
					classificationError
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "message-card error-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Error:" }),
					" ",
					error.message
				]
			}),
			createdIssue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "message-card success-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "AI Category:" }),
					" ",
					formatLabel$2(createdIssue.aiCategory || createdIssue.category),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Priority:" }),
					" ",
					formatLabel$2(createdIssue.priority),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "AI Summary:" }),
					" ",
					createdIssue.aiSummary || "No AI summary available."
				]
			})
		]
	});
}
//#endregion
//#region src/graphql/queries/issueQueries.js
var { gql: gql$2 } = await importShared("@apollo/client");
var MY_ISSUES = gql$2`
  query MyIssues {
    myIssues {
      id
      title
      description
      category
      aiCategory
      aiSummary
      priority
      status
      photoUrl
      urgentAlert
      internalNotes
      reportedBy
      reportedByUsername
      assignedTo
      assignedToUsername
      createdAt
      updatedAt
      location {
        address
        latitude
        longitude
        neighborhood
      }
    }
  }
`;
var ISSUE_BY_ID = gql$2`
  query IssueById($id: ID!) {
    issueById(id: $id) {
      id
      title
      description
      category
      aiCategory
      aiSummary
      priority
      status
      photoUrl
      urgentAlert
      internalNotes
      reportedBy
      reportedByUsername
      assignedTo
      assignedToUsername
      createdAt
      updatedAt
      location {
        address
        latitude
        longitude
        neighborhood
      }
    }
  }
`;
//#endregion
//#region src/components/common/LoadingSpinner.jsx
function LoadingSpinner({ text = "Loading..." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "center-box",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "spinner" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: text })]
	});
}
//#endregion
//#region src/components/common/ErrorMessage.jsx
function ErrorMessage({ message = "Something went wrong." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "message-card error-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Error:" }),
			" ",
			message
		]
	});
}
//#endregion
//#region src/components/common/EmptyState.jsx
function EmptyState({ title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "message-card empty-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: subtitle })]
	});
}
//#endregion
//#region src/utils/getStatusColor.js
function getStatusColor(status) {
	const value = String(status || "").toLowerCase();
	if (value === "reported") return "status-reported";
	if (value === "assigned") return "status-assigned";
	if (value === "in_progress") return "status-progress";
	if (value === "resolved") return "status-resolved";
	return "status-default";
}
//#endregion
//#region src/components/common/StatusBadge.jsx
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `status-badge ${getStatusColor(status)}`,
		children: String(status || "unknown")
	});
}
//#endregion
//#region src/utils/formatDate.js
function formatDate(dateString) {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleString("en-CA", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
//#endregion
//#region src/components/resident/IssueCard.jsx
var { Link: Link$2 } = await importShared("react-router-dom");
var formatLabel$1 = (value) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";
function IssueCard({ issue }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card issue-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "issue-card-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: issue.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: issue.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "issue-text",
				children: issue.description?.length > 140 ? `${issue.description.slice(0, 140)}...` : issue.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "issue-meta",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Category:" }),
						" ",
						formatLabel$1(issue.category)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Priority:" }),
						" ",
						formatLabel$1(issue.priority)
					] }),
					issue.urgentAlert && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Urgent:" }), " Yes"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "issue-meta",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Address:" }),
					" ",
					issue.location?.address || "N/A"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Neighborhood:" }),
					" ",
					issue.location?.neighborhood || "N/A"
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "issue-footer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Created: ", formatDate(issue.createdAt)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$2, {
					className: "secondary-btn",
					to: `/issues/${issue.id}`,
					children: "View Details"
				})]
			})
		]
	});
}
//#endregion
//#region src/components/resident/IssueList.jsx
function IssueList({ issues }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "list-grid",
		children: issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueCard, { issue }, issue.id))
	});
}
//#endregion
//#region src/pages/resident/MyIssuesPage.jsx
function MyIssuesPage() {
	const { data, loading, error } = useQuery(MY_ISSUES, { fetchPolicy: "network-only" });
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSpinner, { text: "Loading your issues..." });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: error.message });
	const issues = Array.isArray(data?.myIssues) ? data.myIssues : [];
	if (!issues.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "No issues found",
		subtitle: "You have not reported any issues yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-wrapper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-header",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "My Issues" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Track the issues you have reported." })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueList, { issues })]
	});
}
//#endregion
//#region src/pages/resident/IssueDetailsPage.jsx
var { useParams } = await importShared("react-router-dom");
var formatLabel = (value) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "N/A";
function IssueDetailsPage() {
	const { id } = useParams();
	const { data, loading, error } = useQuery(ISSUE_BY_ID, {
		variables: { id },
		fetchPolicy: "network-only"
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSpinner, { text: "Loading issue details..." });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: error.message });
	const issue = data?.issueById;
	if (!issue) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: "Issue not found." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-wrapper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card details-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "details-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: issue.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: issue.status })]
				}),
				issue.urgentAlert && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						color: "#b91c1c",
						fontWeight: "bold",
						marginBottom: "10px"
					},
					children: "🚨 Urgent Issue"
				}),
				issue.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "details-section",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						className: "issue-photo",
						src: issue.photoUrl,
						alt: issue.title
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "issue-text",
					children: issue.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "details-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Category:" }),
							" ",
							formatLabel(issue.category)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "AI Category:" }),
							" ",
							formatLabel(issue.aiCategory)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Priority:" }),
							" ",
							formatLabel(issue.priority)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Reported By:" }),
							" ",
							issue.reportedByUsername
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Assigned To:" }),
							" ",
							issue.assignedToUsername || "Not assigned"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Address:" }),
							" ",
							issue.location?.address || "N/A"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Neighborhood:" }),
							" ",
							issue.location?.neighborhood || "N/A"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Latitude:" }),
							" ",
							issue.location?.latitude ?? "N/A"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Longitude:" }),
							" ",
							issue.location?.longitude ?? "N/A"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Created:" }),
							" ",
							formatDate(issue.createdAt)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Updated:" }),
							" ",
							formatDate(issue.updatedAt)
						] })
					]
				}),
				issue.aiSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "details-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "AI Summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: issue.aiSummary })]
				}),
				issue.internalNotes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "details-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Internal Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: issue.internalNotes })]
				})
			]
		})
	});
}
//#endregion
//#region src/graphql/queries/notificationQueries.js
var { gql: gql$1 } = await importShared("@apollo/client");
var GET_NOTIFICATIONS = gql$1`
  query GetNotifications {
    notifications {
      id
      userId
      issueId
      message
      type
      isRead
      createdAt
      updatedAt
    }
  }
`;
//#endregion
//#region src/graphql/mutations/notificationMutations.js
var { gql } = await importShared("@apollo/client");
var MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      message
      notification {
        id
        userId
        issueId
        message
        type
        isRead
        createdAt
        updatedAt
      }
    }
  }
`;
//#endregion
//#region src/components/resident/NotificationCard.jsx
function formatNotificationType(type) {
	return String(type || "general").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function NotificationCard({ notification, onMarkRead, loadingId }) {
	const isUrgent = notification.type === "urgent_alert";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `card notification-card ${notification.isRead ? "read" : "unread"} ${isUrgent ? "notification-urgent" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "notification-top",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "notification-type-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: formatNotificationType(notification.type) }), isUrgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "urgent-pill",
					children: "Urgent"
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: notification.message })] }), !notification.isRead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "secondary-btn",
				onClick: () => onMarkRead(notification.id),
				disabled: loadingId === notification.id,
				children: loadingId === notification.id ? "Saving..." : "Mark as Read"
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatDate(notification.createdAt) })]
	});
}
//#endregion
//#region src/components/resident/NotificationList.jsx
function NotificationList({ notifications, onMarkRead, loadingId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "list-grid",
		children: notifications.map((notification) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationCard, {
			notification,
			onMarkRead,
			loadingId
		}, notification.id))
	});
}
//#endregion
//#region src/pages/resident/NotificationsPage.jsx
var { useState } = await importShared("react");
function NotificationsPage() {
	const [loadingId, setLoadingId] = useState(null);
	const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, { fetchPolicy: "network-only" });
	const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const handleMarkRead = async (notificationId) => {
		try {
			setLoadingId(notificationId);
			await markNotificationAsRead({ variables: { notificationId } });
			await refetch();
		} catch (err) {
			console.error("Failed to mark notification as read:", err.message);
		} finally {
			setLoadingId(null);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSpinner, { text: "Loading notifications..." });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: error.message });
	const notifications = data?.notifications || [];
	if (!notifications.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "No notifications",
		subtitle: "You do not have any notifications yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-wrapper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-header",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Notifications & Alerts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Review issue updates, assignments, status changes, and urgent municipal alerts." })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationList, {
			notifications,
			onMarkRead: handleMarkRead,
			loadingId
		})]
	});
}
//#endregion
//#region src/pages/NotFoundPage.jsx
var { Link: Link$1 } = await importShared("react-router-dom");
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "center-box",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "404" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Page not found." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				className: "primary-btn",
				to: "/report-issue",
				children: "Go Home"
			})
		]
	});
}
//#endregion
//#region src/routes/AppRoutes.jsx
var { Routes, Route, Navigate, Link, useLocation } = await importShared("react-router-dom");
function Navigation() {
	const location = useLocation();
	const { data } = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: "network-only",
		pollInterval: 5e3
	});
	const unreadCount = (data?.notifications || []).filter((notification) => !notification.isRead).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "top-nav",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "nav-brand",
			children: "CivicCase Resident Portal"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "nav-links",
			children: [
				{
					to: "/report-issue",
					label: "Report Issue"
				},
				{
					to: "/my-issues",
					label: "My Issues"
				},
				{
					to: "/notifications",
					label: "Notifications"
				}
			].map((link) => {
				const isNotifications = link.to === "/notifications";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: link.to,
					className: location.pathname === link.to ? "nav-link active" : "nav-link",
					style: { position: "relative" },
					children: [link.label, isNotifications && unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "notification-badge",
						children: unreadCount
					}) : null]
				}, link.to);
			})
		})]
	});
}
function AppRoutes() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "main-content",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "/",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
						to: "/report-issue",
						replace: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "/report-issue",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportIssuePage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "/my-issues",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MyIssuesPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "/issues/:id",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueDetailsPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "/notifications",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
					path: "*",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFoundPage, {})
				})
			] })
		})]
	});
}
//#endregion
//#region src/services/apolloClient.js
var { ApolloClient, InMemoryCache, createHttpLink } = await importShared("@apollo/client");
var client = new ApolloClient({
	link: createHttpLink({
		uri: "http://localhost:4000/graphql",
		credentials: "include"
	}),
	cache: new InMemoryCache()
});
//#endregion
//#region src/bootstrap.jsx
var { BrowserRouter } = await importShared("react-router-dom");
function IssueApp() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApolloProvider, {
		client,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserRouter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppRoutes, {}) })
	});
}
//#endregion
export { require_jsx_runtime as n, IssueApp as t };
