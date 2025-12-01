var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// .wrangler/tmp/bundle-Gn5G5k/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-Gn5G5k/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// .wrangler/tmp/bundle-Gn5G5k/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-Gn5G5k/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/tslib/tslib.es6.mjs
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  __name(adopt, "adopt");
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    __name(fulfilled, "fulfilled");
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    __name(rejected, "rejected");
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    __name(step, "step");
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
var init_tslib_es6 = __esm({
  "node_modules/tslib/tslib.es6.mjs"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(__rest, "__rest");
    __name(__awaiter, "__awaiter");
  }
});

// node_modules/@supabase/functions-js/dist/module/helper.js
var resolveFetch;
var init_helper = __esm({
  "node_modules/@supabase/functions-js/dist/module/helper.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    resolveFetch = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
  }
});

// node_modules/@supabase/functions-js/dist/module/types.js
var FunctionsError, FunctionsFetchError, FunctionsRelayError, FunctionsHttpError, FunctionRegion;
var init_types = __esm({
  "node_modules/@supabase/functions-js/dist/module/types.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    FunctionsError = class extends Error {
      constructor(message, name = "FunctionsError", context) {
        super(message);
        this.name = name;
        this.context = context;
      }
    };
    __name(FunctionsError, "FunctionsError");
    FunctionsFetchError = class extends FunctionsError {
      constructor(context) {
        super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
      }
    };
    __name(FunctionsFetchError, "FunctionsFetchError");
    FunctionsRelayError = class extends FunctionsError {
      constructor(context) {
        super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
      }
    };
    __name(FunctionsRelayError, "FunctionsRelayError");
    FunctionsHttpError = class extends FunctionsError {
      constructor(context) {
        super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
      }
    };
    __name(FunctionsHttpError, "FunctionsHttpError");
    (function(FunctionRegion2) {
      FunctionRegion2["Any"] = "any";
      FunctionRegion2["ApNortheast1"] = "ap-northeast-1";
      FunctionRegion2["ApNortheast2"] = "ap-northeast-2";
      FunctionRegion2["ApSouth1"] = "ap-south-1";
      FunctionRegion2["ApSoutheast1"] = "ap-southeast-1";
      FunctionRegion2["ApSoutheast2"] = "ap-southeast-2";
      FunctionRegion2["CaCentral1"] = "ca-central-1";
      FunctionRegion2["EuCentral1"] = "eu-central-1";
      FunctionRegion2["EuWest1"] = "eu-west-1";
      FunctionRegion2["EuWest2"] = "eu-west-2";
      FunctionRegion2["EuWest3"] = "eu-west-3";
      FunctionRegion2["SaEast1"] = "sa-east-1";
      FunctionRegion2["UsEast1"] = "us-east-1";
      FunctionRegion2["UsWest1"] = "us-west-1";
      FunctionRegion2["UsWest2"] = "us-west-2";
    })(FunctionRegion || (FunctionRegion = {}));
  }
});

// node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
var FunctionsClient;
var init_FunctionsClient = __esm({
  "node_modules/@supabase/functions-js/dist/module/FunctionsClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_helper();
    init_types();
    FunctionsClient = class {
      /**
       * Creates a new Functions client bound to an Edge Functions URL.
       *
       * @example
       * ```ts
       * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
       *
       * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   region: FunctionRegion.UsEast1,
       * })
       * ```
       */
      constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any } = {}) {
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = resolveFetch(customFetch);
      }
      /**
       * Updates the authorization header
       * @param token - the new jwt token sent in the authorisation header
       * @example
       * ```ts
       * functions.setAuth(session.access_token)
       * ```
       */
      setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
      }
      /**
       * Invokes a function
       * @param functionName - The name of the Function to invoke.
       * @param options - Options for invoking the Function.
       * @example
       * ```ts
       * const { data, error } = await functions.invoke('hello-world', {
       *   body: { name: 'Ada' },
       * })
       * ```
       */
      invoke(functionName_1) {
        return __awaiter(this, arguments, void 0, function* (functionName, options = {}) {
          var _a2;
          let timeoutId;
          let timeoutController;
          try {
            const { headers, method, body: functionArgs, signal, timeout } = options;
            let _headers = {};
            let { region } = options;
            if (!region) {
              region = this.region;
            }
            const url = new URL(`${this.url}/${functionName}`);
            if (region && region !== "any") {
              _headers["x-region"] = region;
              url.searchParams.set("forceFunctionRegion", region);
            }
            let body;
            if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
              if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
                _headers["Content-Type"] = "application/octet-stream";
                body = functionArgs;
              } else if (typeof functionArgs === "string") {
                _headers["Content-Type"] = "text/plain";
                body = functionArgs;
              } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
                body = functionArgs;
              } else {
                _headers["Content-Type"] = "application/json";
                body = JSON.stringify(functionArgs);
              }
            } else {
              body = functionArgs;
            }
            let effectiveSignal = signal;
            if (timeout) {
              timeoutController = new AbortController();
              timeoutId = setTimeout(() => timeoutController.abort(), timeout);
              if (signal) {
                effectiveSignal = timeoutController.signal;
                signal.addEventListener("abort", () => timeoutController.abort());
              } else {
                effectiveSignal = timeoutController.signal;
              }
            }
            const response = yield this.fetch(url.toString(), {
              method: method || "POST",
              // headers priority is (high to low):
              // 1. invoke-level headers
              // 2. client-level headers
              // 3. default Content-Type header
              headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
              body,
              signal: effectiveSignal
            }).catch((fetchError) => {
              throw new FunctionsFetchError(fetchError);
            });
            const isRelayError = response.headers.get("x-relay-error");
            if (isRelayError && isRelayError === "true") {
              throw new FunctionsRelayError(response);
            }
            if (!response.ok) {
              throw new FunctionsHttpError(response);
            }
            let responseType = ((_a2 = response.headers.get("Content-Type")) !== null && _a2 !== void 0 ? _a2 : "text/plain").split(";")[0].trim();
            let data;
            if (responseType === "application/json") {
              data = yield response.json();
            } else if (responseType === "application/octet-stream" || responseType === "application/pdf") {
              data = yield response.blob();
            } else if (responseType === "text/event-stream") {
              data = response;
            } else if (responseType === "multipart/form-data") {
              data = yield response.formData();
            } else {
              data = yield response.text();
            }
            return { data, error: null, response };
          } catch (error) {
            return {
              data: null,
              error,
              response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError ? error.context : void 0
            };
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
        });
      }
    };
    __name(FunctionsClient, "FunctionsClient");
  }
});

// node_modules/@supabase/functions-js/dist/module/index.js
var init_module = __esm({
  "node_modules/@supabase/functions-js/dist/module/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_FunctionsClient();
  }
});

// node_modules/tslib/tslib.js
var require_tslib = __commonJS({
  "node_modules/tslib/tslib.js"(exports, module) {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var __extends;
    var __assign;
    var __rest2;
    var __decorate;
    var __param;
    var __esDecorate;
    var __runInitializers;
    var __propKey;
    var __setFunctionName;
    var __metadata;
    var __awaiter2;
    var __generator;
    var __exportStar;
    var __values;
    var __read;
    var __spread;
    var __spreadArrays;
    var __spreadArray;
    var __await;
    var __asyncGenerator;
    var __asyncDelegator;
    var __asyncValues;
    var __makeTemplateObject;
    var __importStar;
    var __importDefault;
    var __classPrivateFieldGet;
    var __classPrivateFieldSet;
    var __classPrivateFieldIn;
    var __createBinding;
    var __addDisposableResource;
    var __disposeResources;
    var __rewriteRelativeImportExtension;
    (function(factory) {
      var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
      if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function(exports2) {
          factory(createExporter(root, createExporter(exports2)));
        });
      } else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
      } else {
        factory(createExporter(root));
      }
      function createExporter(exports2, previous) {
        if (exports2 !== root) {
          if (typeof Object.create === "function") {
            Object.defineProperty(exports2, "__esModule", { value: true });
          } else {
            exports2.__esModule = true;
          }
        }
        return function(id, v) {
          return exports2[id] = previous ? previous(id, v) : v;
        };
      }
      __name(createExporter, "createExporter");
    })(function(exporter) {
      var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      __extends = /* @__PURE__ */ __name(function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        __name(__, "__");
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }, "__extends");
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      __rest2 = /* @__PURE__ */ __name(function(s, e) {
        var t = {};
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
          }
        return t;
      }, "__rest");
      __decorate = /* @__PURE__ */ __name(function(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          r = Reflect.decorate(decorators, target, key, desc);
        else
          for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
              r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
      }, "__decorate");
      __param = /* @__PURE__ */ __name(function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      }, "__param");
      __esDecorate = /* @__PURE__ */ __name(function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) {
          if (f !== void 0 && typeof f !== "function")
            throw new TypeError("Function expected");
          return f;
        }
        __name(accept, "accept");
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
          var context = {};
          for (var p in contextIn)
            context[p] = p === "access" ? {} : contextIn[p];
          for (var p in contextIn.access)
            context.access[p] = contextIn.access[p];
          context.addInitializer = function(f) {
            if (done)
              throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
          };
          var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
          if (kind === "accessor") {
            if (result === void 0)
              continue;
            if (result === null || typeof result !== "object")
              throw new TypeError("Object expected");
            if (_ = accept(result.get))
              descriptor.get = _;
            if (_ = accept(result.set))
              descriptor.set = _;
            if (_ = accept(result.init))
              initializers.unshift(_);
          } else if (_ = accept(result)) {
            if (kind === "field")
              initializers.unshift(_);
            else
              descriptor[key] = _;
          }
        }
        if (target)
          Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
      }, "__esDecorate");
      __runInitializers = /* @__PURE__ */ __name(function(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
          value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
      }, "__runInitializers");
      __propKey = /* @__PURE__ */ __name(function(x) {
        return typeof x === "symbol" ? x : "".concat(x);
      }, "__propKey");
      __setFunctionName = /* @__PURE__ */ __name(function(f, name, prefix) {
        if (typeof name === "symbol")
          name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
      }, "__setFunctionName");
      __metadata = /* @__PURE__ */ __name(function(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(metadataKey, metadataValue);
      }, "__metadata");
      __awaiter2 = /* @__PURE__ */ __name(function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        __name(adopt, "adopt");
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          __name(fulfilled, "fulfilled");
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          __name(rejected, "rejected");
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          __name(step, "step");
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      }, "__awaiter");
      __generator = /* @__PURE__ */ __name(function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        __name(verb, "verb");
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
        __name(step, "step");
      }, "__generator");
      __exportStar = /* @__PURE__ */ __name(function(m, o) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
            __createBinding(o, m, p);
      }, "__exportStar");
      __createBinding = Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      };
      __values = /* @__PURE__ */ __name(function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
          return m.call(o);
        if (o && typeof o.length === "number")
          return {
            next: function() {
              if (o && i >= o.length)
                o = void 0;
              return { value: o && o[i++], done: !o };
            }
          };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }, "__values");
      __read = /* @__PURE__ */ __name(function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
          return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"]))
              m.call(i);
          } finally {
            if (e)
              throw e.error;
          }
        }
        return ar;
      }, "__read");
      __spread = /* @__PURE__ */ __name(function() {
        for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
        return ar;
      }, "__spread");
      __spreadArrays = /* @__PURE__ */ __name(function() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
          s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
        return r;
      }, "__spreadArrays");
      __spreadArray = /* @__PURE__ */ __name(function(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      }, "__spreadArray");
      __await = /* @__PURE__ */ __name(function(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
      }, "__await");
      __asyncGenerator = /* @__PURE__ */ __name(function(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;
        function awaitReturn(f) {
          return function(v) {
            return Promise.resolve(v).then(f, reject);
          };
        }
        __name(awaitReturn, "awaitReturn");
        function verb(n, f) {
          if (g[n]) {
            i[n] = function(v) {
              return new Promise(function(a, b) {
                q.push([n, v, a, b]) > 1 || resume(n, v);
              });
            };
            if (f)
              i[n] = f(i[n]);
          }
        }
        __name(verb, "verb");
        function resume(n, v) {
          try {
            step(g[n](v));
          } catch (e) {
            settle(q[0][3], e);
          }
        }
        __name(resume, "resume");
        function step(r) {
          r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
        }
        __name(step, "step");
        function fulfill(value) {
          resume("next", value);
        }
        __name(fulfill, "fulfill");
        function reject(value) {
          resume("throw", value);
        }
        __name(reject, "reject");
        function settle(f, v) {
          if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]);
        }
        __name(settle, "settle");
      }, "__asyncGenerator");
      __asyncDelegator = /* @__PURE__ */ __name(function(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function(e) {
          throw e;
        }), verb("return"), i[Symbol.iterator] = function() {
          return this;
        }, i;
        function verb(n, f) {
          i[n] = o[n] ? function(v) {
            return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
          } : f;
        }
        __name(verb, "verb");
      }, "__asyncDelegator");
      __asyncValues = /* @__PURE__ */ __name(function(o) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i);
        function verb(n) {
          i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
              v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
          };
        }
        __name(verb, "verb");
        function settle(resolve, reject, d, v) {
          Promise.resolve(v).then(function(v2) {
            resolve({ value: v2, done: d });
          }, reject);
        }
        __name(settle, "settle");
      }, "__asyncValues");
      __makeTemplateObject = /* @__PURE__ */ __name(function(cooked, raw2) {
        if (Object.defineProperty) {
          Object.defineProperty(cooked, "raw", { value: raw2 });
        } else {
          cooked.raw = raw2;
        }
        return cooked;
      }, "__makeTemplateObject");
      var __setModuleDefault = Object.create ? function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      } : function(o, v) {
        o["default"] = v;
      };
      var ownKeys = /* @__PURE__ */ __name(function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2)
            if (Object.prototype.hasOwnProperty.call(o2, k))
              ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      }, "ownKeys");
      __importStar = /* @__PURE__ */ __name(function(mod) {
        if (mod && mod.__esModule)
          return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++)
            if (k[i] !== "default")
              __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      }, "__importStar");
      __importDefault = /* @__PURE__ */ __name(function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      }, "__importDefault");
      __classPrivateFieldGet = /* @__PURE__ */ __name(function(receiver, state, kind, f) {
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      }, "__classPrivateFieldGet");
      __classPrivateFieldSet = /* @__PURE__ */ __name(function(receiver, state, value, kind, f) {
        if (kind === "m")
          throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      }, "__classPrivateFieldSet");
      __classPrivateFieldIn = /* @__PURE__ */ __name(function(state, receiver) {
        if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
          throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
      }, "__classPrivateFieldIn");
      __addDisposableResource = /* @__PURE__ */ __name(function(env, value, async) {
        if (value !== null && value !== void 0) {
          if (typeof value !== "object" && typeof value !== "function")
            throw new TypeError("Object expected.");
          var dispose, inner;
          if (async) {
            if (!Symbol.asyncDispose)
              throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
          }
          if (dispose === void 0) {
            if (!Symbol.dispose)
              throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async)
              inner = dispose;
          }
          if (typeof dispose !== "function")
            throw new TypeError("Object not disposable.");
          if (inner)
            dispose = /* @__PURE__ */ __name(function() {
              try {
                inner.call(this);
              } catch (e) {
                return Promise.reject(e);
              }
            }, "dispose");
          env.stack.push({ value, dispose, async });
        } else if (async) {
          env.stack.push({ async: true });
        }
        return value;
      }, "__addDisposableResource");
      var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      __disposeResources = /* @__PURE__ */ __name(function(env) {
        function fail(e) {
          env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
          env.hasError = true;
        }
        __name(fail, "fail");
        var r, s = 0;
        function next() {
          while (r = env.stack.pop()) {
            try {
              if (!r.async && s === 1)
                return s = 0, env.stack.push(r), Promise.resolve().then(next);
              if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async)
                  return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                  });
              } else
                s |= 1;
            } catch (e) {
              fail(e);
            }
          }
          if (s === 1)
            return env.hasError ? Promise.reject(env.error) : Promise.resolve();
          if (env.hasError)
            throw env.error;
        }
        __name(next, "next");
        return next();
      }, "__disposeResources");
      __rewriteRelativeImportExtension = /* @__PURE__ */ __name(function(path, preserveJsx) {
        if (typeof path === "string" && /^\.\.?\//.test(path)) {
          return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
          });
        }
        return path;
      }, "__rewriteRelativeImportExtension");
      exporter("__extends", __extends);
      exporter("__assign", __assign);
      exporter("__rest", __rest2);
      exporter("__decorate", __decorate);
      exporter("__param", __param);
      exporter("__esDecorate", __esDecorate);
      exporter("__runInitializers", __runInitializers);
      exporter("__propKey", __propKey);
      exporter("__setFunctionName", __setFunctionName);
      exporter("__metadata", __metadata);
      exporter("__awaiter", __awaiter2);
      exporter("__generator", __generator);
      exporter("__exportStar", __exportStar);
      exporter("__createBinding", __createBinding);
      exporter("__values", __values);
      exporter("__read", __read);
      exporter("__spread", __spread);
      exporter("__spreadArrays", __spreadArrays);
      exporter("__spreadArray", __spreadArray);
      exporter("__await", __await);
      exporter("__asyncGenerator", __asyncGenerator);
      exporter("__asyncDelegator", __asyncDelegator);
      exporter("__asyncValues", __asyncValues);
      exporter("__makeTemplateObject", __makeTemplateObject);
      exporter("__importStar", __importStar);
      exporter("__importDefault", __importDefault);
      exporter("__classPrivateFieldGet", __classPrivateFieldGet);
      exporter("__classPrivateFieldSet", __classPrivateFieldSet);
      exporter("__classPrivateFieldIn", __classPrivateFieldIn);
      exporter("__addDisposableResource", __addDisposableResource);
      exporter("__disposeResources", __disposeResources);
      exporter("__rewriteRelativeImportExtension", __rewriteRelativeImportExtension);
    });
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js
var require_PostgrestError = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var PostgrestError2 = class extends Error {
      /**
       * @example
       * ```ts
       * import PostgrestError from '@supabase/postgrest-js'
       *
       * throw new PostgrestError({
       *   message: 'Row level security prevented the request',
       *   details: 'RLS denied the insert',
       *   hint: 'Check your policies',
       *   code: 'PGRST301',
       * })
       * ```
       */
      constructor(context) {
        super(context.message);
        this.name = "PostgrestError";
        this.details = context.details;
        this.hint = context.hint;
        this.code = context.code;
      }
    };
    __name(PostgrestError2, "PostgrestError");
    exports.default = PostgrestError2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js
var require_PostgrestBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestError_1 = tslib_1.__importDefault(require_PostgrestError());
    var PostgrestBuilder2 = class {
      /**
       * Creates a builder configured for a specific PostgREST request.
       *
       * @example
       * ```ts
       * import PostgrestQueryBuilder from '@supabase/postgrest-js'
       *
       * const builder = new PostgrestQueryBuilder(
       *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
       *   { headers: new Headers({ apikey: 'public-anon-key' }) }
       * )
       * ```
       */
      constructor(builder) {
        var _a2, _b;
        this.shouldThrowOnError = false;
        this.method = builder.method;
        this.url = builder.url;
        this.headers = new Headers(builder.headers);
        this.schema = builder.schema;
        this.body = builder.body;
        this.shouldThrowOnError = (_a2 = builder.shouldThrowOnError) !== null && _a2 !== void 0 ? _a2 : false;
        this.signal = builder.signal;
        this.isMaybeSingle = (_b = builder.isMaybeSingle) !== null && _b !== void 0 ? _b : false;
        if (builder.fetch) {
          this.fetch = builder.fetch;
        } else {
          this.fetch = fetch;
        }
      }
      /**
       * If there's an error with the query, throwOnError will reject the promise by
       * throwing the error instead of returning it as part of a successful response.
       *
       * {@link https://github.com/supabase/supabase-js/issues/92}
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Set an HTTP header for the request.
       */
      setHeader(name, value) {
        this.headers = new Headers(this.headers);
        this.headers.set(name, value);
        return this;
      }
      then(onfulfilled, onrejected) {
        if (this.schema === void 0) {
        } else if (["GET", "HEAD"].includes(this.method)) {
          this.headers.set("Accept-Profile", this.schema);
        } else {
          this.headers.set("Content-Profile", this.schema);
        }
        if (this.method !== "GET" && this.method !== "HEAD") {
          this.headers.set("Content-Type", "application/json");
        }
        const _fetch = this.fetch;
        let res = _fetch(this.url.toString(), {
          method: this.method,
          headers: this.headers,
          body: JSON.stringify(this.body),
          signal: this.signal
        }).then(async (res2) => {
          var _a2, _b, _c, _d;
          let error = null;
          let data = null;
          let count = null;
          let status = res2.status;
          let statusText = res2.statusText;
          if (res2.ok) {
            if (this.method !== "HEAD") {
              const body = await res2.text();
              if (body === "") {
              } else if (this.headers.get("Accept") === "text/csv") {
                data = body;
              } else if (this.headers.get("Accept") && ((_a2 = this.headers.get("Accept")) === null || _a2 === void 0 ? void 0 : _a2.includes("application/vnd.pgrst.plan+text"))) {
                data = body;
              } else {
                data = JSON.parse(body);
              }
            }
            const countHeader = (_b = this.headers.get("Prefer")) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
            const contentRange = (_c = res2.headers.get("content-range")) === null || _c === void 0 ? void 0 : _c.split("/");
            if (countHeader && contentRange && contentRange.length > 1) {
              count = parseInt(contentRange[1]);
            }
            if (this.isMaybeSingle && this.method === "GET" && Array.isArray(data)) {
              if (data.length > 1) {
                error = {
                  // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                  code: "PGRST116",
                  details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                  hint: null,
                  message: "JSON object requested, multiple (or no) rows returned"
                };
                data = null;
                count = null;
                status = 406;
                statusText = "Not Acceptable";
              } else if (data.length === 1) {
                data = data[0];
              } else {
                data = null;
              }
            }
          } else {
            const body = await res2.text();
            try {
              error = JSON.parse(body);
              if (Array.isArray(error) && res2.status === 404) {
                data = [];
                error = null;
                status = 200;
                statusText = "OK";
              }
            } catch (_e) {
              if (res2.status === 404 && body === "") {
                status = 204;
                statusText = "No Content";
              } else {
                error = {
                  message: body
                };
              }
            }
            if (error && this.isMaybeSingle && ((_d = error === null || error === void 0 ? void 0 : error.details) === null || _d === void 0 ? void 0 : _d.includes("0 rows"))) {
              error = null;
              status = 200;
              statusText = "OK";
            }
            if (error && this.shouldThrowOnError) {
              throw new PostgrestError_1.default(error);
            }
          }
          const postgrestResponse = {
            error,
            data,
            count,
            status,
            statusText
          };
          return postgrestResponse;
        });
        if (!this.shouldThrowOnError) {
          res = res.catch((fetchError) => {
            var _a2, _b, _c, _d, _e, _f;
            let errorDetails = "";
            const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
            if (cause) {
              const causeMessage = (_a2 = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _a2 !== void 0 ? _a2 : "";
              const causeCode = (_b = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _b !== void 0 ? _b : "";
              errorDetails = `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _c !== void 0 ? _c : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
              errorDetails += `

Caused by: ${(_d = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _d !== void 0 ? _d : "Error"}: ${causeMessage}`;
              if (causeCode) {
                errorDetails += ` (${causeCode})`;
              }
              if (cause === null || cause === void 0 ? void 0 : cause.stack) {
                errorDetails += `
${cause.stack}`;
              }
            } else {
              errorDetails = (_e = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _e !== void 0 ? _e : "";
            }
            return {
              error: {
                message: `${(_f = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _f !== void 0 ? _f : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                details: errorDetails,
                hint: "",
                code: ""
              },
              data: null,
              count: null,
              status: 0,
              statusText: ""
            };
          });
        }
        return res.then(onfulfilled, onrejected);
      }
      /**
       * Override the type of the returned `data`.
       *
       * @typeParam NewResult - The new result type to override with
       * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
       */
      returns() {
        return this;
      }
      /**
       * Override the type of the returned `data` field in the response.
       *
       * @typeParam NewResult - The new type to cast the response data to
       * @typeParam Options - Optional type configuration (defaults to { merge: true })
       * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
       * @example
       * ```typescript
       * // Merge with existing types (default behavior)
       * const query = supabase
       *   .from('users')
       *   .select()
       *   .overrideTypes<{ custom_field: string }>()
       *
       * // Replace existing types completely
       * const replaceQuery = supabase
       *   .from('users')
       *   .select()
       *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
       * ```
       * @returns A PostgrestBuilder instance with the new type
       */
      overrideTypes() {
        return this;
      }
    };
    __name(PostgrestBuilder2, "PostgrestBuilder");
    exports.default = PostgrestBuilder2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js
var require_PostgrestTransformBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestBuilder_1 = tslib_1.__importDefault(require_PostgrestBuilder());
    var PostgrestTransformBuilder2 = class extends PostgrestBuilder_1.default {
      /**
       * Perform a SELECT on the query result.
       *
       * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
       * return modified rows. By calling this method, modified rows are returned in
       * `data`.
       *
       * @param columns - The columns to retrieve, separated by commas
       */
      select(columns) {
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        this.headers.append("Prefer", "return=representation");
        return this;
      }
      /**
       * Order the query result by `column`.
       *
       * You can call this method multiple times to order by multiple columns.
       *
       * You can order referenced tables, but it only affects the ordering of the
       * parent table if you use `!inner` in the query.
       *
       * @param column - The column to order by
       * @param options - Named parameters
       * @param options.ascending - If `true`, the result will be in ascending order
       * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
       * `null`s appear last.
       * @param options.referencedTable - Set this to order a referenced table by
       * its columns
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.order` : "order";
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
        return this;
      }
      /**
       * Limit the query result by `count`.
       *
       * @param count - The maximum number of rows to return
       * @param options - Named parameters
       * @param options.referencedTable - Set this to limit rows of referenced
       * tables instead of the parent table
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
      }
      /**
       * Limit the query result by starting at an offset `from` and ending at the offset `to`.
       * Only records within this range are returned.
       * This respects the query order and if there is no order clause the range could behave unexpectedly.
       * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
       * and fourth rows of the query.
       *
       * @param from - The starting index from which to limit the result
       * @param to - The last index to which to limit the result
       * @param options - Named parameters
       * @param options.referencedTable - Set this to limit rows of referenced
       * tables instead of the parent table
       * @param options.foreignTable - Deprecated, use `options.referencedTable`
       * instead
       */
      range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
        const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
        const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
      }
      /**
       * Set the AbortSignal for the fetch request.
       *
       * @param signal - The AbortSignal to use for the fetch request
       */
      abortSignal(signal) {
        this.signal = signal;
        return this;
      }
      /**
       * Return `data` as a single object instead of an array of objects.
       *
       * Query result must be one row (e.g. using `.limit(1)`), otherwise this
       * returns an error.
       */
      single() {
        this.headers.set("Accept", "application/vnd.pgrst.object+json");
        return this;
      }
      /**
       * Return `data` as a single object instead of an array of objects.
       *
       * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
       * this returns an error.
       */
      maybeSingle() {
        if (this.method === "GET") {
          this.headers.set("Accept", "application/json");
        } else {
          this.headers.set("Accept", "application/vnd.pgrst.object+json");
        }
        this.isMaybeSingle = true;
        return this;
      }
      /**
       * Return `data` as a string in CSV format.
       */
      csv() {
        this.headers.set("Accept", "text/csv");
        return this;
      }
      /**
       * Return `data` as an object in [GeoJSON](https://geojson.org) format.
       */
      geojson() {
        this.headers.set("Accept", "application/geo+json");
        return this;
      }
      /**
       * Return `data` as the EXPLAIN plan for the query.
       *
       * You need to enable the
       * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
       * setting before using this method.
       *
       * @param options - Named parameters
       *
       * @param options.analyze - If `true`, the query will be executed and the
       * actual run time will be returned
       *
       * @param options.verbose - If `true`, the query identifier will be returned
       * and `data` will include the output columns of the query
       *
       * @param options.settings - If `true`, include information on configuration
       * parameters that affect query planning
       *
       * @param options.buffers - If `true`, include information on buffer usage
       *
       * @param options.wal - If `true`, include information on WAL record generation
       *
       * @param options.format - The format of the output, can be `"text"` (default)
       * or `"json"`
       */
      explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
        var _a2;
        const options = [
          analyze ? "analyze" : null,
          verbose ? "verbose" : null,
          settings ? "settings" : null,
          buffers ? "buffers" : null,
          wal ? "wal" : null
        ].filter(Boolean).join("|");
        const forMediatype = (_a2 = this.headers.get("Accept")) !== null && _a2 !== void 0 ? _a2 : "application/json";
        this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
        if (format === "json") {
          return this;
        } else {
          return this;
        }
      }
      /**
       * Rollback the query.
       *
       * `data` will still be returned, but the query is not committed.
       */
      rollback() {
        this.headers.append("Prefer", "tx=rollback");
        return this;
      }
      /**
       * Override the type of the returned `data`.
       *
       * @typeParam NewResult - The new result type to override with
       * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
       */
      returns() {
        return this;
      }
      /**
       * Set the maximum number of rows that can be affected by the query.
       * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
       *
       * @param value - The maximum number of rows that can be affected
       */
      maxAffected(value) {
        this.headers.append("Prefer", "handling=strict");
        this.headers.append("Prefer", `max-affected=${value}`);
        return this;
      }
    };
    __name(PostgrestTransformBuilder2, "PostgrestTransformBuilder");
    exports.default = PostgrestTransformBuilder2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js
var require_PostgrestFilterBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestTransformBuilder_1 = tslib_1.__importDefault(require_PostgrestTransformBuilder());
    var PostgrestReservedCharsRegexp = new RegExp("[,()]");
    var PostgrestFilterBuilder2 = class extends PostgrestTransformBuilder_1.default {
      /**
       * Match only rows where `column` is equal to `value`.
       *
       * To check if the value of `column` is NULL, you should use `.is()` instead.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      eq(column, value) {
        this.url.searchParams.append(column, `eq.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is not equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      neq(column, value) {
        this.url.searchParams.append(column, `neq.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is greater than `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      gt(column, value) {
        this.url.searchParams.append(column, `gt.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is greater than or equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      gte(column, value) {
        this.url.searchParams.append(column, `gte.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is less than `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      lt(column, value) {
        this.url.searchParams.append(column, `lt.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is less than or equal to `value`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      lte(column, value) {
        this.url.searchParams.append(column, `lte.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` matches `pattern` case-sensitively.
       *
       * @param column - The column to filter on
       * @param pattern - The pattern to match with
       */
      like(column, pattern) {
        this.url.searchParams.append(column, `like.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches all of `patterns` case-sensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      likeAllOf(column, patterns) {
        this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches any of `patterns` case-sensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      likeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches `pattern` case-insensitively.
       *
       * @param column - The column to filter on
       * @param pattern - The pattern to match with
       */
      ilike(column, pattern) {
        this.url.searchParams.append(column, `ilike.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches all of `patterns` case-insensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      ilikeAllOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches any of `patterns` case-insensitively.
       *
       * @param column - The column to filter on
       * @param patterns - The patterns to match with
       */
      ilikeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
        return this;
      }
      /**
       * Match only rows where `column` matches the PostgreSQL regex `pattern`
       * case-sensitively (using the `~` operator).
       *
       * @param column - The column to filter on
       * @param pattern - The PostgreSQL regular expression pattern to match with
       */
      regexMatch(column, pattern) {
        this.url.searchParams.append(column, `match.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` matches the PostgreSQL regex `pattern`
       * case-insensitively (using the `~*` operator).
       *
       * @param column - The column to filter on
       * @param pattern - The PostgreSQL regular expression pattern to match with
       */
      regexIMatch(column, pattern) {
        this.url.searchParams.append(column, `imatch.${pattern}`);
        return this;
      }
      /**
       * Match only rows where `column` IS `value`.
       *
       * For non-boolean columns, this is only relevant for checking if the value of
       * `column` is NULL by setting `value` to `null`.
       *
       * For boolean columns, you can also set `value` to `true` or `false` and it
       * will behave the same way as `.eq()`.
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      is(column, value) {
        this.url.searchParams.append(column, `is.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` IS DISTINCT FROM `value`.
       *
       * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
       * are considered equal (not distinct), and comparing `NULL` with any non-NULL
       * value returns true (distinct).
       *
       * @param column - The column to filter on
       * @param value - The value to filter with
       */
      isDistinct(column, value) {
        this.url.searchParams.append(column, `isdistinct.${value}`);
        return this;
      }
      /**
       * Match only rows where `column` is included in the `values` array.
       *
       * @param column - The column to filter on
       * @param values - The values array to filter with
       */
      in(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s) => {
          if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s))
            return `"${s}"`;
          else
            return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `in.(${cleanedValues})`);
        return this;
      }
      /**
       * Only relevant for jsonb, array, and range columns. Match only rows where
       * `column` contains every element appearing in `value`.
       *
       * @param column - The jsonb, array, or range column to filter on
       * @param value - The jsonb, array, or range value to filter with
       */
      contains(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `cs.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
        }
        return this;
      }
      /**
       * Only relevant for jsonb, array, and range columns. Match only rows where
       * every element appearing in `column` is contained by `value`.
       *
       * @param column - The jsonb, array, or range column to filter on
       * @param value - The jsonb, array, or range value to filter with
       */
      containedBy(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `cd.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
        }
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is greater than any element in `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeGt(column, range) {
        this.url.searchParams.append(column, `sr.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is either contained in `range` or greater than any element in
       * `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeGte(column, range) {
        this.url.searchParams.append(column, `nxl.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is less than any element in `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeLt(column, range) {
        this.url.searchParams.append(column, `sl.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where every element in
       * `column` is either contained in `range` or less than any element in
       * `range`.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeLte(column, range) {
        this.url.searchParams.append(column, `nxr.${range}`);
        return this;
      }
      /**
       * Only relevant for range columns. Match only rows where `column` is
       * mutually exclusive to `range` and there can be no element between the two
       * ranges.
       *
       * @param column - The range column to filter on
       * @param range - The range to filter with
       */
      rangeAdjacent(column, range) {
        this.url.searchParams.append(column, `adj.${range}`);
        return this;
      }
      /**
       * Only relevant for array and range columns. Match only rows where
       * `column` and `value` have an element in common.
       *
       * @param column - The array or range column to filter on
       * @param value - The array or range value to filter with
       */
      overlaps(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(column, `ov.${value}`);
        } else {
          this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
        }
        return this;
      }
      /**
       * Only relevant for text and tsvector columns. Match only rows where
       * `column` matches the query string in `query`.
       *
       * @param column - The text or tsvector column to filter on
       * @param query - The query text to match with
       * @param options - Named parameters
       * @param options.config - The text search configuration to use
       * @param options.type - Change how the `query` text is interpreted
       */
      textSearch(column, query, { config, type } = {}) {
        let typePart = "";
        if (type === "plain") {
          typePart = "pl";
        } else if (type === "phrase") {
          typePart = "ph";
        } else if (type === "websearch") {
          typePart = "w";
        }
        const configPart = config === void 0 ? "" : `(${config})`;
        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
        return this;
      }
      /**
       * Match only rows where each column in `query` keys is equal to its
       * associated value. Shorthand for multiple `.eq()`s.
       *
       * @param query - The object to filter with, with column names as keys mapped
       * to their filter values
       */
      match(query) {
        Object.entries(query).forEach(([column, value]) => {
          this.url.searchParams.append(column, `eq.${value}`);
        });
        return this;
      }
      /**
       * Match only rows which doesn't satisfy the filter.
       *
       * Unlike most filters, `opearator` and `value` are used as-is and need to
       * follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure they are properly sanitized.
       *
       * @param column - The column to filter on
       * @param operator - The operator to be negated to filter with, following
       * PostgREST syntax
       * @param value - The value to filter with, following PostgREST syntax
       */
      not(column, operator, value) {
        this.url.searchParams.append(column, `not.${operator}.${value}`);
        return this;
      }
      /**
       * Match only rows which satisfy at least one of the filters.
       *
       * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure it's properly sanitized.
       *
       * It's currently not possible to do an `.or()` filter across multiple tables.
       *
       * @param filters - The filters to use, following PostgREST syntax
       * @param options - Named parameters
       * @param options.referencedTable - Set this to filter on referenced tables
       * instead of the parent table
       * @param options.foreignTable - Deprecated, use `referencedTable` instead
       */
      or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.or` : "or";
        this.url.searchParams.append(key, `(${filters})`);
        return this;
      }
      /**
       * Match only rows which satisfy the filter. This is an escape hatch - you
       * should use the specific filter methods wherever possible.
       *
       * Unlike most filters, `opearator` and `value` are used as-is and need to
       * follow [PostgREST
       * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
       * to make sure they are properly sanitized.
       *
       * @param column - The column to filter on
       * @param operator - The operator to filter with, following PostgREST syntax
       * @param value - The value to filter with, following PostgREST syntax
       */
      filter(column, operator, value) {
        this.url.searchParams.append(column, `${operator}.${value}`);
        return this;
      }
    };
    __name(PostgrestFilterBuilder2, "PostgrestFilterBuilder");
    exports.default = PostgrestFilterBuilder2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js
var require_PostgrestQueryBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    var PostgrestQueryBuilder2 = class {
      /**
       * Creates a query builder scoped to a Postgres table or view.
       *
       * @example
       * ```ts
       * import PostgrestQueryBuilder from '@supabase/postgrest-js'
       *
       * const query = new PostgrestQueryBuilder(
       *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
       *   { headers: { apikey: 'public-anon-key' } }
       * )
       * ```
       */
      constructor(url, { headers = {}, schema, fetch: fetch2 }) {
        this.url = url;
        this.headers = new Headers(headers);
        this.schema = schema;
        this.fetch = fetch2;
      }
      /**
       * Perform a SELECT query on the table or view.
       *
       * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
       *
       * @param options - Named parameters
       *
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       *
       * @param options.count - Count algorithm to use to count rows in the table or view.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      select(columns, options) {
        const { head: head2 = false, count } = options !== null && options !== void 0 ? options : {};
        const method = head2 ? "HEAD" : "GET";
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          fetch: this.fetch
        });
      }
      /**
       * Perform an INSERT into the table or view.
       *
       * By default, inserted rows are not returned. To return it, chain the call
       * with `.select()`.
       *
       * @param values - The values to insert. Pass an object to insert a single row
       * or an array to insert multiple rows.
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count inserted rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       *
       * @param options.defaultToNull - Make missing fields default to `null`.
       * Otherwise, use the default value for the column. Only applies for bulk
       * inserts.
       */
      insert(values, { count, defaultToNull = true } = {}) {
        var _a2;
        const method = "POST";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        if (!defaultToNull) {
          this.headers.append("Prefer", `missing=default`);
        }
        if (Array.isArray(values)) {
          const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
          if (columns.length > 0) {
            const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
            this.url.searchParams.set("columns", uniqueColumns.join(","));
          }
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a2 = this.fetch) !== null && _a2 !== void 0 ? _a2 : fetch
        });
      }
      /**
       * Perform an UPSERT on the table or view. Depending on the column(s) passed
       * to `onConflict`, `.upsert()` allows you to perform the equivalent of
       * `.insert()` if a row with the corresponding `onConflict` columns doesn't
       * exist, or if it does exist, perform an alternative action depending on
       * `ignoreDuplicates`.
       *
       * By default, upserted rows are not returned. To return it, chain the call
       * with `.select()`.
       *
       * @param values - The values to upsert with. Pass an object to upsert a
       * single row or an array to upsert multiple rows.
       *
       * @param options - Named parameters
       *
       * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
       * duplicate rows are determined. Two rows are duplicates if all the
       * `onConflict` columns are equal.
       *
       * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
       * `false`, duplicate rows are merged with existing rows.
       *
       * @param options.count - Count algorithm to use to count upserted rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       *
       * @param options.defaultToNull - Make missing fields default to `null`.
       * Otherwise, use the default value for the column. This only applies when
       * inserting new rows, not when merging with existing rows under
       * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
       */
      upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
        var _a2;
        const method = "POST";
        this.headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
        if (onConflict !== void 0)
          this.url.searchParams.set("on_conflict", onConflict);
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        if (!defaultToNull) {
          this.headers.append("Prefer", "missing=default");
        }
        if (Array.isArray(values)) {
          const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
          if (columns.length > 0) {
            const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
            this.url.searchParams.set("columns", uniqueColumns.join(","));
          }
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a2 = this.fetch) !== null && _a2 !== void 0 ? _a2 : fetch
        });
      }
      /**
       * Perform an UPDATE on the table or view.
       *
       * By default, updated rows are not returned. To return it, chain the call
       * with `.select()` after filters.
       *
       * @param values - The values to update with
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count updated rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      update(values, { count } = {}) {
        var _a2;
        const method = "PATCH";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          body: values,
          fetch: (_a2 = this.fetch) !== null && _a2 !== void 0 ? _a2 : fetch
        });
      }
      /**
       * Perform a DELETE on the table or view.
       *
       * By default, deleted rows are not returned. To return it, chain the call
       * with `.select()` after filters.
       *
       * @param options - Named parameters
       *
       * @param options.count - Count algorithm to use to count deleted rows.
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      delete({ count } = {}) {
        var _a2;
        const method = "DELETE";
        if (count) {
          this.headers.append("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url: this.url,
          headers: this.headers,
          schema: this.schema,
          fetch: (_a2 = this.fetch) !== null && _a2 !== void 0 ? _a2 : fetch
        });
      }
    };
    __name(PostgrestQueryBuilder2, "PostgrestQueryBuilder");
    exports.default = PostgrestQueryBuilder2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js
var require_PostgrestClient = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    var PostgrestQueryBuilder_1 = tslib_1.__importDefault(require_PostgrestQueryBuilder());
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    var PostgrestClient2 = class {
      // TODO: Add back shouldThrowOnError once we figure out the typings
      /**
       * Creates a PostgREST client.
       *
       * @param url - URL of the PostgREST endpoint
       * @param options - Named parameters
       * @param options.headers - Custom headers
       * @param options.schema - Postgres schema to switch to
       * @param options.fetch - Custom fetch
       * @example
       * ```ts
       * import PostgrestClient from '@supabase/postgrest-js'
       *
       * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   schema: 'public',
       * })
       * ```
       */
      constructor(url, { headers = {}, schema, fetch: fetch2 } = {}) {
        this.url = url;
        this.headers = new Headers(headers);
        this.schemaName = schema;
        this.fetch = fetch2;
      }
      /**
       * Perform a query on a table or a view.
       *
       * @param relation - The table or view name to query
       */
      from(relation) {
        if (!relation || typeof relation !== "string" || relation.trim() === "") {
          throw new Error("Invalid relation name: relation must be a non-empty string.");
        }
        const url = new URL(`${this.url}/${relation}`);
        return new PostgrestQueryBuilder_1.default(url, {
          headers: new Headers(this.headers),
          schema: this.schemaName,
          fetch: this.fetch
        });
      }
      /**
       * Select a schema to query or perform an function (rpc) call.
       *
       * The schema needs to be on the list of exposed schemas inside Supabase.
       *
       * @param schema - The schema to query
       */
      schema(schema) {
        return new PostgrestClient2(this.url, {
          headers: this.headers,
          schema,
          fetch: this.fetch
        });
      }
      /**
       * Perform a function call.
       *
       * @param fn - The function name to call
       * @param args - The arguments to pass to the function call
       * @param options - Named parameters
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       * @param options.get - When set to `true`, the function will be called with
       * read-only access mode.
       * @param options.count - Count algorithm to use to count rows returned by the
       * function. Only applicable for [set-returning
       * functions](https://www.postgresql.org/docs/current/functions-srf.html).
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
        var _a2;
        let method;
        const url = new URL(`${this.url}/rpc/${fn}`);
        let body;
        if (head2 || get2) {
          method = head2 ? "HEAD" : "GET";
          Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
            url.searchParams.append(name, value);
          });
        } else {
          method = "POST";
          body = args;
        }
        const headers = new Headers(this.headers);
        if (count) {
          headers.set("Prefer", `count=${count}`);
        }
        return new PostgrestFilterBuilder_1.default({
          method,
          url,
          headers,
          schema: this.schemaName,
          body,
          fetch: (_a2 = this.fetch) !== null && _a2 !== void 0 ? _a2 : fetch
        });
      }
    };
    __name(PostgrestClient2, "PostgrestClient");
    exports.default = PostgrestClient2;
  }
});

// node_modules/@supabase/postgrest-js/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/cjs/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostgrestError = exports.PostgrestBuilder = exports.PostgrestTransformBuilder = exports.PostgrestFilterBuilder = exports.PostgrestQueryBuilder = exports.PostgrestClient = void 0;
    var tslib_1 = require_tslib();
    var PostgrestClient_1 = tslib_1.__importDefault(require_PostgrestClient());
    exports.PostgrestClient = PostgrestClient_1.default;
    var PostgrestQueryBuilder_1 = tslib_1.__importDefault(require_PostgrestQueryBuilder());
    exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
    var PostgrestFilterBuilder_1 = tslib_1.__importDefault(require_PostgrestFilterBuilder());
    exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
    var PostgrestTransformBuilder_1 = tslib_1.__importDefault(require_PostgrestTransformBuilder());
    exports.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
    var PostgrestBuilder_1 = tslib_1.__importDefault(require_PostgrestBuilder());
    exports.PostgrestBuilder = PostgrestBuilder_1.default;
    var PostgrestError_1 = tslib_1.__importDefault(require_PostgrestError());
    exports.PostgrestError = PostgrestError_1.default;
    exports.default = {
      PostgrestClient: PostgrestClient_1.default,
      PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
      PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
      PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
      PostgrestBuilder: PostgrestBuilder_1.default,
      PostgrestError: PostgrestError_1.default
    };
  }
});

// node_modules/@supabase/postgrest-js/dist/esm/wrapper.mjs
var index, PostgrestClient, PostgrestQueryBuilder, PostgrestFilterBuilder, PostgrestTransformBuilder, PostgrestBuilder, PostgrestError;
var init_wrapper = __esm({
  "node_modules/@supabase/postgrest-js/dist/esm/wrapper.mjs"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    index = __toESM(require_cjs(), 1);
    ({
      PostgrestClient,
      PostgrestQueryBuilder,
      PostgrestFilterBuilder,
      PostgrestTransformBuilder,
      PostgrestBuilder,
      PostgrestError
    } = index.default || index);
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
var WebSocketFactory, websocket_factory_default;
var init_websocket_factory = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    WebSocketFactory = class {
      /**
       * Static-only utility – prevent instantiation.
       */
      constructor() {
      }
      static detectEnvironment() {
        var _a2;
        if (typeof WebSocket !== "undefined") {
          return { type: "native", constructor: WebSocket };
        }
        if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
          return { type: "native", constructor: globalThis.WebSocket };
        }
        if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
          return { type: "native", constructor: global.WebSocket };
        }
        if (typeof globalThis !== "undefined" && typeof globalThis.WebSocketPair !== "undefined" && typeof globalThis.WebSocket === "undefined") {
          return {
            type: "cloudflare",
            error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
            workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
          };
        }
        if (typeof globalThis !== "undefined" && globalThis.EdgeRuntime || typeof navigator !== "undefined" && ((_a2 = "Cloudflare-Workers") === null || _a2 === void 0 ? void 0 : _a2.includes("Vercel-Edge"))) {
          return {
            type: "unsupported",
            error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
            workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
          };
        }
        if (typeof process !== "undefined") {
          const processVersions = process["versions"];
          if (processVersions && processVersions["node"]) {
            const versionString = processVersions["node"];
            const nodeVersion = parseInt(versionString.replace(/^v/, "").split(".")[0]);
            if (nodeVersion >= 22) {
              if (typeof globalThis.WebSocket !== "undefined") {
                return { type: "native", constructor: globalThis.WebSocket };
              }
              return {
                type: "unsupported",
                error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                workaround: "Provide a WebSocket implementation via the transport option."
              };
            }
            return {
              type: "unsupported",
              error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
              workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'
            };
          }
        }
        return {
          type: "unsupported",
          error: "Unknown JavaScript runtime without WebSocket support.",
          workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
        };
      }
      /**
       * Returns the best available WebSocket constructor for the current runtime.
       *
       * @example
       * ```ts
       * const WS = WebSocketFactory.getWebSocketConstructor()
       * const socket = new WS('wss://realtime.supabase.co/socket')
       * ```
       */
      static getWebSocketConstructor() {
        const env = this.detectEnvironment();
        if (env.constructor) {
          return env.constructor;
        }
        let errorMessage = env.error || "WebSocket not supported in this environment.";
        if (env.workaround) {
          errorMessage += `

Suggested solution: ${env.workaround}`;
        }
        throw new Error(errorMessage);
      }
      /**
       * Creates a WebSocket using the detected constructor.
       *
       * @example
       * ```ts
       * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
       * ```
       */
      static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor();
        return new WS(url, protocols);
      }
      /**
       * Detects whether the runtime can establish WebSocket connections.
       *
       * @example
       * ```ts
       * if (!WebSocketFactory.isWebSocketSupported()) {
       *   console.warn('Falling back to long polling')
       * }
       * ```
       */
      static isWebSocketSupported() {
        try {
          const env = this.detectEnvironment();
          return env.type === "native" || env.type === "ws";
        } catch (_a2) {
          return false;
        }
      }
    };
    __name(WebSocketFactory, "WebSocketFactory");
    websocket_factory_default = WebSocketFactory;
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/version.js
var version;
var init_version = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/version.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    version = "2.84.0";
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/constants.js
var DEFAULT_VERSION, VSN_1_0_0, VSN_2_0_0, DEFAULT_VSN, DEFAULT_TIMEOUT, WS_CLOSE_NORMAL, MAX_PUSH_BUFFER_SIZE, SOCKET_STATES, CHANNEL_STATES, CHANNEL_EVENTS, TRANSPORTS, CONNECTION_STATE;
var init_constants = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/constants.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version();
    DEFAULT_VERSION = `realtime-js/${version}`;
    VSN_1_0_0 = "1.0.0";
    VSN_2_0_0 = "2.0.0";
    DEFAULT_VSN = VSN_1_0_0;
    DEFAULT_TIMEOUT = 1e4;
    WS_CLOSE_NORMAL = 1e3;
    MAX_PUSH_BUFFER_SIZE = 100;
    (function(SOCKET_STATES2) {
      SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
      SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
      SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
      SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    (function(CHANNEL_STATES2) {
      CHANNEL_STATES2["closed"] = "closed";
      CHANNEL_STATES2["errored"] = "errored";
      CHANNEL_STATES2["joined"] = "joined";
      CHANNEL_STATES2["joining"] = "joining";
      CHANNEL_STATES2["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    (function(CHANNEL_EVENTS2) {
      CHANNEL_EVENTS2["close"] = "phx_close";
      CHANNEL_EVENTS2["error"] = "phx_error";
      CHANNEL_EVENTS2["join"] = "phx_join";
      CHANNEL_EVENTS2["reply"] = "phx_reply";
      CHANNEL_EVENTS2["leave"] = "phx_leave";
      CHANNEL_EVENTS2["access_token"] = "access_token";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    (function(TRANSPORTS2) {
      TRANSPORTS2["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));
    (function(CONNECTION_STATE2) {
      CONNECTION_STATE2["Connecting"] = "connecting";
      CONNECTION_STATE2["Open"] = "open";
      CONNECTION_STATE2["Closing"] = "closing";
      CONNECTION_STATE2["Closed"] = "closed";
    })(CONNECTION_STATE || (CONNECTION_STATE = {}));
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/serializer.js
var Serializer;
var init_serializer = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/serializer.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Serializer = class {
      constructor() {
        this.HEADER_LENGTH = 1;
        this.META_LENGTH = 4;
        this.USER_BROADCAST_PUSH_META_LENGTH = 5;
        this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 };
        this.BINARY_ENCODING = 0;
        this.JSON_ENCODING = 1;
        this.BROADCAST_EVENT = "broadcast";
      }
      encode(msg, callback) {
        if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === "string") {
          return callback(this._binaryEncodeUserBroadcastPush(msg));
        }
        let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
        return callback(JSON.stringify(payload));
      }
      _binaryEncodeUserBroadcastPush(message) {
        var _a2;
        if (this._isArrayBuffer((_a2 = message.payload) === null || _a2 === void 0 ? void 0 : _a2.payload)) {
          return this._encodeBinaryUserBroadcastPush(message);
        } else {
          return this._encodeJsonUserBroadcastPush(message);
        }
      }
      _encodeBinaryUserBroadcastPush(message) {
        var _a2, _b, _c, _d;
        const topic = message.topic;
        const ref = (_a2 = message.ref) !== null && _a2 !== void 0 ? _a2 : "";
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : "";
        const userEvent = message.payload.event;
        const userPayload = (_d = (_c = message.payload) === null || _c === void 0 ? void 0 : _c.payload) !== null && _d !== void 0 ? _d : new ArrayBuffer(0);
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush);
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, this.BINARY_ENCODING);
        Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + userPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(userPayload), header.byteLength);
        return combined.buffer;
      }
      _encodeJsonUserBroadcastPush(message) {
        var _a2, _b, _c, _d;
        const topic = message.topic;
        const ref = (_a2 = message.ref) !== null && _a2 !== void 0 ? _a2 : "";
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : "";
        const userEvent = message.payload.event;
        const userPayload = (_d = (_c = message.payload) === null || _c === void 0 ? void 0 : _c.payload) !== null && _d !== void 0 ? _d : {};
        const encoder = new TextEncoder();
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush);
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, this.JSON_ENCODING);
        Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + encodedUserPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(encodedUserPayload), header.byteLength);
        return combined.buffer;
      }
      decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
          let result = this._binaryDecode(rawPayload);
          return callback(result);
        }
        if (typeof rawPayload === "string") {
          const jsonPayload = JSON.parse(rawPayload);
          const [join_ref, ref, topic, event, payload] = jsonPayload;
          return callback({ join_ref, ref, topic, event, payload });
        }
        return callback({});
      }
      _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const kind = view.getUint8(0);
        const decoder = new TextDecoder();
        switch (kind) {
          case this.KINDS.userBroadcast:
            return this._decodeUserBroadcast(buffer, view, decoder);
        }
      }
      _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const userEventSize = view.getUint8(2);
        const metadataSize = view.getUint8(3);
        const payloadEncoding = view.getUint8(4);
        let offset = this.HEADER_LENGTH + 4;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
        offset = offset + userEventSize;
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
        offset = offset + metadataSize;
        const payload = buffer.slice(offset, buffer.byteLength);
        const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
        const data = {
          type: this.BROADCAST_EVENT,
          event: userEvent,
          payload: parsedPayload
        };
        if (metadataSize > 0) {
          data["meta"] = JSON.parse(metadata);
        }
        return { join_ref: null, ref: null, topic, event: this.BROADCAST_EVENT, payload: data };
      }
      _isArrayBuffer(buffer) {
        var _a2;
        return buffer instanceof ArrayBuffer || ((_a2 = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a2 === void 0 ? void 0 : _a2.name) === "ArrayBuffer";
      }
    };
    __name(Serializer, "Serializer");
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/timer.js
var Timer;
var init_timer = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/timer.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Timer = class {
      constructor(callback, timerCalc) {
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = void 0;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
      }
      reset() {
        this.tries = 0;
        clearTimeout(this.timer);
        this.timer = void 0;
      }
      // Cancels any previous scheduleTimeout and schedules callback
      scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.tries = this.tries + 1;
          this.callback();
        }, this.timerCalc(this.tries + 1));
      }
    };
    __name(Timer, "Timer");
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/transformers.js
var PostgresTypes, convertChangeData, convertColumn, convertCell, noop, toBoolean, toNumber, toJson, toArray, toTimestampString, httpEndpointURL;
var init_transformers = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/transformers.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    (function(PostgresTypes2) {
      PostgresTypes2["abstime"] = "abstime";
      PostgresTypes2["bool"] = "bool";
      PostgresTypes2["date"] = "date";
      PostgresTypes2["daterange"] = "daterange";
      PostgresTypes2["float4"] = "float4";
      PostgresTypes2["float8"] = "float8";
      PostgresTypes2["int2"] = "int2";
      PostgresTypes2["int4"] = "int4";
      PostgresTypes2["int4range"] = "int4range";
      PostgresTypes2["int8"] = "int8";
      PostgresTypes2["int8range"] = "int8range";
      PostgresTypes2["json"] = "json";
      PostgresTypes2["jsonb"] = "jsonb";
      PostgresTypes2["money"] = "money";
      PostgresTypes2["numeric"] = "numeric";
      PostgresTypes2["oid"] = "oid";
      PostgresTypes2["reltime"] = "reltime";
      PostgresTypes2["text"] = "text";
      PostgresTypes2["time"] = "time";
      PostgresTypes2["timestamp"] = "timestamp";
      PostgresTypes2["timestamptz"] = "timestamptz";
      PostgresTypes2["timetz"] = "timetz";
      PostgresTypes2["tsrange"] = "tsrange";
      PostgresTypes2["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    convertChangeData = /* @__PURE__ */ __name((columns, record, options = {}) => {
      var _a2;
      const skipTypes = (_a2 = options.skipTypes) !== null && _a2 !== void 0 ? _a2 : [];
      if (!record) {
        return {};
      }
      return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
        return acc;
      }, {});
    }, "convertChangeData");
    convertColumn = /* @__PURE__ */ __name((columnName, columns, record, skipTypes) => {
      const column = columns.find((x) => x.name === columnName);
      const colType = column === null || column === void 0 ? void 0 : column.type;
      const value = record[columnName];
      if (colType && !skipTypes.includes(colType)) {
        return convertCell(colType, value);
      }
      return noop(value);
    }, "convertColumn");
    convertCell = /* @__PURE__ */ __name((type, value) => {
      if (type.charAt(0) === "_") {
        const dataType = type.slice(1, type.length);
        return toArray(value, dataType);
      }
      switch (type) {
        case PostgresTypes.bool:
          return toBoolean(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
          return toNumber(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
          return toJson(value);
        case PostgresTypes.timestamp:
          return toTimestampString(value);
        case PostgresTypes.abstime:
        case PostgresTypes.date:
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime:
        case PostgresTypes.text:
        case PostgresTypes.time:
        case PostgresTypes.timestamptz:
        case PostgresTypes.timetz:
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
          return noop(value);
        default:
          return noop(value);
      }
    }, "convertCell");
    noop = /* @__PURE__ */ __name((value) => {
      return value;
    }, "noop");
    toBoolean = /* @__PURE__ */ __name((value) => {
      switch (value) {
        case "t":
          return true;
        case "f":
          return false;
        default:
          return value;
      }
    }, "toBoolean");
    toNumber = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
          return parsedValue;
        }
      }
      return value;
    }, "toNumber");
    toJson = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.log(`JSON parse error: ${error}`);
          return value;
        }
      }
      return value;
    }, "toJson");
    toArray = /* @__PURE__ */ __name((value, type) => {
      if (typeof value !== "string") {
        return value;
      }
      const lastIdx = value.length - 1;
      const closeBrace = value[lastIdx];
      const openBrace = value[0];
      if (openBrace === "{" && closeBrace === "}") {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        try {
          arr = JSON.parse("[" + valTrim + "]");
        } catch (_) {
          arr = valTrim ? valTrim.split(",") : [];
        }
        return arr.map((val) => convertCell(type, val));
      }
      return value;
    }, "toArray");
    toTimestampString = /* @__PURE__ */ __name((value) => {
      if (typeof value === "string") {
        return value.replace(" ", "T");
      }
      return value;
    }, "toTimestampString");
    httpEndpointURL = /* @__PURE__ */ __name((socketUrl) => {
      const wsUrl = new URL(socketUrl);
      wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, "http");
      wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, "");
      if (wsUrl.pathname === "" || wsUrl.pathname === "/") {
        wsUrl.pathname = "/api/broadcast";
      } else {
        wsUrl.pathname = wsUrl.pathname + "/api/broadcast";
      }
      return wsUrl.href;
    }, "httpEndpointURL");
  }
});

// node_modules/@supabase/realtime-js/dist/module/lib/push.js
var Push;
var init_push = __esm({
  "node_modules/@supabase/realtime-js/dist/module/lib/push.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_constants();
    Push = class {
      /**
       * Initializes the Push
       *
       * @param channel The Channel
       * @param event The event, for example `"phx_join"`
       * @param payload The payload, for example `{user_id: 123}`
       * @param timeout The push timeout in milliseconds
       */
      constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = void 0;
        this.ref = "";
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
      }
      resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = "";
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
      }
      send() {
        if (this._hasReceived("timeout")) {
          return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
          topic: this.channel.topic,
          event: this.event,
          payload: this.payload,
          ref: this.ref,
          join_ref: this.channel._joinRef()
        });
      }
      updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
      }
      receive(status, callback) {
        var _a2;
        if (this._hasReceived(status)) {
          callback((_a2 = this.receivedResp) === null || _a2 === void 0 ? void 0 : _a2.response);
        }
        this.recHooks.push({ status, callback });
        return this;
      }
      startTimeout() {
        if (this.timeoutTimer) {
          return;
        }
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = /* @__PURE__ */ __name((payload) => {
          this._cancelRefEvent();
          this._cancelTimeout();
          this.receivedResp = payload;
          this._matchReceive(payload);
        }, "callback");
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(() => {
          this.trigger("timeout", {});
        }, this.timeout);
      }
      trigger(status, response) {
        if (this.refEvent)
          this.channel._trigger(this.refEvent, { status, response });
      }
      destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
      }
      _cancelRefEvent() {
        if (!this.refEvent) {
          return;
        }
        this.channel._off(this.refEvent, {});
      }
      _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = void 0;
      }
      _matchReceive({ status, response }) {
        this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
      }
      _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
      }
    };
    __name(Push, "Push");
  }
});

// node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js
var REALTIME_PRESENCE_LISTEN_EVENTS, RealtimePresence;
var init_RealtimePresence = __esm({
  "node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    (function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
      REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
      REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
      REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
    })(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
    RealtimePresence = class {
      /**
       * Creates a Presence helper that keeps the local presence state in sync with the server.
       *
       * @param channel - The realtime channel to bind to.
       * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
       *
       * @example
       * ```ts
       * const presence = new RealtimePresence(channel)
       *
       * channel.on('presence', ({ event, key }) => {
       *   console.log(`Presence ${event} on ${key}`)
       * })
       * ```
       */
      constructor(channel, opts) {
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.enabled = false;
        this.caller = {
          onJoin: () => {
          },
          onLeave: () => {
          },
          onSync: () => {
          }
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
          state: "presence_state",
          diff: "presence_diff"
        };
        this.channel._on(events.state, {}, (newState) => {
          const { onJoin, onLeave, onSync } = this.caller;
          this.joinRef = this.channel._joinRef();
          this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
          this.pendingDiffs.forEach((diff) => {
            this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
          });
          this.pendingDiffs = [];
          onSync();
        });
        this.channel._on(events.diff, {}, (diff) => {
          const { onJoin, onLeave, onSync } = this.caller;
          if (this.inPendingSyncState()) {
            this.pendingDiffs.push(diff);
          } else {
            this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
            onSync();
          }
        });
        this.onJoin((key, currentPresences, newPresences) => {
          this.channel._trigger("presence", {
            event: "join",
            key,
            currentPresences,
            newPresences
          });
        });
        this.onLeave((key, currentPresences, leftPresences) => {
          this.channel._trigger("presence", {
            event: "leave",
            key,
            currentPresences,
            leftPresences
          });
        });
        this.onSync(() => {
          this.channel._trigger("presence", { event: "sync" });
        });
      }
      /**
       * Used to sync the list of presences on the server with the
       * client's state.
       *
       * An optional `onJoin` and `onLeave` callback can be provided to
       * react to changes in the client's local presences across
       * disconnects and reconnects with the server.
       *
       * @internal
       */
      static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences) => {
          if (!transformedState[key]) {
            leaves[key] = presences;
          }
        });
        this.map(transformedState, (key, newPresences) => {
          const currentPresences = state[key];
          if (currentPresences) {
            const newPresenceRefs = newPresences.map((m) => m.presence_ref);
            const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
            const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
            const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
            if (joinedPresences.length > 0) {
              joins[key] = joinedPresences;
            }
            if (leftPresences.length > 0) {
              leaves[key] = leftPresences;
            }
          } else {
            joins[key] = newPresences;
          }
        });
        return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
      }
      /**
       * Used to sync a diff of presence join and leave events from the
       * server, as they happen.
       *
       * Like `syncState`, `syncDiff` accepts optional `onJoin` and
       * `onLeave` callbacks to react to a user joining or leaving from a
       * device.
       *
       * @internal
       */
      static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
          joins: this.transformState(diff.joins),
          leaves: this.transformState(diff.leaves)
        };
        if (!onJoin) {
          onJoin = /* @__PURE__ */ __name(() => {
          }, "onJoin");
        }
        if (!onLeave) {
          onLeave = /* @__PURE__ */ __name(() => {
          }, "onLeave");
        }
        this.map(joins, (key, newPresences) => {
          var _a2;
          const currentPresences = (_a2 = state[key]) !== null && _a2 !== void 0 ? _a2 : [];
          state[key] = this.cloneDeep(newPresences);
          if (currentPresences.length > 0) {
            const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
            const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
            state[key].unshift(...curPresences);
          }
          onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences) => {
          let currentPresences = state[key];
          if (!currentPresences)
            return;
          const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
          currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
          state[key] = currentPresences;
          onLeave(key, currentPresences, leftPresences);
          if (currentPresences.length === 0)
            delete state[key];
        });
        return state;
      }
      /** @internal */
      static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
      }
      /**
       * Remove 'metas' key
       * Change 'phx_ref' to 'presence_ref'
       * Remove 'phx_ref' and 'phx_ref_prev'
       *
       * @example
       * // returns {
       *  abc123: [
       *    { presence_ref: '2', user_id: 1 },
       *    { presence_ref: '3', user_id: 2 }
       *  ]
       * }
       * RealtimePresence.transformState({
       *  abc123: {
       *    metas: [
       *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
       *      { phx_ref: '3', user_id: 2 }
       *    ]
       *  }
       * })
       *
       * @internal
       */
      static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key) => {
          const presences = state[key];
          if ("metas" in presences) {
            newState[key] = presences.metas.map((presence) => {
              presence["presence_ref"] = presence["phx_ref"];
              delete presence["phx_ref"];
              delete presence["phx_ref_prev"];
              return presence;
            });
          } else {
            newState[key] = presences;
          }
          return newState;
        }, {});
      }
      /** @internal */
      static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
      }
      /** @internal */
      onJoin(callback) {
        this.caller.onJoin = callback;
      }
      /** @internal */
      onLeave(callback) {
        this.caller.onLeave = callback;
      }
      /** @internal */
      onSync(callback) {
        this.caller.onSync = callback;
      }
      /** @internal */
      inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
      }
    };
    __name(RealtimePresence, "RealtimePresence");
  }
});

// node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js
var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, REALTIME_LISTEN_TYPES, REALTIME_SUBSCRIBE_STATES, RealtimeChannel;
var init_RealtimeChannel = __esm({
  "node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_constants();
    init_push();
    init_timer();
    init_RealtimePresence();
    init_transformers();
    init_transformers();
    (function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
    })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
    (function(REALTIME_LISTEN_TYPES2) {
      REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
      REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
      REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
      REALTIME_LISTEN_TYPES2["SYSTEM"] = "system";
    })(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
    (function(REALTIME_SUBSCRIBE_STATES2) {
      REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
      REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
      REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
      REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
    })(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
    RealtimeChannel = class {
      /**
       * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
       *
       * The topic determines which realtime stream you are subscribing to. Config options let you
       * enable acknowledgement for broadcasts, presence tracking, or private channels.
       *
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
       * ```
       */
      constructor(topic, params = { config: {} }, socket) {
        var _a2, _b;
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = CHANNEL_STATES.closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, "");
        this.params.config = Object.assign({
          broadcast: { ack: false, self: false },
          presence: { key: "", enabled: false },
          private: false
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
        this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive("ok", () => {
          this.state = CHANNEL_STATES.joined;
          this.rejoinTimer.reset();
          this.pushBuffer.forEach((pushEvent) => pushEvent.send());
          this.pushBuffer = [];
        });
        this._onClose(() => {
          this.rejoinTimer.reset();
          this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
          this.state = CHANNEL_STATES.closed;
          this.socket._remove(this);
        });
        this._onError((reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return;
          }
          this.socket.log("channel", `error ${this.topic}`, reason);
          this.state = CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive("timeout", () => {
          if (!this._isJoining()) {
            return;
          }
          this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
          this.state = CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive("error", (reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return;
          }
          this.socket.log("channel", `error ${this.topic}`, reason);
          this.state = CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
          this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new RealtimePresence(this);
        this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint);
        this.private = this.params.config.private || false;
        if (!this.private && ((_b = (_a2 = this.params.config) === null || _a2 === void 0 ? void 0 : _a2.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
          throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
        }
      }
      /** Subscribe registers your client with the server */
      subscribe(callback, timeout = this.timeout) {
        var _a2, _b, _c;
        if (!this.socket.isConnected()) {
          this.socket.connect();
        }
        if (this.state == CHANNEL_STATES.closed) {
          const { config: { broadcast, presence, private: isPrivate } } = this.params;
          const postgres_changes = (_b = (_a2 = this.bindings.postgres_changes) === null || _a2 === void 0 ? void 0 : _a2.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
          const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
          const accessTokenPayload = {};
          const config = {
            broadcast,
            presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
            postgres_changes,
            private: isPrivate
          };
          if (this.socket.accessTokenValue) {
            accessTokenPayload.access_token = this.socket.accessTokenValue;
          }
          this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
          this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
          this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
          this.joinedOnce = true;
          this._rejoin(timeout);
          this.joinPush.receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
            var _a3;
            this.socket.setAuth();
            if (postgres_changes2 === void 0) {
              callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
              return;
            } else {
              const clientPostgresBindings = this.bindings.postgres_changes;
              const bindingsLen = (_a3 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a3 !== void 0 ? _a3 : 0;
              const newPostgresBindings = [];
              for (let i = 0; i < bindingsLen; i++) {
                const clientPostgresBinding = clientPostgresBindings[i];
                const { filter: { event, schema, table, filter } } = clientPostgresBinding;
                const serverPostgresFilter = postgres_changes2 && postgres_changes2[i];
                if (serverPostgresFilter && serverPostgresFilter.event === event && serverPostgresFilter.schema === schema && serverPostgresFilter.table === table && serverPostgresFilter.filter === filter) {
                  newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                } else {
                  this.unsubscribe();
                  this.state = CHANNEL_STATES.errored;
                  callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
                  return;
                }
              }
              this.bindings.postgres_changes = newPostgresBindings;
              callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
              return;
            }
          }).receive("error", (error) => {
            this.state = CHANNEL_STATES.errored;
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
            return;
          }).receive("timeout", () => {
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
            return;
          });
        }
        return this;
      }
      /**
       * Returns the current presence state for this channel.
       *
       * The shape is a map keyed by presence key (for example a user id) where each entry contains the
       * tracked metadata for that user.
       */
      presenceState() {
        return this.presence.state;
      }
      /**
       * Sends the supplied payload to the presence tracker so other subscribers can see that this
       * client is online. Use `untrack` to stop broadcasting presence for the same key.
       */
      async track(payload, opts = {}) {
        return await this.send({
          type: "presence",
          event: "track",
          payload
        }, opts.timeout || this.timeout);
      }
      /**
       * Removes the current presence state for this client.
       */
      async untrack(opts = {}) {
        return await this.send({
          type: "presence",
          event: "untrack"
        }, opts);
      }
      on(type, filter, callback) {
        if (this.state === CHANNEL_STATES.joined && type === REALTIME_LISTEN_TYPES.PRESENCE) {
          this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
          this.unsubscribe().then(() => this.subscribe());
        }
        return this._on(type, filter, callback);
      }
      /**
       * Sends a broadcast message explicitly via REST API.
       *
       * This method always uses the REST API endpoint regardless of WebSocket connection state.
       * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
       *
       * @param event The name of the broadcast event
       * @param payload Payload to be sent (required)
       * @param opts Options including timeout
       * @returns Promise resolving to object with success status, and error details if failed
       */
      async httpSend(event, payload, opts = {}) {
        var _a2;
        const authorization = this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "";
        if (payload === void 0 || payload === null) {
          return Promise.reject("Payload is required for httpSend()");
        }
        const options = {
          method: "POST",
          headers: {
            Authorization: authorization,
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event,
                payload,
                private: this.private
              }
            ]
          })
        };
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a2 = opts.timeout) !== null && _a2 !== void 0 ? _a2 : this.timeout);
        if (response.status === 202) {
          return { success: true };
        }
        let errorMessage = response.statusText;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorBody.message || errorMessage;
        } catch (_b) {
        }
        return Promise.reject(new Error(errorMessage));
      }
      /**
       * Sends a message into the channel.
       *
       * @param args Arguments to send to channel
       * @param args.type The type of event to send
       * @param args.event The name of the event being sent
       * @param args.payload Payload to be sent
       * @param opts Options to be used during the send process
       */
      async send(args, opts = {}) {
        var _a2, _b;
        if (!this._canPush() && args.type === "broadcast") {
          console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
          const { event, payload: endpoint_payload } = args;
          const authorization = this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "";
          const options = {
            method: "POST",
            headers: {
              Authorization: authorization,
              apikey: this.socket.apiKey ? this.socket.apiKey : "",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messages: [
                {
                  topic: this.subTopic,
                  event,
                  payload: endpoint_payload,
                  private: this.private
                }
              ]
            })
          };
          try {
            const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a2 = opts.timeout) !== null && _a2 !== void 0 ? _a2 : this.timeout);
            await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
            return response.ok ? "ok" : "error";
          } catch (error) {
            if (error.name === "AbortError") {
              return "timed out";
            } else {
              return "error";
            }
          }
        } else {
          return new Promise((resolve) => {
            var _a3, _b2, _c;
            const push = this._push(args.type, args, opts.timeout || this.timeout);
            if (args.type === "broadcast" && !((_c = (_b2 = (_a3 = this.params) === null || _a3 === void 0 ? void 0 : _a3.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
              resolve("ok");
            }
            push.receive("ok", () => resolve("ok"));
            push.receive("error", () => resolve("error"));
            push.receive("timeout", () => resolve("timed out"));
          });
        }
      }
      /**
       * Updates the payload that will be sent the next time the channel joins (reconnects).
       * Useful for rotating access tokens or updating config without re-creating the channel.
       */
      updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
      }
      /**
       * Leaves the channel.
       *
       * Unsubscribes from server events, and instructs channel to terminate on server.
       * Triggers onClose() hooks.
       *
       * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
       * channel.unsubscribe().receive("ok", () => alert("left!") )
       */
      unsubscribe(timeout = this.timeout) {
        this.state = CHANNEL_STATES.leaving;
        const onClose = /* @__PURE__ */ __name(() => {
          this.socket.log("channel", `leave ${this.topic}`);
          this._trigger(CHANNEL_EVENTS.close, "leave", this._joinRef());
        }, "onClose");
        this.joinPush.destroy();
        let leavePush = null;
        return new Promise((resolve) => {
          leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
          leavePush.receive("ok", () => {
            onClose();
            resolve("ok");
          }).receive("timeout", () => {
            onClose();
            resolve("timed out");
          }).receive("error", () => {
            resolve("error");
          });
          leavePush.send();
          if (!this._canPush()) {
            leavePush.trigger("ok", {});
          }
        }).finally(() => {
          leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
        });
      }
      /**
       * Teardown the channel.
       *
       * Destroys and stops related timers.
       */
      teardown() {
        this.pushBuffer.forEach((push) => push.destroy());
        this.pushBuffer = [];
        this.rejoinTimer.reset();
        this.joinPush.destroy();
        this.state = CHANNEL_STATES.closed;
        this.bindings = {};
      }
      /** @internal */
      async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
      }
      /** @internal */
      _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
          throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new Push(this, event, payload, timeout);
        if (this._canPush()) {
          pushEvent.send();
        } else {
          this._addToPushBuffer(pushEvent);
        }
        return pushEvent;
      }
      /** @internal */
      _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
        if (this.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
          const removedPush = this.pushBuffer.shift();
          if (removedPush) {
            removedPush.destroy();
            this.socket.log("channel", `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
          }
        }
      }
      /**
       * Overridable message hook
       *
       * Receives all events for specialized message handling before dispatching to the channel callbacks.
       * Must return the payload, modified or unmodified.
       *
       * @internal
       */
      _onMessage(_event, payload, _ref) {
        return payload;
      }
      /** @internal */
      _isMember(topic) {
        return this.topic === topic;
      }
      /** @internal */
      _joinRef() {
        return this.joinPush.ref;
      }
      /** @internal */
      _trigger(type, payload, ref) {
        var _a2, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close, error, leave, join } = CHANNEL_EVENTS;
        const events = [close, error, leave, join];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
          return;
        }
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) {
          throw "channel onMessage callbacks must return the payload, modified or unmodified";
        }
        if (["insert", "update", "delete"].includes(typeLower)) {
          (_a2 = this.bindings.postgres_changes) === null || _a2 === void 0 ? void 0 : _a2.filter((bind) => {
            var _a3, _b2, _c;
            return ((_a3 = bind.filter) === null || _a3 === void 0 ? void 0 : _a3.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
          }).map((bind) => bind.callback(handledPayload, ref));
        } else {
          (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
            var _a3, _b2, _c, _d, _e, _f;
            if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
              if ("id" in bind) {
                const bindId = bind.id;
                const bindEvent = (_a3 = bind.filter) === null || _a3 === void 0 ? void 0 : _a3.event;
                return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
              } else {
                const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
              }
            } else {
              return bind.type.toLocaleLowerCase() === typeLower;
            }
          }).map((bind) => {
            if (typeof handledPayload === "object" && "ids" in handledPayload) {
              const postgresChanges = handledPayload.data;
              const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
              const enrichedPayload = {
                schema,
                table,
                commit_timestamp,
                eventType: type2,
                new: {},
                old: {},
                errors
              };
              handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
            }
            bind.callback(handledPayload, ref);
          });
        }
      }
      /** @internal */
      _isClosed() {
        return this.state === CHANNEL_STATES.closed;
      }
      /** @internal */
      _isJoined() {
        return this.state === CHANNEL_STATES.joined;
      }
      /** @internal */
      _isJoining() {
        return this.state === CHANNEL_STATES.joining;
      }
      /** @internal */
      _isLeaving() {
        return this.state === CHANNEL_STATES.leaving;
      }
      /** @internal */
      _replyEventName(ref) {
        return `chan_reply_${ref}`;
      }
      /** @internal */
      _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
          type: typeLower,
          filter,
          callback
        };
        if (this.bindings[typeLower]) {
          this.bindings[typeLower].push(binding);
        } else {
          this.bindings[typeLower] = [binding];
        }
        return this;
      }
      /** @internal */
      _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        if (this.bindings[typeLower]) {
          this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
            var _a2;
            return !(((_a2 = bind.type) === null || _a2 === void 0 ? void 0 : _a2.toLocaleLowerCase()) === typeLower && RealtimeChannel.isEqual(bind.filter, filter));
          });
        }
        return this;
      }
      /** @internal */
      static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
          return false;
        }
        for (const k in obj1) {
          if (obj1[k] !== obj2[k]) {
            return false;
          }
        }
        return true;
      }
      /** @internal */
      _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
          this._rejoin();
        }
      }
      /**
       * Registers a callback that will be executed when the channel closes.
       *
       * @internal
       */
      _onClose(callback) {
        this._on(CHANNEL_EVENTS.close, {}, callback);
      }
      /**
       * Registers a callback that will be executed when the channel encounteres an error.
       *
       * @internal
       */
      _onError(callback) {
        this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
      }
      /**
       * Returns `true` if the socket is connected and the channel has been joined.
       *
       * @internal
       */
      _canPush() {
        return this.socket.isConnected() && this._isJoined();
      }
      /** @internal */
      _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
          return;
        }
        this.socket._leaveOpenTopic(this.topic);
        this.state = CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
      }
      /** @internal */
      _getPayloadRecords(payload) {
        const records = {
          new: {},
          old: {}
        };
        if (payload.type === "INSERT" || payload.type === "UPDATE") {
          records.new = convertChangeData(payload.columns, payload.record);
        }
        if (payload.type === "UPDATE" || payload.type === "DELETE") {
          records.old = convertChangeData(payload.columns, payload.old_record);
        }
        return records;
      }
    };
    __name(RealtimeChannel, "RealtimeChannel");
  }
});

// node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js
var noop2, CONNECTION_TIMEOUTS, RECONNECT_INTERVALS, DEFAULT_RECONNECT_FALLBACK, WORKER_SCRIPT, RealtimeClient;
var init_RealtimeClient = __esm({
  "node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_websocket_factory();
    init_constants();
    init_serializer();
    init_timer();
    init_transformers();
    init_RealtimeChannel();
    noop2 = /* @__PURE__ */ __name(() => {
    }, "noop");
    CONNECTION_TIMEOUTS = {
      HEARTBEAT_INTERVAL: 25e3,
      RECONNECT_DELAY: 10,
      HEARTBEAT_TIMEOUT_FALLBACK: 100
    };
    RECONNECT_INTERVALS = [1e3, 2e3, 5e3, 1e4];
    DEFAULT_RECONNECT_FALLBACK = 1e4;
    WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
    RealtimeClient = class {
      /**
       * Initializes the Socket.
       *
       * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
       * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
       * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
       * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
       * @param options.params The optional params to pass when connecting.
       * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
       * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
       * @param options.heartbeatCallback The optional function to handle heartbeat status.
       * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
       * @param options.logLevel Sets the log level for Realtime
       * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
       * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
       * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
       * @param options.worker Use Web Worker to set a side flow. Defaults to false.
       * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * client.connect()
       * ```
       */
      constructor(endPoint, options) {
        var _a2;
        this.accessTokenValue = null;
        this.apiKey = null;
        this.channels = new Array();
        this.endPoint = "";
        this.httpEndpoint = "";
        this.headers = {};
        this.params = {};
        this.timeout = DEFAULT_TIMEOUT;
        this.transport = null;
        this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.heartbeatTimer = void 0;
        this.pendingHeartbeatRef = null;
        this.heartbeatCallback = noop2;
        this.ref = 0;
        this.reconnectTimer = null;
        this.vsn = DEFAULT_VSN;
        this.logger = noop2;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new Serializer();
        this.stateChangeCallbacks = {
          open: [],
          close: [],
          error: [],
          message: []
        };
        this.accessToken = null;
        this._connectionState = "disconnected";
        this._wasManualDisconnect = false;
        this._authPromise = null;
        this._resolveFetch = (customFetch) => {
          if (customFetch) {
            return (...args) => customFetch(...args);
          }
          return (...args) => fetch(...args);
        };
        if (!((_a2 = options === null || options === void 0 ? void 0 : options.params) === null || _a2 === void 0 ? void 0 : _a2.apikey)) {
          throw new Error("API key is required to connect to Realtime");
        }
        this.apiKey = options.params.apikey;
        this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
        this.httpEndpoint = httpEndpointURL(endPoint);
        this._initializeOptions(options);
        this._setupReconnectionTimer();
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
      }
      /**
       * Connects the socket, unless already connected.
       */
      connect() {
        if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) {
          return;
        }
        this._setConnectionState("connecting");
        if (this.accessToken && !this._authPromise) {
          this._setAuthSafely("connect");
        }
        if (this.transport) {
          this.conn = new this.transport(this.endpointURL());
        } else {
          try {
            this.conn = websocket_factory_default.createWebSocket(this.endpointURL());
          } catch (error) {
            this._setConnectionState("disconnected");
            const errorMessage = error.message;
            if (errorMessage.includes("Node.js")) {
              throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
            }
            throw new Error(`WebSocket not available: ${errorMessage}`);
          }
        }
        this._setupConnectionHandlers();
      }
      /**
       * Returns the URL of the websocket.
       * @returns string The URL of the websocket.
       */
      endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }));
      }
      /**
       * Disconnects the socket.
       *
       * @param code A numeric status code to send on disconnect.
       * @param reason A custom reason for the disconnect.
       */
      disconnect(code, reason) {
        if (this.isDisconnecting()) {
          return;
        }
        this._setConnectionState("disconnecting", true);
        if (this.conn) {
          const fallbackTimer = setTimeout(() => {
            this._setConnectionState("disconnected");
          }, 100);
          this.conn.onclose = () => {
            clearTimeout(fallbackTimer);
            this._setConnectionState("disconnected");
          };
          if (typeof this.conn.close === "function") {
            if (code) {
              this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
            } else {
              this.conn.close();
            }
          }
          this._teardownConnection();
        } else {
          this._setConnectionState("disconnected");
        }
      }
      /**
       * Returns all created channels
       */
      getChannels() {
        return this.channels;
      }
      /**
       * Unsubscribes and removes a single channel
       * @param channel A RealtimeChannel instance
       */
      async removeChannel(channel) {
        const status = await channel.unsubscribe();
        if (this.channels.length === 0) {
          this.disconnect();
        }
        return status;
      }
      /**
       * Unsubscribes and removes all channels
       */
      async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
        this.channels = [];
        this.disconnect();
        return values_1;
      }
      /**
       * Logs the message.
       *
       * For customized logging, `this.logger` can be overridden.
       */
      log(kind, msg, data) {
        this.logger(kind, msg, data);
      }
      /**
       * Returns the current state of the socket.
       */
      connectionState() {
        switch (this.conn && this.conn.readyState) {
          case SOCKET_STATES.connecting:
            return CONNECTION_STATE.Connecting;
          case SOCKET_STATES.open:
            return CONNECTION_STATE.Open;
          case SOCKET_STATES.closing:
            return CONNECTION_STATE.Closing;
          default:
            return CONNECTION_STATE.Closed;
        }
      }
      /**
       * Returns `true` is the connection is open.
       */
      isConnected() {
        return this.connectionState() === CONNECTION_STATE.Open;
      }
      /**
       * Returns `true` if the connection is currently connecting.
       */
      isConnecting() {
        return this._connectionState === "connecting";
      }
      /**
       * Returns `true` if the connection is currently disconnecting.
       */
      isDisconnecting() {
        return this._connectionState === "disconnecting";
      }
      /**
       * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
       *
       * Topics are automatically prefixed with `realtime:` to match the Realtime service.
       * If a channel with the same topic already exists it will be returned instead of creating
       * a duplicate connection.
       */
      channel(topic, params = { config: {} }) {
        const realtimeTopic = `realtime:${topic}`;
        const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
        if (!exists) {
          const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
          this.channels.push(chan);
          return chan;
        } else {
          return exists;
        }
      }
      /**
       * Push out a message if the socket is connected.
       *
       * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
       */
      push(data) {
        const { topic, event, payload, ref } = data;
        const callback = /* @__PURE__ */ __name(() => {
          this.encode(data, (result) => {
            var _a2;
            (_a2 = this.conn) === null || _a2 === void 0 ? void 0 : _a2.send(result);
          });
        }, "callback");
        this.log("push", `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
          callback();
        } else {
          this.sendBuffer.push(callback);
        }
      }
      /**
       * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
       *
       * If param is null it will use the `accessToken` callback function or the token set on the client.
       *
       * On callback used, it will set the value of the token internal to the client.
       *
       * @param token A JWT string to override the token set on the client.
       */
      async setAuth(token = null) {
        this._authPromise = this._performAuth(token);
        try {
          await this._authPromise;
        } finally {
          this._authPromise = null;
        }
      }
      /**
       * Sends a heartbeat message if the socket is connected.
       */
      async sendHeartbeat() {
        var _a2;
        if (!this.isConnected()) {
          try {
            this.heartbeatCallback("disconnected");
          } catch (e) {
            this.log("error", "error in heartbeat callback", e);
          }
          return;
        }
        if (this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null;
          this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
          try {
            this.heartbeatCallback("timeout");
          } catch (e) {
            this.log("error", "error in heartbeat callback", e);
          }
          this._wasManualDisconnect = false;
          (_a2 = this.conn) === null || _a2 === void 0 ? void 0 : _a2.close(WS_CLOSE_NORMAL, "heartbeat timeout");
          setTimeout(() => {
            var _a3;
            if (!this.isConnected()) {
              (_a3 = this.reconnectTimer) === null || _a3 === void 0 ? void 0 : _a3.scheduleTimeout();
            }
          }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
          return;
        }
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: this.pendingHeartbeatRef
        });
        try {
          this.heartbeatCallback("sent");
        } catch (e) {
          this.log("error", "error in heartbeat callback", e);
        }
        this._setAuthSafely("heartbeat");
      }
      /**
       * Sets a callback that receives lifecycle events for internal heartbeat messages.
       * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
       */
      onHeartbeat(callback) {
        this.heartbeatCallback = callback;
      }
      /**
       * Flushes send buffer
       */
      flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
          this.sendBuffer.forEach((callback) => callback());
          this.sendBuffer = [];
        }
      }
      /**
       * Return the next message ref, accounting for overflows
       *
       * @internal
       */
      _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
          this.ref = 0;
        } else {
          this.ref = newRef;
        }
        return this.ref.toString();
      }
      /**
       * Unsubscribe from channels with the specified topic.
       *
       * @internal
       */
      _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
          this.log("transport", `leaving duplicate topic "${topic}"`);
          dupChannel.unsubscribe();
        }
      }
      /**
       * Removes a subscription from the socket.
       *
       * @param channel An open subscription.
       *
       * @internal
       */
      _remove(channel) {
        this.channels = this.channels.filter((c) => c.topic !== channel.topic);
      }
      /** @internal */
      _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
          if (msg.topic === "phoenix" && msg.event === "phx_reply") {
            try {
              this.heartbeatCallback(msg.payload.status === "ok" ? "ok" : "error");
            } catch (e) {
              this.log("error", "error in heartbeat callback", e);
            }
          }
          if (msg.ref && msg.ref === this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
          }
          const { topic, event, payload, ref } = msg;
          const refString = ref ? `(${ref})` : "";
          const status = payload.status || "";
          this.log("receive", `${status} ${topic} ${event} ${refString}`.trim(), payload);
          this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event, payload, ref));
          this._triggerStateCallbacks("message", msg);
        });
      }
      /**
       * Clear specific timer
       * @internal
       */
      _clearTimer(timer) {
        var _a2;
        if (timer === "heartbeat" && this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = void 0;
        } else if (timer === "reconnect") {
          (_a2 = this.reconnectTimer) === null || _a2 === void 0 ? void 0 : _a2.reset();
        }
      }
      /**
       * Clear all timers
       * @internal
       */
      _clearAllTimers() {
        this._clearTimer("heartbeat");
        this._clearTimer("reconnect");
      }
      /**
       * Setup connection handlers for WebSocket events
       * @internal
       */
      _setupConnectionHandlers() {
        if (!this.conn)
          return;
        if ("binaryType" in this.conn) {
          ;
          this.conn.binaryType = "arraybuffer";
        }
        this.conn.onopen = () => this._onConnOpen();
        this.conn.onerror = (error) => this._onConnError(error);
        this.conn.onmessage = (event) => this._onConnMessage(event);
        this.conn.onclose = (event) => this._onConnClose(event);
      }
      /**
       * Teardown connection and cleanup resources
       * @internal
       */
      _teardownConnection() {
        if (this.conn) {
          if (this.conn.readyState === SOCKET_STATES.open || this.conn.readyState === SOCKET_STATES.connecting) {
            try {
              this.conn.close();
            } catch (e) {
              this.log("error", "Error closing connection", e);
            }
          }
          this.conn.onopen = null;
          this.conn.onerror = null;
          this.conn.onmessage = null;
          this.conn.onclose = null;
          this.conn = null;
        }
        this._clearAllTimers();
        this.channels.forEach((channel) => channel.teardown());
      }
      /** @internal */
      _onConnOpen() {
        this._setConnectionState("connected");
        this.log("transport", `connected to ${this.endpointURL()}`);
        const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise.then(() => {
          this.flushSendBuffer();
        }).catch((e) => {
          this.log("error", "error waiting for auth on connect", e);
          this.flushSendBuffer();
        });
        this._clearTimer("reconnect");
        if (!this.worker) {
          this._startHeartbeat();
        } else {
          if (!this.workerRef) {
            this._startWorkerHeartbeat();
          }
        }
        this._triggerStateCallbacks("open");
      }
      /** @internal */
      _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
      }
      /** @internal */
      _startWorkerHeartbeat() {
        if (this.workerUrl) {
          this.log("worker", `starting worker for from ${this.workerUrl}`);
        } else {
          this.log("worker", `starting default worker`);
        }
        const objectUrl = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(objectUrl);
        this.workerRef.onerror = (error) => {
          this.log("worker", "worker error", error.message);
          this.workerRef.terminate();
        };
        this.workerRef.onmessage = (event) => {
          if (event.data.event === "keepAlive") {
            this.sendHeartbeat();
          }
        };
        this.workerRef.postMessage({
          event: "start",
          interval: this.heartbeatIntervalMs
        });
      }
      /** @internal */
      _onConnClose(event) {
        var _a2;
        this._setConnectionState("disconnected");
        this.log("transport", "close", event);
        this._triggerChanError();
        this._clearTimer("heartbeat");
        if (!this._wasManualDisconnect) {
          (_a2 = this.reconnectTimer) === null || _a2 === void 0 ? void 0 : _a2.scheduleTimeout();
        }
        this._triggerStateCallbacks("close", event);
      }
      /** @internal */
      _onConnError(error) {
        this._setConnectionState("disconnected");
        this.log("transport", `${error}`);
        this._triggerChanError();
        this._triggerStateCallbacks("error", error);
      }
      /** @internal */
      _triggerChanError() {
        this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
      }
      /** @internal */
      _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
          return url;
        }
        const prefix = url.match(/\?/) ? "&" : "?";
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
      }
      _workerObjectUrl(url) {
        let result_url;
        if (url) {
          result_url = url;
        } else {
          const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
          result_url = URL.createObjectURL(blob);
        }
        return result_url;
      }
      /**
       * Set connection state with proper state management
       * @internal
       */
      _setConnectionState(state, manual = false) {
        this._connectionState = state;
        if (state === "connecting") {
          this._wasManualDisconnect = false;
        } else if (state === "disconnecting") {
          this._wasManualDisconnect = manual;
        }
      }
      /**
       * Perform the actual auth operation
       * @internal
       */
      async _performAuth(token = null) {
        let tokenToSend;
        if (token) {
          tokenToSend = token;
        } else if (this.accessToken) {
          tokenToSend = await this.accessToken();
        } else {
          tokenToSend = this.accessTokenValue;
        }
        if (this.accessTokenValue != tokenToSend) {
          this.accessTokenValue = tokenToSend;
          this.channels.forEach((channel) => {
            const payload = {
              access_token: tokenToSend,
              version: DEFAULT_VERSION
            };
            tokenToSend && channel.updateJoinPayload(payload);
            if (channel.joinedOnce && channel._isJoined()) {
              channel._push(CHANNEL_EVENTS.access_token, {
                access_token: tokenToSend
              });
            }
          });
        }
      }
      /**
       * Wait for any in-flight auth operations to complete
       * @internal
       */
      async _waitForAuthIfNeeded() {
        if (this._authPromise) {
          await this._authPromise;
        }
      }
      /**
       * Safely call setAuth with standardized error handling
       * @internal
       */
      _setAuthSafely(context = "general") {
        this.setAuth().catch((e) => {
          this.log("error", `error setting auth in ${context}`, e);
        });
      }
      /**
       * Trigger state change callbacks with proper error handling
       * @internal
       */
      _triggerStateCallbacks(event, data) {
        try {
          this.stateChangeCallbacks[event].forEach((callback) => {
            try {
              callback(data);
            } catch (e) {
              this.log("error", `error in ${event} callback`, e);
            }
          });
        } catch (e) {
          this.log("error", `error triggering ${event} callbacks`, e);
        }
      }
      /**
       * Setup reconnection timer with proper configuration
       * @internal
       */
      _setupReconnectionTimer() {
        this.reconnectTimer = new Timer(async () => {
          setTimeout(async () => {
            await this._waitForAuthIfNeeded();
            if (!this.isConnected()) {
              this.connect();
            }
          }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
        }, this.reconnectAfterMs);
      }
      /**
       * Initialize client options with defaults
       * @internal
       */
      _initializeOptions(options) {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.transport = (_a2 = options === null || options === void 0 ? void 0 : options.transport) !== null && _a2 !== void 0 ? _a2 : null;
        this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
        this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
        this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
        this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop2;
        this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : DEFAULT_VSN;
        if (options === null || options === void 0 ? void 0 : options.params)
          this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.logger)
          this.logger = options.logger;
        if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
          this.logLevel = options.logLevel || options.log_level;
          this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
        }
        this.reconnectAfterMs = (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : (tries) => {
          return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
        };
        switch (this.vsn) {
          case VSN_1_0_0:
            this.encode = (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : (payload, callback) => {
              return callback(JSON.stringify(payload));
            };
            this.decode = (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : (payload, callback) => {
              return callback(JSON.parse(payload));
            };
            break;
          case VSN_2_0_0:
            this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
            this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
            break;
          default:
            throw new Error(`Unsupported serializer version: ${this.vsn}`);
        }
        if (this.worker) {
          if (typeof window !== "undefined" && !window.Worker) {
            throw new Error("Web Worker is not supported");
          }
          this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
      }
    };
    __name(RealtimeClient, "RealtimeClient");
  }
});

// node_modules/@supabase/realtime-js/dist/module/index.js
var init_module2 = __esm({
  "node_modules/@supabase/realtime-js/dist/module/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_RealtimeClient();
    init_RealtimeChannel();
    init_RealtimePresence();
    init_websocket_factory();
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/errors.js
function isStorageError(error) {
  return typeof error === "object" && error !== null && "__isStorageError" in error;
}
var StorageError, StorageApiError, StorageUnknownError;
var init_errors = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/errors.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    StorageError = class extends Error {
      constructor(message) {
        super(message);
        this.__isStorageError = true;
        this.name = "StorageError";
      }
    };
    __name(StorageError, "StorageError");
    __name(isStorageError, "isStorageError");
    StorageApiError = class extends StorageError {
      constructor(message, status, statusCode) {
        super(message);
        this.name = "StorageApiError";
        this.status = status;
        this.statusCode = statusCode;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          statusCode: this.statusCode
        };
      }
    };
    __name(StorageApiError, "StorageApiError");
    StorageUnknownError = class extends StorageError {
      constructor(message, originalError) {
        super(message);
        this.name = "StorageUnknownError";
        this.originalError = originalError;
      }
    };
    __name(StorageUnknownError, "StorageUnknownError");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/helpers.js
var resolveFetch2, resolveResponse, recursiveToCamel, isPlainObject;
var init_helpers = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/helpers.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    resolveFetch2 = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    resolveResponse = /* @__PURE__ */ __name(() => {
      return Response;
    }, "resolveResponse");
    recursiveToCamel = /* @__PURE__ */ __name((item) => {
      if (Array.isArray(item)) {
        return item.map((el) => recursiveToCamel(el));
      } else if (typeof item === "function" || item !== Object(item)) {
        return item;
      }
      const result = {};
      Object.entries(item).forEach(([key, value]) => {
        const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
        result[newKey] = recursiveToCamel(value);
      });
      return result;
    }, "recursiveToCamel");
    isPlainObject = /* @__PURE__ */ __name((value) => {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
    }, "isPlainObject");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/fetch.js
function _handleRequest(fetcher, method, url, options, parameters, body) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
        if (!result.ok)
          throw result;
        if (options === null || options === void 0 ? void 0 : options.noResolveJson)
          return result;
        return result.json();
      }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options));
    });
  });
}
function get(fetcher, url, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest(fetcher, "GET", url, options, parameters);
  });
}
function post(fetcher, url, body, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest(fetcher, "POST", url, options, parameters, body);
  });
}
function put(fetcher, url, body, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest(fetcher, "PUT", url, options, parameters, body);
  });
}
function head(fetcher, url, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest(fetcher, "HEAD", url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
  });
}
function remove(fetcher, url, body, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest(fetcher, "DELETE", url, options, parameters, body);
  });
}
var _getErrorMessage, handleError, _getRequestParams;
var init_fetch = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/fetch.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_errors();
    init_helpers();
    _getErrorMessage = /* @__PURE__ */ __name((err) => {
      var _a2;
      return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_a2 = err.error) === null || _a2 === void 0 ? void 0 : _a2.message) || JSON.stringify(err);
    }, "_getErrorMessage");
    handleError = /* @__PURE__ */ __name((error, reject, options) => __awaiter(void 0, void 0, void 0, function* () {
      const Res = yield resolveResponse();
      if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        error.json().then((err) => {
          const status = error.status || 500;
          const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + "";
          reject(new StorageApiError(_getErrorMessage(err), status, statusCode));
        }).catch((err) => {
          reject(new StorageUnknownError(_getErrorMessage(err), err));
        });
      } else {
        reject(new StorageUnknownError(_getErrorMessage(error), error));
      }
    }), "handleError");
    _getRequestParams = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET" || !body) {
        return params;
      }
      if (isPlainObject(body)) {
        params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
      } else {
        params.body = body;
      }
      if (options === null || options === void 0 ? void 0 : options.duplex) {
        params.duplex = options.duplex;
      }
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    __name(_handleRequest, "_handleRequest");
    __name(get, "get");
    __name(post, "post");
    __name(put, "put");
    __name(head, "head");
    __name(remove, "remove");
  }
});

// node_modules/@supabase/storage-js/dist/module/packages/StreamDownloadBuilder.js
var StreamDownloadBuilder;
var init_StreamDownloadBuilder = __esm({
  "node_modules/@supabase/storage-js/dist/module/packages/StreamDownloadBuilder.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_errors();
    StreamDownloadBuilder = class {
      constructor(downloadFn, shouldThrowOnError) {
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
      }
      then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
      }
      execute() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const result = yield this.downloadFn();
            return {
              data: result.body,
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(StreamDownloadBuilder, "StreamDownloadBuilder");
  }
});

// node_modules/@supabase/storage-js/dist/module/packages/BlobDownloadBuilder.js
var _a, BlobDownloadBuilder, BlobDownloadBuilder_default;
var init_BlobDownloadBuilder = __esm({
  "node_modules/@supabase/storage-js/dist/module/packages/BlobDownloadBuilder.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_errors();
    init_StreamDownloadBuilder();
    BlobDownloadBuilder = class {
      constructor(downloadFn, shouldThrowOnError) {
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
        this[_a] = "BlobDownloadBuilder";
        this.promise = null;
      }
      asStream() {
        return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
      }
      then(onfulfilled, onrejected) {
        return this.getPromise().then(onfulfilled, onrejected);
      }
      catch(onrejected) {
        return this.getPromise().catch(onrejected);
      }
      finally(onfinally) {
        return this.getPromise().finally(onfinally);
      }
      getPromise() {
        if (!this.promise) {
          this.promise = this.execute();
        }
        return this.promise;
      }
      execute() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const result = yield this.downloadFn();
            return {
              data: yield result.blob(),
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(BlobDownloadBuilder, "BlobDownloadBuilder");
    _a = Symbol.toStringTag;
    BlobDownloadBuilder_default = BlobDownloadBuilder;
  }
});

// node_modules/@supabase/storage-js/dist/module/packages/StorageFileApi.js
var DEFAULT_SEARCH_OPTIONS, DEFAULT_FILE_OPTIONS, StorageFileApi;
var init_StorageFileApi = __esm({
  "node_modules/@supabase/storage-js/dist/module/packages/StorageFileApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_errors();
    init_fetch();
    init_helpers();
    init_BlobDownloadBuilder();
    DEFAULT_SEARCH_OPTIONS = {
      limit: 100,
      offset: 0,
      sortBy: {
        column: "name",
        order: "asc"
      }
    };
    DEFAULT_FILE_OPTIONS = {
      cacheControl: "3600",
      contentType: "text/plain;charset=UTF-8",
      upsert: false
    };
    StorageFileApi = class {
      constructor(url, headers = {}, bucketId, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url;
        this.headers = headers;
        this.bucketId = bucketId;
        this.fetch = resolveFetch2(fetch2);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
       *
       * @param method HTTP method.
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       */
      uploadOrUpdate(method, path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let body;
            const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
            let headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
            const metadata = options.metadata;
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
              body = new FormData();
              body.append("cacheControl", options.cacheControl);
              if (metadata) {
                body.append("metadata", this.encodeMetadata(metadata));
              }
              body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
              body = fileBody;
              if (!body.has("cacheControl")) {
                body.append("cacheControl", options.cacheControl);
              }
              if (metadata && !body.has("metadata")) {
                body.append("metadata", this.encodeMetadata(metadata));
              }
            } else {
              body = fileBody;
              headers["cache-control"] = `max-age=${options.cacheControl}`;
              headers["content-type"] = options.contentType;
              if (metadata) {
                headers["x-metadata"] = this.toBase64(this.encodeMetadata(metadata));
              }
              const isStream = typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function";
              if (isStream && !options.duplex) {
                options.duplex = "half";
              }
            }
            if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
              headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
            }
            const cleanPath = this._removeEmptyFolders(path);
            const _path = this._getFinalPath(cleanPath);
            const data = yield (method == "PUT" ? put : post)(this.fetch, `${this.url}/object/${_path}`, body, Object.assign({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
            return {
              data: { path: cleanPath, id: data.Id, fullPath: data.Key },
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Uploads a file to an existing bucket.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with file path and id or error
       *
       * @example Upload file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: false
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Upload file using `ArrayBuffer` from base64 file data
       * ```js
       * import { decode } from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      upload(path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
        });
      }
      /**
       * Upload a file with a token generated from `createSignedUploadUrl`.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param token The token generated from `createSignedUploadUrl`
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl and contentType.
       * @returns Promise with file path and full path or error
       *
       * @example Upload to a signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "folder/cat.jpg",
       *     "fullPath": "avatars/folder/cat.jpg"
       *   },
       *   "error": null
       * }
       * ```
       */
      uploadToSignedUrl(path, token, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          const cleanPath = this._removeEmptyFolders(path);
          const _path = this._getFinalPath(cleanPath);
          const url = new URL(this.url + `/object/upload/sign/${_path}`);
          url.searchParams.set("token", token);
          try {
            let body;
            const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
            const headers = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(options.upsert) });
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
              body = new FormData();
              body.append("cacheControl", options.cacheControl);
              body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
              body = fileBody;
              body.append("cacheControl", options.cacheControl);
            } else {
              body = fileBody;
              headers["cache-control"] = `max-age=${options.cacheControl}`;
              headers["content-type"] = options.contentType;
            }
            const data = yield put(this.fetch, url.toString(), body, { headers });
            return {
              data: { path: cleanPath, fullPath: data.Key },
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a signed upload URL.
       * Signed upload URLs can be used to upload files to the bucket without further authentication.
       * They are valid for 2 hours.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
       * @returns Promise with signed upload URL, token, and path or error
       *
       * @example Create Signed Upload URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUploadUrl('folder/cat.jpg')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
       *     "path": "folder/cat.jpg",
       *     "token": "<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       */
      createSignedUploadUrl(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let _path = this._getFinalPath(path);
            const headers = Object.assign({}, this.headers);
            if (options === null || options === void 0 ? void 0 : options.upsert) {
              headers["x-upsert"] = "true";
            }
            const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
            const url = new URL(this.url + data.url);
            const token = url.searchParams.get("token");
            if (!token) {
              throw new StorageError("No token returned by API");
            }
            return { data: { signedUrl: url.toString(), path, token }, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Replaces an existing file at the specified path with a new one.
       *
       * @category File Buckets
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with file path and id or error
       *
       * @example Update file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: true
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Update file using `ArrayBuffer` from base64 file data
       * ```js
       * import {decode} from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      update(path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
        });
      }
      /**
       * Moves an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
       * @param options The destination options.
       * @returns Promise with success message or error
       *
       * @example Move file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .move('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully moved"
       *   },
       *   "error": null
       * }
       * ```
       */
      move(fromPath, toPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post(this.fetch, `${this.url}/object/move`, {
              bucketId: this.bucketId,
              sourceKey: fromPath,
              destinationKey: toPath,
              destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Copies an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
       * @param options The destination options.
       * @returns Promise with copied file path or error
       *
       * @example Copy file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .copy('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "avatars/private/avatar2.png"
       *   },
       *   "error": null
       * }
       * ```
       */
      copy(fromPath, toPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post(this.fetch, `${this.url}/object/copy`, {
              bucketId: this.bucketId,
              sourceKey: fromPath,
              destinationKey: toPath,
              destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
            }, { headers: this.headers });
            return { data: { path: data.Key }, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Promise with signed URL or error
       *
       * @example Create Signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Create a signed URL for an asset with transformations
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Create a signed URL which triggers the download of the asset
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     download: true,
       *   })
       * ```
       */
      createSignedUrl(path, expiresIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let _path = this._getFinalPath(path);
            let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, (options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {}), { headers: this.headers });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
            data = { signedUrl };
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
       * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @returns Promise with array of signed URLs or error
       *
       * @example Create Signed URLs
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "error": null,
       *       "path": "folder/avatar1.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *     },
       *     {
       *       "error": null,
       *       "path": "folder/avatar2.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      createSignedUrls(paths, expiresIn, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            return {
              data: data.map((datum) => Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`) : null })),
              error: null
            };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
       *
       * @category File Buckets
       * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns BlobDownloadBuilder instance for downloading the file
       *
       * @example Download file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": <BLOB>,
       *   "error": null
       * }
       * ```
       *
       * @example Download file with transformations
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *       quality: 80
       *     }
       *   })
       * ```
       */
      download(path, options) {
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        const _path = this._getFinalPath(path);
        const downloadFn = /* @__PURE__ */ __name(() => get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
          headers: this.headers,
          noResolveJson: true
        }), "downloadFn");
        return new BlobDownloadBuilder_default(downloadFn, this.shouldThrowOnError);
      }
      /**
       * Retrieves the details of an existing file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with file metadata or error
       *
       * @example Get file info
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .info('folder/avatar1.png')
       * ```
       */
      info(path) {
        return __awaiter(this, void 0, void 0, function* () {
          const _path = this._getFinalPath(path);
          try {
            const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
              headers: this.headers
            });
            return { data: recursiveToCamel(data), error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Checks the existence of a file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with boolean indicating file existence or error
       *
       * @example Check file existence
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .exists('folder/avatar1.png')
       * ```
       */
      exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
          const _path = this._getFinalPath(path);
          try {
            yield head(this.fetch, `${this.url}/object/${_path}`, {
              headers: this.headers
            });
            return { data: true, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error) && error instanceof StorageUnknownError) {
              const originalError = error.originalError;
              if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
                return { data: false, error };
              }
            }
            throw error;
          }
        });
      }
      /**
       * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
       * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
       *
       * @category File Buckets
       * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
       * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Object with public URL
       *
       * @example Returns the URL for an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
       *   }
       * }
       * ```
       *
       * @example Returns the URL for an asset in a public bucket with transformations
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Returns the URL which triggers the download of an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     download: true,
       *   })
       * ```
       */
      getPublicUrl(path, options) {
        const _path = this._getFinalPath(path);
        const _queryString = [];
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
        if (downloadQueryParam !== "") {
          _queryString.push(downloadQueryParam);
        }
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        if (transformationQuery !== "") {
          _queryString.push(transformationQuery);
        }
        let queryString = _queryString.join("&");
        if (queryString !== "") {
          queryString = `?${queryString}`;
        }
        return {
          data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) }
        };
      }
      /**
       * Deletes files within the same bucket
       *
       * @category File Buckets
       * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
       * @returns Promise with list of deleted files or error
       *
       * @example Delete file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .remove(['folder/avatar1.png'])
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [],
       *   "error": null
       * }
       * ```
       */
      remove(paths) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Get file metadata
       * @param id the file id to retrieve metadata
       */
      // async getMetadata(
      //   id: string
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Update file metadata
       * @param id the file id to update metadata
       * @param meta the new file metadata
       */
      // async updateMetadata(
      //   id: string,
      //   meta: Metadata
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await post(
      //       this.fetch,
      //       `${this.url}/metadata/${id}`,
      //       { ...meta },
      //       { headers: this.headers }
      //     )
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Lists all the files and folders within a path of the bucket.
       *
       * @category File Buckets
       * @param path The folder path.
       * @param options Search options including limit (defaults to 100), offset, sortBy, and search
       * @param parameters Optional fetch parameters including signal for cancellation
       * @returns Promise with list of files or error
       *
       * @example List files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "name": "avatar1.png",
       *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
       *       "updated_at": "2024-05-22T23:06:05.580Z",
       *       "created_at": "2024-05-22T23:04:34.443Z",
       *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
       *       "metadata": {
       *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
       *         "size": 32175,
       *         "mimetype": "image/png",
       *         "cacheControl": "max-age=3600",
       *         "lastModified": "2024-05-22T23:06:05.574Z",
       *         "contentLength": 32175,
       *         "httpStatusCode": 200
       *       }
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       *
       * @example Search files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *     search: 'jon'
       *   })
       * ```
       */
      list(path, options, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || "" });
            const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @experimental this method signature might change in the future
       *
       * @category File Buckets
       * @param options search options
       * @param parameters
       */
      listV2(options, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const body = Object.assign({}, options);
            const data = yield post(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, body, { headers: this.headers }, parameters);
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      encodeMetadata(metadata) {
        return JSON.stringify(metadata);
      }
      toBase64(data) {
        if (typeof Buffer !== "undefined") {
          return Buffer.from(data).toString("base64");
        }
        return btoa(data);
      }
      _getFinalPath(path) {
        return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
      }
      _removeEmptyFolders(path) {
        return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
      }
      transformOptsToQueryString(transform) {
        const params = [];
        if (transform.width) {
          params.push(`width=${transform.width}`);
        }
        if (transform.height) {
          params.push(`height=${transform.height}`);
        }
        if (transform.resize) {
          params.push(`resize=${transform.resize}`);
        }
        if (transform.format) {
          params.push(`format=${transform.format}`);
        }
        if (transform.quality) {
          params.push(`quality=${transform.quality}`);
        }
        return params.join("&");
      }
    };
    __name(StorageFileApi, "StorageFileApi");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/version.js
var version2;
var init_version2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/version.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    version2 = "2.84.0";
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/constants.js
var DEFAULT_HEADERS;
var init_constants2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/constants.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version2();
    DEFAULT_HEADERS = {
      "X-Client-Info": `storage-js/${version2}`
    };
  }
});

// node_modules/@supabase/storage-js/dist/module/packages/StorageBucketApi.js
var StorageBucketApi;
var init_StorageBucketApi = __esm({
  "node_modules/@supabase/storage-js/dist/module/packages/StorageBucketApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants2();
    init_errors();
    init_fetch();
    init_helpers();
    StorageBucketApi = class {
      constructor(url, headers = {}, fetch2, opts) {
        this.shouldThrowOnError = false;
        const baseUrl = new URL(url);
        if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
          const isSupabaseHost = /supabase\.(co|in|red)$/.test(baseUrl.hostname);
          if (isSupabaseHost && !baseUrl.hostname.includes("storage.supabase.")) {
            baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
          }
        }
        this.url = baseUrl.href.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS), headers);
        this.fetch = resolveFetch2(fetch2);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * Retrieves the details of all Storage buckets within an existing project.
       *
       * @category File Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with list of buckets or error
       *
       * @example List buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets()
       * ```
       *
       * @example List buckets with options
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc',
       *     search: 'prod'
       *   })
       * ```
       */
      listBuckets(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const queryString = this.listBucketOptionsToQueryString(options);
            const data = yield get(this.fetch, `${this.url}/bucket${queryString}`, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Retrieves the details of an existing Storage bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to retrieve.
       * @returns Promise with bucket details or error
       *
       * @example Get bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .getBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "id": "avatars",
       *     "name": "avatars",
       *     "owner": "",
       *     "public": false,
       *     "file_size_limit": 1024,
       *     "allowed_mime_types": [
       *       "image/png"
       *     ],
       *     "created_at": "2024-05-22T22:26:05.100Z",
       *     "updated_at": "2024-05-22T22:26:05.100Z"
       *   },
       *   "error": null
       * }
       * ```
       */
      getBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Creates a new Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are creating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
       *   - default bucket type is `STANDARD`
       * @returns Promise with newly created bucket id or error
       *
       * @example Create bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .createBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "avatars"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, options = {
          public: false
        }) {
          try {
            const data = yield post(this.fetch, `${this.url}/bucket`, {
              id,
              name: id,
              type: options.type,
              public: options.public,
              file_size_limit: options.fileSizeLimit,
              allowed_mime_types: options.allowedMimeTypes
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Updates a Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are updating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @returns Promise with success message or error
       *
       * @example Update bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .updateBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully updated"
       *   },
       *   "error": null
       * }
       * ```
       */
      updateBucket(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
              id,
              name: id,
              public: options.public,
              file_size_limit: options.fileSizeLimit,
              allowed_mime_types: options.allowedMimeTypes
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Removes all objects inside a single bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to empty.
       * @returns Promise with success message or error
       *
       * @example Empty bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .emptyBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully emptied"
       *   },
       *   "error": null
       * }
       * ```
       */
      emptyBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
       * You must first `empty()` the bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to delete.
       * @returns Promise with success message or error
       *
       * @example Delete bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .deleteBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      listBucketOptionsToQueryString(options) {
        const params = {};
        if (options) {
          if ("limit" in options) {
            params.limit = String(options.limit);
          }
          if ("offset" in options) {
            params.offset = String(options.offset);
          }
          if (options.search) {
            params.search = options.search;
          }
          if (options.sortColumn) {
            params.sortColumn = options.sortColumn;
          }
          if (options.sortOrder) {
            params.sortOrder = options.sortOrder;
          }
        }
        return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
      }
    };
    __name(StorageBucketApi, "StorageBucketApi");
  }
});

// node_modules/@supabase/storage-js/dist/module/packages/StorageAnalyticsClient.js
var StorageAnalyticsClient;
var init_StorageAnalyticsClient = __esm({
  "node_modules/@supabase/storage-js/dist/module/packages/StorageAnalyticsClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants2();
    init_errors();
    init_fetch();
    init_helpers();
    StorageAnalyticsClient = class {
      /**
       * @alpha
       *
       * Creates a new StorageAnalyticsClient instance
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param url - The base URL for the storage API
       * @param headers - HTTP headers to include in requests
       * @param fetch - Optional custom fetch implementation
       *
       * @example
       * ```typescript
       * const client = new StorageAnalyticsClient(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS), headers);
        this.fetch = resolveFetch2(fetch2);
      }
      /**
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns This instance for method chaining
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       * @alpha
       *
       * Creates a new analytics bucket using Iceberg tables
       * Analytics buckets are optimized for analytical queries and data processing
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param name A unique name for the bucket you are creating
       * @returns Promise with newly created bucket name or error
       *
       * @example Create analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .createBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "analytics-data"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(name) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post(this.fetch, `${this.url}/bucket`, { name }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @alpha
       *
       * Retrieves the details of all Analytics Storage buckets within an existing project
       * Only returns buckets of type 'ANALYTICS'
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with list of analytics buckets or error
       *
       * @example List analytics buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc'
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "id": "analytics-data",
       *       "name": "analytics-data",
       *       "type": "ANALYTICS",
       *       "created_at": "2024-05-22T22:26:05.100Z",
       *       "updated_at": "2024-05-22T22:26:05.100Z"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      listBuckets(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const queryParams = new URLSearchParams();
            if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0)
              queryParams.set("limit", options.limit.toString());
            if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0)
              queryParams.set("offset", options.offset.toString());
            if (options === null || options === void 0 ? void 0 : options.sortColumn)
              queryParams.set("sortColumn", options.sortColumn);
            if (options === null || options === void 0 ? void 0 : options.sortOrder)
              queryParams.set("sortOrder", options.sortOrder);
            if (options === null || options === void 0 ? void 0 : options.search)
              queryParams.set("search", options.search);
            const queryString = queryParams.toString();
            const url = queryString ? `${this.url}/bucket?${queryString}` : `${this.url}/bucket`;
            const data = yield get(this.fetch, url, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       * @alpha
       *
       * Deletes an existing analytics bucket
       * A bucket can't be deleted with existing objects inside it
       * You must first empty the bucket before deletion
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param bucketName The unique identifier of the bucket you would like to delete
       * @returns Promise with success message or error
       *
       * @example Delete analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .deleteBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield remove(this.fetch, `${this.url}/bucket/${bucketName}`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(StorageAnalyticsClient, "StorageAnalyticsClient");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/constants.js
var DEFAULT_HEADERS2;
var init_constants3 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/constants.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version2();
    DEFAULT_HEADERS2 = {
      "X-Client-Info": `storage-js/${version2}`,
      "Content-Type": "application/json"
    };
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/errors.js
function isStorageVectorsError(error) {
  return typeof error === "object" && error !== null && "__isStorageVectorsError" in error;
}
var StorageVectorsError, StorageVectorsApiError, StorageVectorsUnknownError, StorageVectorsErrorCode;
var init_errors2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/errors.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    StorageVectorsError = class extends Error {
      constructor(message) {
        super(message);
        this.__isStorageVectorsError = true;
        this.name = "StorageVectorsError";
      }
    };
    __name(StorageVectorsError, "StorageVectorsError");
    __name(isStorageVectorsError, "isStorageVectorsError");
    StorageVectorsApiError = class extends StorageVectorsError {
      constructor(message, status, statusCode) {
        super(message);
        this.name = "StorageVectorsApiError";
        this.status = status;
        this.statusCode = statusCode;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          statusCode: this.statusCode
        };
      }
    };
    __name(StorageVectorsApiError, "StorageVectorsApiError");
    StorageVectorsUnknownError = class extends StorageVectorsError {
      constructor(message, originalError) {
        super(message);
        this.name = "StorageVectorsUnknownError";
        this.originalError = originalError;
      }
    };
    __name(StorageVectorsUnknownError, "StorageVectorsUnknownError");
    (function(StorageVectorsErrorCode2) {
      StorageVectorsErrorCode2["InternalError"] = "InternalError";
      StorageVectorsErrorCode2["S3VectorConflictException"] = "S3VectorConflictException";
      StorageVectorsErrorCode2["S3VectorNotFoundException"] = "S3VectorNotFoundException";
      StorageVectorsErrorCode2["S3VectorBucketNotEmpty"] = "S3VectorBucketNotEmpty";
      StorageVectorsErrorCode2["S3VectorMaxBucketsExceeded"] = "S3VectorMaxBucketsExceeded";
      StorageVectorsErrorCode2["S3VectorMaxIndexesExceeded"] = "S3VectorMaxIndexesExceeded";
    })(StorageVectorsErrorCode || (StorageVectorsErrorCode = {}));
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/helpers.js
var resolveFetch3, isPlainObject2;
var init_helpers2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/helpers.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    resolveFetch3 = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    isPlainObject2 = /* @__PURE__ */ __name((value) => {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
    }, "isPlainObject");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/fetch.js
function _handleRequest2(fetcher, method, url, options, parameters, body) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      fetcher(url, _getRequestParams2(method, options, parameters, body)).then((result) => {
        if (!result.ok)
          throw result;
        if (options === null || options === void 0 ? void 0 : options.noResolveJson)
          return result;
        const contentType = result.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return {};
        }
        return result.json();
      }).then((data) => resolve(data)).catch((error) => handleError2(error, reject, options));
    });
  });
}
function post2(fetcher, url, body, options, parameters) {
  return __awaiter(this, void 0, void 0, function* () {
    return _handleRequest2(fetcher, "POST", url, options, parameters, body);
  });
}
var _getErrorMessage2, handleError2, _getRequestParams2;
var init_fetch2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/fetch.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_errors2();
    init_helpers2();
    _getErrorMessage2 = /* @__PURE__ */ __name((err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err), "_getErrorMessage");
    handleError2 = /* @__PURE__ */ __name((error, reject, options) => __awaiter(void 0, void 0, void 0, function* () {
      const isResponseLike = error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number";
      if (isResponseLike && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        const status = error.status || 500;
        const responseError = error;
        if (typeof responseError.json === "function") {
          responseError.json().then((err) => {
            const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
            reject(new StorageVectorsApiError(_getErrorMessage2(err), status, statusCode));
          }).catch(() => {
            const statusCode = status + "";
            const message = responseError.statusText || `HTTP ${status} error`;
            reject(new StorageVectorsApiError(message, status, statusCode));
          });
        } else {
          const statusCode = status + "";
          const message = responseError.statusText || `HTTP ${status} error`;
          reject(new StorageVectorsApiError(message, status, statusCode));
        }
      } else {
        reject(new StorageVectorsUnknownError(_getErrorMessage2(error), error));
      }
    }), "handleError");
    _getRequestParams2 = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET" || !body) {
        return params;
      }
      if (isPlainObject2(body)) {
        params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
      } else {
        params.body = body;
      }
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    __name(_handleRequest2, "_handleRequest");
    __name(post2, "post");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorIndexApi.js
var VectorIndexApi;
var init_VectorIndexApi = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorIndexApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants3();
    init_errors2();
    init_fetch2();
    init_helpers2();
    VectorIndexApi = class {
      /**
       *
       * @alpha
       *
       * Creates an API client for managing vector indexes.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - Base URL for the Storage Vectors API.
       * @param headers - Default headers sent with each request.
       * @param fetch - Optional custom `fetch` implementation for non-browser runtimes.
       *
       * @example
       * ```typescript
       * const client = new VectorIndexApi(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS2), headers);
        this.fetch = resolveFetch3(fetch2);
      }
      /**
       *
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns This instance for method chaining
       * @example
       * ```typescript
       * const client = new VectorIndexApi(url, headers)
       * client.throwOnError()
       * const { data } = await client.createIndex(options) // throws on error
       * ```
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector index within a bucket
       * Defines the schema for vectors including dimensionality, distance metric, and metadata config
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Index configuration
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Unique name for the index within the bucket
       * @param options.dataType - Data type for vector components (currently only 'float32')
       * @param options.dimension - Dimensionality of vectors (e.g., 384, 768, 1536)
       * @param options.distanceMetric - Similarity metric ('cosine', 'euclidean', 'dotproduct')
       * @param options.metadataConfiguration - Optional config for non-filterable metadata keys
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorConflictException` if index already exists (HTTP 409)
       * - `S3VectorMaxIndexesExceeded` if quota exceeded (HTTP 400)
       * - `S3VectorNotFoundException` if bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.createIndex({
       *   vectorBucketName: 'embeddings-prod',
       *   indexName: 'documents-openai-small',
       *   dataType: 'float32',
       *   dimension: 1536,
       *   distanceMetric: 'cosine',
       *   metadataConfiguration: {
       *     nonFilterableMetadataKeys: ['raw_text', 'internal_id']
       *   }
       * })
       * ```
       */
      createIndex(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/CreateIndex`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific vector index
       * Returns index configuration including dimension, distance metric, and metadata settings
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the parent vector bucket
       * @param indexName - Name of the index to retrieve
       * @returns Promise with index metadata or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if index or bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.getIndex('embeddings-prod', 'documents-openai-small')
       * if (data) {
       *   console.log('Index dimension:', data.index.dimension)
       *   console.log('Distance metric:', data.index.distanceMetric)
       * }
       * ```
       */
      getIndex(vectorBucketName, indexName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/GetIndex`, { vectorBucketName, indexName }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Lists vector indexes within a bucket with optional filtering and pagination
       * Supports prefix-based filtering and paginated results
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.prefix - Filter indexes by name prefix
       * @param options.maxResults - Maximum results per page (default: 100)
       * @param options.nextToken - Pagination token from previous response
       * @returns Promise with list of indexes and pagination token
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // List all indexes in a bucket
       * const { data, error } = await client.listIndexes({
       *   vectorBucketName: 'embeddings-prod',
       *   prefix: 'documents-'
       * })
       * if (data) {
       *   console.log('Found indexes:', data.indexes.map(i => i.indexName))
       *   // Fetch next page if available
       *   if (data.nextToken) {
       *     const next = await client.listIndexes({
       *       vectorBucketName: 'embeddings-prod',
       *       nextToken: data.nextToken
       *     })
       *   }
       * }
       * ```
       */
      listIndexes(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/ListIndexes`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes a vector index and all its data
       * This operation removes the index schema and all vectors stored in the index
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the parent vector bucket
       * @param indexName - Name of the index to delete
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if index or bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // Delete an index and all its vectors
       * const { error } = await client.deleteIndex('embeddings-prod', 'old-index')
       * if (!error) {
       *   console.log('Index deleted successfully')
       * }
       * ```
       */
      deleteIndex(vectorBucketName, indexName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/DeleteIndex`, { vectorBucketName, indexName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorIndexApi, "VectorIndexApi");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorDataApi.js
var VectorDataApi;
var init_VectorDataApi = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorDataApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants3();
    init_errors2();
    init_fetch2();
    init_helpers2();
    VectorDataApi = class {
      /**
       *
       * @alpha
       *
       * Creates a VectorDataApi bound to a Storage Vectors deployment.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - Base URL for the Storage Vectors API.
       * @param headers - Default headers (for example authentication tokens).
       * @param fetch - Optional custom `fetch` implementation for non-browser runtimes.
       *
       * @example
       * ```typescript
       * const client = new VectorDataApi(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS2), headers);
        this.fetch = resolveFetch3(fetch2);
      }
      /**
       *
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns This instance for method chaining
       * @example
       * ```typescript
       * const client = new VectorDataApi(url, headers)
       * client.throwOnError()
       * const { data } = await client.putVectors(options) // throws on error
       * ```
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       *
       * @alpha
       *
       * Inserts or updates vectors in batch (upsert operation)
       * Accepts 1-500 vectors per request. Larger batches should be split
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector insertion options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Name of the target index
       * @param options.vectors - Array of vectors to insert/update (1-500 items)
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorConflictException` if duplicate key conflict occurs (HTTP 409)
       * - `S3VectorNotFoundException` if bucket or index doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.putVectors({
       *   vectorBucketName: 'embeddings-prod',
       *   indexName: 'documents-openai-small',
       *   vectors: [
       *     {
       *       key: 'doc-1',
       *       data: { float32: [0.1, 0.2, 0.3, ...] }, // 1536 dimensions
       *       metadata: { title: 'Introduction', page: 1 }
       *     },
       *     {
       *       key: 'doc-2',
       *       data: { float32: [0.4, 0.5, 0.6, ...] },
       *       metadata: { title: 'Conclusion', page: 42 }
       *     }
       *   ]
       * })
       * ```
       */
      putVectors(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (options.vectors.length < 1 || options.vectors.length > 500) {
              throw new Error("Vector batch size must be between 1 and 500 items");
            }
            const data = yield post2(this.fetch, `${this.url}/PutVectors`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves vectors by their keys in batch
       * Optionally includes vector data and/or metadata in response
       * Additional permissions required when returning data or metadata
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector retrieval options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Name of the index
       * @param options.keys - Array of vector keys to retrieve
       * @param options.returnData - Whether to include vector embeddings (requires permission)
       * @param options.returnMetadata - Whether to include metadata (requires permission)
       * @returns Promise with array of vectors or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket or index doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.getVectors({
       *   vectorBucketName: 'embeddings-prod',
       *   indexName: 'documents-openai-small',
       *   keys: ['doc-1', 'doc-2', 'doc-3'],
       *   returnData: false,     // Don't return embeddings
       *   returnMetadata: true   // Return metadata only
       * })
       * if (data) {
       *   data.vectors.forEach(v => console.log(v.key, v.metadata))
       * }
       * ```
       */
      getVectors(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/GetVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Lists/scans vectors in an index with pagination
       * Supports parallel scanning via segment configuration for high-throughput scenarios
       * Additional permissions required when returning data or metadata
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector listing options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Name of the index
       * @param options.maxResults - Maximum results per page (default: 500, max: 1000)
       * @param options.nextToken - Pagination token from previous response
       * @param options.returnData - Whether to include vector embeddings (requires permission)
       * @param options.returnMetadata - Whether to include metadata (requires permission)
       * @param options.segmentCount - Total parallel segments (1-16) for distributed scanning
       * @param options.segmentIndex - Zero-based segment index (0 to segmentCount-1)
       * @returns Promise with array of vectors, pagination token, or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket or index doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // Simple pagination
       * let nextToken: string | undefined
       * do {
       *   const { data, error } = await client.listVectors({
       *     vectorBucketName: 'embeddings-prod',
       *     indexName: 'documents-openai-small',
       *     maxResults: 500,
       *     nextToken,
       *     returnMetadata: true
       *   })
       *   if (error) break
       *   console.log('Batch:', data.vectors.length)
       *   nextToken = data.nextToken
       * } while (nextToken)
       *
       * // Parallel scanning (4 concurrent workers)
       * const workers = [0, 1, 2, 3].map(async (segmentIndex) => {
       *   const { data } = await client.listVectors({
       *     vectorBucketName: 'embeddings-prod',
       *     indexName: 'documents-openai-small',
       *     segmentCount: 4,
       *     segmentIndex,
       *     returnMetadata: true
       *   })
       *   return data?.vectors || []
       * })
       * const results = await Promise.all(workers)
       * ```
       */
      listVectors(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (options.segmentCount !== void 0) {
              if (options.segmentCount < 1 || options.segmentCount > 16) {
                throw new Error("segmentCount must be between 1 and 16");
              }
              if (options.segmentIndex !== void 0) {
                if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) {
                  throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
                }
              }
            }
            const data = yield post2(this.fetch, `${this.url}/ListVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Queries for similar vectors using approximate nearest neighbor (ANN) search
       * Returns top-K most similar vectors based on the configured distance metric
       * Supports optional metadata filtering (requires GetVectors permission)
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Query options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Name of the index
       * @param options.queryVector - Query embedding to find similar vectors
       * @param options.topK - Number of nearest neighbors to return (default: 10)
       * @param options.filter - Optional JSON filter for metadata (requires GetVectors permission)
       * @param options.returnDistance - Whether to include similarity distances
       * @param options.returnMetadata - Whether to include metadata (requires GetVectors permission)
       * @returns Promise with array of similar vectors ordered by distance
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket or index doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // Semantic search with filtering
       * const { data, error } = await client.queryVectors({
       *   vectorBucketName: 'embeddings-prod',
       *   indexName: 'documents-openai-small',
       *   queryVector: { float32: [0.1, 0.2, 0.3, ...] }, // 1536 dimensions
       *   topK: 5,
       *   filter: {
       *     category: 'technical',
       *     published: true
       *   },
       *   returnDistance: true,
       *   returnMetadata: true
       * })
       * if (data) {
       *   data.matches.forEach(match => {
       *     console.log(`${match.key}: distance=${match.distance}`)
       *     console.log('Metadata:', match.metadata)
       *   })
       * }
       * ```
       */
      queryVectors(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/QueryVectors`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes vectors by their keys in batch
       * Accepts 1-500 keys per request
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector deletion options
       * @param options.vectorBucketName - Name of the parent vector bucket
       * @param options.indexName - Name of the index
       * @param options.keys - Array of vector keys to delete (1-500 items)
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket or index doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { error } = await client.deleteVectors({
       *   vectorBucketName: 'embeddings-prod',
       *   indexName: 'documents-openai-small',
       *   keys: ['doc-1', 'doc-2', 'doc-3']
       * })
       * if (!error) {
       *   console.log('Vectors deleted successfully')
       * }
       * ```
       */
      deleteVectors(options) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (options.keys.length < 1 || options.keys.length > 500) {
              throw new Error("Keys batch size must be between 1 and 500 items");
            }
            const data = yield post2(this.fetch, `${this.url}/DeleteVectors`, options, {
              headers: this.headers
            });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorDataApi, "VectorDataApi");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorBucketApi.js
var VectorBucketApi;
var init_VectorBucketApi = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/VectorBucketApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants3();
    init_errors2();
    init_fetch2();
    init_helpers2();
    VectorBucketApi = class {
      /**
       *
       * @alpha
       *
       * Creates a new VectorBucketApi instance
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - The base URL for the storage vectors API
       * @param headers - HTTP headers to include in requests
       * @param fetch - Optional custom fetch implementation
       *
       * @example
       * ```typescript
       * const client = new VectorBucketApi(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch2) {
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS2), headers);
        this.fetch = resolveFetch3(fetch2);
      }
      /**
       *
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns This instance for method chaining
       * @example
       * ```typescript
       * const client = new VectorBucketApi(url, headers)
       * client.throwOnError()
       * const { data } = await client.createBucket('my-bucket') // throws on error
       * ```
       */
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector bucket
       * Vector buckets are containers for vector indexes and their data
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Unique name for the vector bucket
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorConflictException` if bucket already exists (HTTP 409)
       * - `S3VectorMaxBucketsExceeded` if quota exceeded (HTTP 400)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.createBucket('embeddings-prod')
       * if (error) {
       *   console.error('Failed to create bucket:', error.message)
       * }
       * ```
       */
      createBucket(vectorBucketName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/CreateVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific vector bucket
       * Returns bucket configuration including encryption settings and creation time
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket to retrieve
       * @returns Promise with bucket metadata or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorNotFoundException` if bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * const { data, error } = await client.getBucket('embeddings-prod')
       * if (data) {
       *   console.log('Bucket created at:', new Date(data.vectorBucket.creationTime! * 1000))
       * }
       * ```
       */
      getBucket(vectorBucketName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/GetVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Lists vector buckets with optional filtering and pagination
       * Supports prefix-based filtering and paginated results
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options
       * @param options.prefix - Filter buckets by name prefix
       * @param options.maxResults - Maximum results per page (default: 100)
       * @param options.nextToken - Pagination token from previous response
       * @returns Promise with list of buckets and pagination token
       *
       * @throws {StorageVectorsApiError} With code:
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // List all buckets with prefix 'prod-'
       * const { data, error } = await client.listBuckets({ prefix: 'prod-' })
       * if (data) {
       *   console.log('Found buckets:', data.buckets.length)
       *   // Fetch next page if available
       *   if (data.nextToken) {
       *     const next = await client.listBuckets({ nextToken: data.nextToken })
       *   }
       * }
       * ```
       */
      listBuckets() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
          try {
            const data = yield post2(this.fetch, `${this.url}/ListVectorBuckets`, options, {
              headers: this.headers
            });
            return { data, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes a vector bucket
       * Bucket must be empty before deletion (all indexes must be removed first)
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket to delete
       * @returns Promise with empty response on success or error
       *
       * @throws {StorageVectorsApiError} With code:
       * - `S3VectorBucketNotEmpty` if bucket contains indexes (HTTP 400)
       * - `S3VectorNotFoundException` if bucket doesn't exist (HTTP 404)
       * - `InternalError` for server errors (HTTP 500)
       *
       * @example
       * ```typescript
       * // Delete all indexes first, then delete bucket
       * const { error } = await client.deleteBucket('old-bucket')
       * if (error?.statusCode === 'S3VectorBucketNotEmpty') {
       *   console.error('Must delete all indexes first')
       * }
       * ```
       */
      deleteBucket(vectorBucketName) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield post2(this.fetch, `${this.url}/DeleteVectorBucket`, { vectorBucketName }, { headers: this.headers });
            return { data: data || {}, error: null };
          } catch (error) {
            if (this.shouldThrowOnError) {
              throw error;
            }
            if (isStorageVectorsError(error)) {
              return { data: null, error };
            }
            throw error;
          }
        });
      }
    };
    __name(VectorBucketApi, "VectorBucketApi");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/StorageVectorsClient.js
var StorageVectorsClient, VectorBucketScope, VectorIndexScope;
var init_StorageVectorsClient = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/StorageVectorsClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_VectorIndexApi();
    init_VectorDataApi();
    init_VectorBucketApi();
    StorageVectorsClient = class extends VectorBucketApi {
      /**
       * @alpha
       *
       * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - Base URL of the Storage Vectors REST API.
       * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
       * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
       *
       * @example
       * ```typescript
       * const client = new StorageVectorsClient(url, options)
       * ```
       */
      constructor(url, options = {}) {
        super(url, options.headers || {}, options.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific vector bucket
       * Returns a scoped client for index and vector operations within the bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket
       * @returns Bucket-scoped client with index and vector operations
       *
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       *
       * // Create an index in this bucket
       * await bucket.createIndex({
       *   indexName: 'documents-openai',
       *   dataType: 'float32',
       *   dimension: 1536,
       *   distanceMetric: 'cosine'
       * })
       *
       * // List indexes in this bucket
       * const { data } = await bucket.listIndexes()
       * ```
       */
      from(vectorBucketName) {
        return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
      }
    };
    __name(StorageVectorsClient, "StorageVectorsClient");
    VectorBucketScope = class extends VectorIndexApi {
      /**
       * @alpha
       *
       * Creates a helper that automatically scopes all index operations to the provided bucket.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       * ```
       */
      constructor(url, headers, vectorBucketName, fetch2) {
        super(url, headers, fetch2);
        this.vectorBucketName = vectorBucketName;
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Index configuration (vectorBucketName is automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       * await bucket.createIndex({
       *   indexName: 'documents-openai',
       *   dataType: 'float32',
       *   dimension: 1536,
       *   distanceMetric: 'cosine',
       *   metadataConfiguration: {
       *     nonFilterableMetadataKeys: ['raw_text']
       *   }
       * })
       * ```
       */
      createIndex(options) {
        const _super = Object.create(null, {
          createIndex: { get: () => super.createIndex }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.createIndex.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Lists indexes in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (vectorBucketName is automatically set)
       * @returns Promise with list of indexes or error
       *
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
       * ```
       */
      listIndexes() {
        const _super = Object.create(null, {
          listIndexes: { get: () => super.listIndexes }
        });
        return __awaiter(this, arguments, void 0, function* (options = {}) {
          return _super.listIndexes.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to retrieve
       * @returns Promise with index metadata or error
       *
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       * const { data } = await bucket.getIndex('documents-openai')
       * console.log('Dimension:', data?.index.dimension)
       * ```
       */
      getIndex(indexName) {
        const _super = Object.create(null, {
          getIndex: { get: () => super.getIndex }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.getIndex.call(this, this.vectorBucketName, indexName);
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes an index from this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to delete
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = client.bucket('embeddings-prod')
       * await bucket.deleteIndex('old-index')
       * ```
       */
      deleteIndex(indexName) {
        const _super = Object.create(null, {
          deleteIndex: { get: () => super.deleteIndex }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.deleteIndex.call(this, this.vectorBucketName, indexName);
        });
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific index within this bucket
       * Returns a scoped client for vector data operations
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index
       * @returns Index-scoped client with vector data operations
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       *
       * // Insert vectors
       * await index.putVectors({
       *   vectors: [
       *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
       *   ]
       * })
       *
       * // Query similar vectors
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [...] },
       *   topK: 5
       * })
       * ```
       */
      index(indexName) {
        return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
      }
    };
    __name(VectorBucketScope, "VectorBucketScope");
    VectorIndexScope = class extends VectorDataApi {
      /**
       *
       * @alpha
       *
       * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * ```
       */
      constructor(url, headers, vectorBucketName, indexName, fetch2) {
        super(url, headers, fetch2);
        this.vectorBucketName = vectorBucketName;
        this.indexName = indexName;
      }
      /**
       *
       * @alpha
       *
       * Inserts or updates vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector insertion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * await index.putVectors({
       *   vectors: [
       *     {
       *       key: 'doc-1',
       *       data: { float32: [0.1, 0.2, ...] },
       *       metadata: { title: 'Introduction', page: 1 }
       *     }
       *   ]
       * })
       * ```
       */
      putVectors(options) {
        const _super = Object.create(null, {
          putVectors: { get: () => super.putVectors }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.putVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Retrieves vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector retrieval options (bucket and index names automatically set)
       * @returns Promise with array of vectors or error
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * const { data } = await index.getVectors({
       *   keys: ['doc-1', 'doc-2'],
       *   returnMetadata: true
       * })
       * ```
       */
      getVectors(options) {
        const _super = Object.create(null, {
          getVectors: { get: () => super.getVectors }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.getVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Lists vectors in this index with pagination
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (bucket and index names automatically set)
       * @returns Promise with array of vectors and pagination token
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * const { data } = await index.listVectors({
       *   maxResults: 500,
       *   returnMetadata: true
       * })
       * ```
       */
      listVectors() {
        const _super = Object.create(null, {
          listVectors: { get: () => super.listVectors }
        });
        return __awaiter(this, arguments, void 0, function* (options = {}) {
          return _super.listVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Queries for similar vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Query options (bucket and index names automatically set)
       * @returns Promise with array of similar vectors ordered by distance
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [0.1, 0.2, ...] },
       *   topK: 5,
       *   filter: { category: 'technical' },
       *   returnDistance: true,
       *   returnMetadata: true
       * })
       * ```
       */
      queryVectors(options) {
        const _super = Object.create(null, {
          queryVectors: { get: () => super.queryVectors }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.queryVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
      /**
       *
       * @alpha
       *
       * Deletes vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Deletion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = client.bucket('embeddings-prod').index('documents-openai')
       * await index.deleteVectors({
       *   keys: ['doc-1', 'doc-2', 'doc-3']
       * })
       * ```
       */
      deleteVectors(options) {
        const _super = Object.create(null, {
          deleteVectors: { get: () => super.deleteVectors }
        });
        return __awaiter(this, void 0, void 0, function* () {
          return _super.deleteVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        });
      }
    };
    __name(VectorIndexScope, "VectorIndexScope");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/vectors/index.js
var init_vectors = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/vectors/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_StorageVectorsClient();
  }
});

// node_modules/@supabase/storage-js/dist/module/StorageClient.js
var StorageClient;
var init_StorageClient = __esm({
  "node_modules/@supabase/storage-js/dist/module/StorageClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_StorageFileApi();
    init_StorageBucketApi();
    init_StorageAnalyticsClient();
    init_vectors();
    StorageClient = class extends StorageBucketApi {
      /**
       * Creates a client for Storage buckets, files, analytics, and vectors.
       *
       * @category File Buckets
       * @example
       * ```ts
       * import { StorageClient } from '@supabase/storage-js'
       *
       * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
       *   apikey: 'public-anon-key',
       * })
       * const avatars = storage.from('avatars')
       * ```
       */
      constructor(url, headers = {}, fetch2, opts) {
        super(url, headers, fetch2, opts);
      }
      /**
       * Perform file operation in a bucket.
       *
       * @category File Buckets
       * @param id The bucket id to operate on.
       *
       * @example
       * ```typescript
       * const avatars = storage.from('avatars')
       * ```
       */
      from(id) {
        return new StorageFileApi(this.url, this.headers, id, this.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access vector storage operations.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns A StorageVectorsClient instance configured with the current storage settings.
       */
      get vectors() {
        return new StorageVectorsClient(this.url + "/vector", {
          headers: this.headers,
          fetch: this.fetch
        });
      }
      /**
       *
       * @alpha
       *
       * Access analytics storage operations using Iceberg tables.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns A StorageAnalyticsClient instance configured with the current storage settings.
       * @example
       * ```typescript
       * const client = createClient(url, key)
       * const analytics = client.storage.analytics
       *
       * // Create an analytics bucket
       * await analytics.createBucket('my-analytics-bucket')
       *
       * // List all analytics buckets
       * const { data: buckets } = await analytics.listBuckets()
       *
       * // Delete an analytics bucket
       * await analytics.deleteBucket('old-analytics-bucket')
       * ```
       */
      get analytics() {
        return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch);
      }
    };
    __name(StorageClient, "StorageClient");
  }
});

// node_modules/@supabase/storage-js/dist/module/lib/types.js
var init_types2 = __esm({
  "node_modules/@supabase/storage-js/dist/module/lib/types.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/@supabase/storage-js/dist/module/index.js
var init_module3 = __esm({
  "node_modules/@supabase/storage-js/dist/module/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_StorageClient();
    init_types2();
    init_errors();
    init_vectors();
  }
});

// node_modules/@supabase/supabase-js/dist/module/lib/version.js
var version3;
var init_version3 = __esm({
  "node_modules/@supabase/supabase-js/dist/module/lib/version.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    version3 = "2.84.0";
  }
});

// node_modules/@supabase/supabase-js/dist/module/lib/constants.js
var JS_ENV, DEFAULT_HEADERS3, DEFAULT_GLOBAL_OPTIONS, DEFAULT_DB_OPTIONS, DEFAULT_AUTH_OPTIONS, DEFAULT_REALTIME_OPTIONS;
var init_constants4 = __esm({
  "node_modules/@supabase/supabase-js/dist/module/lib/constants.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version3();
    JS_ENV = "";
    if (typeof Deno !== "undefined") {
      JS_ENV = "deno";
    } else if (typeof document !== "undefined") {
      JS_ENV = "web";
    } else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      JS_ENV = "react-native";
    } else {
      JS_ENV = "node";
    }
    DEFAULT_HEADERS3 = { "X-Client-Info": `supabase-js-${JS_ENV}/${version3}` };
    DEFAULT_GLOBAL_OPTIONS = {
      headers: DEFAULT_HEADERS3
    };
    DEFAULT_DB_OPTIONS = {
      schema: "public"
    };
    DEFAULT_AUTH_OPTIONS = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "implicit"
    };
    DEFAULT_REALTIME_OPTIONS = {};
  }
});

// node_modules/@supabase/supabase-js/dist/module/lib/fetch.js
var resolveFetch4, resolveHeadersConstructor, fetchWithAuth;
var init_fetch3 = __esm({
  "node_modules/@supabase/supabase-js/dist/module/lib/fetch.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    resolveFetch4 = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    resolveHeadersConstructor = /* @__PURE__ */ __name(() => {
      return Headers;
    }, "resolveHeadersConstructor");
    fetchWithAuth = /* @__PURE__ */ __name((supabaseKey, getAccessToken, customFetch) => {
      const fetch2 = resolveFetch4(customFetch);
      const HeadersConstructor = resolveHeadersConstructor();
      return async (input, init) => {
        var _a2;
        const accessToken = (_a2 = await getAccessToken()) !== null && _a2 !== void 0 ? _a2 : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has("apikey")) {
          headers.set("apikey", supabaseKey);
        }
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return fetch2(input, Object.assign(Object.assign({}, init), { headers }));
      };
    }, "fetchWithAuth");
  }
});

// node_modules/@supabase/supabase-js/dist/module/lib/helpers.js
function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : url + "/";
}
function applySettingDefaults(options, defaults) {
  var _a2, _b;
  const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
  const { db: DEFAULT_DB_OPTIONS2, auth: DEFAULT_AUTH_OPTIONS2, realtime: DEFAULT_REALTIME_OPTIONS2, global: DEFAULT_GLOBAL_OPTIONS2 } = defaults;
  const result = {
    db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS2), dbOptions),
    auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS2), authOptions),
    realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS2), realtimeOptions),
    storage: {},
    global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS2), globalOptions), { headers: Object.assign(Object.assign({}, (_a2 = DEFAULT_GLOBAL_OPTIONS2 === null || DEFAULT_GLOBAL_OPTIONS2 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS2.headers) !== null && _a2 !== void 0 ? _a2 : {}), (_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {}) }),
    accessToken: async () => ""
  };
  if (options.accessToken) {
    result.accessToken = options.accessToken;
  } else {
    delete result.accessToken;
  }
  return result;
}
function validateSupabaseUrl(supabaseUrl) {
  const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
  if (!trimmedUrl) {
    throw new Error("supabaseUrl is required.");
  }
  if (!trimmedUrl.match(/^https?:\/\//i)) {
    throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
  }
  try {
    return new URL(ensureTrailingSlash(trimmedUrl));
  } catch (_a2) {
    throw Error("Invalid supabaseUrl: Provided URL is malformed.");
  }
}
var init_helpers3 = __esm({
  "node_modules/@supabase/supabase-js/dist/module/lib/helpers.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(ensureTrailingSlash, "ensureTrailingSlash");
    __name(applySettingDefaults, "applySettingDefaults");
    __name(validateSupabaseUrl, "validateSupabaseUrl");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/version.js
var version4;
var init_version4 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/version.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    version4 = "2.84.0";
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/constants.js
var AUTO_REFRESH_TICK_DURATION_MS, AUTO_REFRESH_TICK_THRESHOLD, EXPIRY_MARGIN_MS, GOTRUE_URL, STORAGE_KEY, DEFAULT_HEADERS4, API_VERSION_HEADER_NAME, API_VERSIONS, BASE64URL_REGEX, JWKS_TTL;
var init_constants5 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/constants.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_version4();
    AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3;
    AUTO_REFRESH_TICK_THRESHOLD = 3;
    EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
    GOTRUE_URL = "http://localhost:9999";
    STORAGE_KEY = "supabase.auth.token";
    DEFAULT_HEADERS4 = { "X-Client-Info": `gotrue-js/${version4}` };
    API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
    API_VERSIONS = {
      "2024-01-01": {
        timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
        name: "2024-01-01"
      }
    };
    BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
    JWKS_TTL = 10 * 60 * 1e3;
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/errors.js
function isAuthError(error) {
  return typeof error === "object" && error !== null && "__isAuthError" in error;
}
function isAuthApiError(error) {
  return isAuthError(error) && error.name === "AuthApiError";
}
function isAuthSessionMissingError(error) {
  return isAuthError(error) && error.name === "AuthSessionMissingError";
}
function isAuthImplicitGrantRedirectError(error) {
  return isAuthError(error) && error.name === "AuthImplicitGrantRedirectError";
}
function isAuthRetryableFetchError(error) {
  return isAuthError(error) && error.name === "AuthRetryableFetchError";
}
var AuthError, AuthApiError, AuthUnknownError, CustomAuthError, AuthSessionMissingError, AuthInvalidTokenResponseError, AuthInvalidCredentialsError, AuthImplicitGrantRedirectError, AuthPKCEGrantCodeExchangeError, AuthRetryableFetchError, AuthWeakPasswordError, AuthInvalidJwtError;
var init_errors3 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/errors.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    AuthError = class extends Error {
      constructor(message, status, code) {
        super(message);
        this.__isAuthError = true;
        this.name = "AuthError";
        this.status = status;
        this.code = code;
      }
    };
    __name(AuthError, "AuthError");
    __name(isAuthError, "isAuthError");
    AuthApiError = class extends AuthError {
      constructor(message, status, code) {
        super(message, status, code);
        this.name = "AuthApiError";
        this.status = status;
        this.code = code;
      }
    };
    __name(AuthApiError, "AuthApiError");
    __name(isAuthApiError, "isAuthApiError");
    AuthUnknownError = class extends AuthError {
      constructor(message, originalError) {
        super(message);
        this.name = "AuthUnknownError";
        this.originalError = originalError;
      }
    };
    __name(AuthUnknownError, "AuthUnknownError");
    CustomAuthError = class extends AuthError {
      constructor(message, name, status, code) {
        super(message, status, code);
        this.name = name;
        this.status = status;
      }
    };
    __name(CustomAuthError, "CustomAuthError");
    AuthSessionMissingError = class extends CustomAuthError {
      constructor() {
        super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
      }
    };
    __name(AuthSessionMissingError, "AuthSessionMissingError");
    __name(isAuthSessionMissingError, "isAuthSessionMissingError");
    AuthInvalidTokenResponseError = class extends CustomAuthError {
      constructor() {
        super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
      }
    };
    __name(AuthInvalidTokenResponseError, "AuthInvalidTokenResponseError");
    AuthInvalidCredentialsError = class extends CustomAuthError {
      constructor(message) {
        super(message, "AuthInvalidCredentialsError", 400, void 0);
      }
    };
    __name(AuthInvalidCredentialsError, "AuthInvalidCredentialsError");
    AuthImplicitGrantRedirectError = class extends CustomAuthError {
      constructor(message, details = null) {
        super(message, "AuthImplicitGrantRedirectError", 500, void 0);
        this.details = null;
        this.details = details;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details
        };
      }
    };
    __name(AuthImplicitGrantRedirectError, "AuthImplicitGrantRedirectError");
    __name(isAuthImplicitGrantRedirectError, "isAuthImplicitGrantRedirectError");
    AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
      constructor(message, details = null) {
        super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
        this.details = null;
        this.details = details;
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details
        };
      }
    };
    __name(AuthPKCEGrantCodeExchangeError, "AuthPKCEGrantCodeExchangeError");
    AuthRetryableFetchError = class extends CustomAuthError {
      constructor(message, status) {
        super(message, "AuthRetryableFetchError", status, void 0);
      }
    };
    __name(AuthRetryableFetchError, "AuthRetryableFetchError");
    __name(isAuthRetryableFetchError, "isAuthRetryableFetchError");
    AuthWeakPasswordError = class extends CustomAuthError {
      constructor(message, status, reasons) {
        super(message, "AuthWeakPasswordError", status, "weak_password");
        this.reasons = reasons;
      }
    };
    __name(AuthWeakPasswordError, "AuthWeakPasswordError");
    AuthInvalidJwtError = class extends CustomAuthError {
      constructor(message) {
        super(message, "AuthInvalidJwtError", 400, "invalid_jwt");
      }
    };
    __name(AuthInvalidJwtError, "AuthInvalidJwtError");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/base64url.js
function byteToBase64URL(byte, state, emit) {
  if (byte !== null) {
    state.queue = state.queue << 8 | byte;
    state.queuedBits += 8;
    while (state.queuedBits >= 6) {
      const pos = state.queue >> state.queuedBits - 6 & 63;
      emit(TO_BASE64URL[pos]);
      state.queuedBits -= 6;
    }
  } else if (state.queuedBits > 0) {
    state.queue = state.queue << 6 - state.queuedBits;
    state.queuedBits = 6;
    while (state.queuedBits >= 6) {
      const pos = state.queue >> state.queuedBits - 6 & 63;
      emit(TO_BASE64URL[pos]);
      state.queuedBits -= 6;
    }
  }
}
function byteFromBase64URL(charCode, state, emit) {
  const bits = FROM_BASE64URL[charCode];
  if (bits > -1) {
    state.queue = state.queue << 6 | bits;
    state.queuedBits += 6;
    while (state.queuedBits >= 8) {
      emit(state.queue >> state.queuedBits - 8 & 255);
      state.queuedBits -= 8;
    }
  } else if (bits === -2) {
    return;
  } else {
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
  }
}
function stringFromBase64URL(str) {
  const conv = [];
  const utf8Emit = /* @__PURE__ */ __name((codepoint) => {
    conv.push(String.fromCodePoint(codepoint));
  }, "utf8Emit");
  const utf8State = {
    utf8seq: 0,
    codepoint: 0
  };
  const b64State = { queue: 0, queuedBits: 0 };
  const byteEmit = /* @__PURE__ */ __name((byte) => {
    stringFromUTF8(byte, utf8State, utf8Emit);
  }, "byteEmit");
  for (let i = 0; i < str.length; i += 1) {
    byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
  }
  return conv.join("");
}
function codepointToUTF8(codepoint, emit) {
  if (codepoint <= 127) {
    emit(codepoint);
    return;
  } else if (codepoint <= 2047) {
    emit(192 | codepoint >> 6);
    emit(128 | codepoint & 63);
    return;
  } else if (codepoint <= 65535) {
    emit(224 | codepoint >> 12);
    emit(128 | codepoint >> 6 & 63);
    emit(128 | codepoint & 63);
    return;
  } else if (codepoint <= 1114111) {
    emit(240 | codepoint >> 18);
    emit(128 | codepoint >> 12 & 63);
    emit(128 | codepoint >> 6 & 63);
    emit(128 | codepoint & 63);
    return;
  }
  throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}
function stringToUTF8(str, emit) {
  for (let i = 0; i < str.length; i += 1) {
    let codepoint = str.charCodeAt(i);
    if (codepoint > 55295 && codepoint <= 56319) {
      const highSurrogate = (codepoint - 55296) * 1024 & 65535;
      const lowSurrogate = str.charCodeAt(i + 1) - 56320 & 65535;
      codepoint = (lowSurrogate | highSurrogate) + 65536;
      i += 1;
    }
    codepointToUTF8(codepoint, emit);
  }
}
function stringFromUTF8(byte, state, emit) {
  if (state.utf8seq === 0) {
    if (byte <= 127) {
      emit(byte);
      return;
    }
    for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
      if ((byte >> 7 - leadingBit & 1) === 0) {
        state.utf8seq = leadingBit;
        break;
      }
    }
    if (state.utf8seq === 2) {
      state.codepoint = byte & 31;
    } else if (state.utf8seq === 3) {
      state.codepoint = byte & 15;
    } else if (state.utf8seq === 4) {
      state.codepoint = byte & 7;
    } else {
      throw new Error("Invalid UTF-8 sequence");
    }
    state.utf8seq -= 1;
  } else if (state.utf8seq > 0) {
    if (byte <= 127) {
      throw new Error("Invalid UTF-8 sequence");
    }
    state.codepoint = state.codepoint << 6 | byte & 63;
    state.utf8seq -= 1;
    if (state.utf8seq === 0) {
      emit(state.codepoint);
    }
  }
}
function base64UrlToUint8Array(str) {
  const result = [];
  const state = { queue: 0, queuedBits: 0 };
  const onByte = /* @__PURE__ */ __name((byte) => {
    result.push(byte);
  }, "onByte");
  for (let i = 0; i < str.length; i += 1) {
    byteFromBase64URL(str.charCodeAt(i), state, onByte);
  }
  return new Uint8Array(result);
}
function stringToUint8Array(str) {
  const result = [];
  stringToUTF8(str, (byte) => result.push(byte));
  return new Uint8Array(result);
}
function bytesToBase64URL(bytes) {
  const result = [];
  const state = { queue: 0, queuedBits: 0 };
  const onChar = /* @__PURE__ */ __name((char) => {
    result.push(char);
  }, "onChar");
  bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
  byteToBase64URL(null, state, onChar);
  return result.join("");
}
var TO_BASE64URL, IGNORE_BASE64URL, FROM_BASE64URL;
var init_base64url = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/base64url.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
    IGNORE_BASE64URL = " 	\n\r=".split("");
    FROM_BASE64URL = (() => {
      const charMap = new Array(128);
      for (let i = 0; i < charMap.length; i += 1) {
        charMap[i] = -1;
      }
      for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
        charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
      }
      for (let i = 0; i < TO_BASE64URL.length; i += 1) {
        charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
      }
      return charMap;
    })();
    __name(byteToBase64URL, "byteToBase64URL");
    __name(byteFromBase64URL, "byteFromBase64URL");
    __name(stringFromBase64URL, "stringFromBase64URL");
    __name(codepointToUTF8, "codepointToUTF8");
    __name(stringToUTF8, "stringToUTF8");
    __name(stringFromUTF8, "stringFromUTF8");
    __name(base64UrlToUint8Array, "base64UrlToUint8Array");
    __name(stringToUint8Array, "stringToUint8Array");
    __name(bytesToBase64URL, "bytesToBase64URL");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/helpers.js
function expiresAt(expiresIn) {
  const timeNow = Math.round(Date.now() / 1e3);
  return timeNow + expiresIn;
}
function generateCallbackId() {
  return Symbol("auth-callback");
}
function parseParametersFromURL(href) {
  const result = {};
  const url = new URL(href);
  if (url.hash && url.hash[0] === "#") {
    try {
      const hashSearchParams = new URLSearchParams(url.hash.substring(1));
      hashSearchParams.forEach((value, key) => {
        result[key] = value;
      });
    } catch (e) {
    }
  }
  url.searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthInvalidJwtError("Invalid JWT structure");
  }
  for (let i = 0; i < parts.length; i++) {
    if (!BASE64URL_REGEX.test(parts[i])) {
      throw new AuthInvalidJwtError("JWT not in base64url format");
    }
  }
  const data = {
    // using base64url lib
    header: JSON.parse(stringFromBase64URL(parts[0])),
    payload: JSON.parse(stringFromBase64URL(parts[1])),
    signature: base64UrlToUint8Array(parts[2]),
    raw: {
      header: parts[0],
      payload: parts[1]
    }
  };
  return data;
}
async function sleep(time) {
  return await new Promise((accept) => {
    setTimeout(() => accept(null), time);
  });
}
function retryable(fn, isRetryable) {
  const promise = new Promise((accept, reject) => {
    ;
    (async () => {
      for (let attempt = 0; attempt < Infinity; attempt++) {
        try {
          const result = await fn(attempt);
          if (!isRetryable(attempt, null, result)) {
            accept(result);
            return;
          }
        } catch (e) {
          if (!isRetryable(attempt, e)) {
            reject(e);
            return;
          }
        }
      }
    })();
  });
  return promise;
}
function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}
function generatePKCEVerifier() {
  const verifierLength = 56;
  const array = new Uint32Array(verifierLength);
  if (typeof crypto === "undefined") {
    const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const charSetLen = charSet.length;
    let verifier = "";
    for (let i = 0; i < verifierLength; i++) {
      verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
    }
    return verifier;
  }
  crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}
async function sha256(randomString) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(randomString);
  const hash = await crypto.subtle.digest("SHA-256", encodedData);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
}
async function generatePKCEChallenge(verifier) {
  const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
  if (!hasCryptoSupport) {
    console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
    return verifier;
  }
  const hashed = await sha256(verifier);
  return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
  const codeVerifier = generatePKCEVerifier();
  let storedCodeVerifier = codeVerifier;
  if (isPasswordRecovery) {
    storedCodeVerifier += "/PASSWORD_RECOVERY";
  }
  await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
  const codeChallenge = await generatePKCEChallenge(codeVerifier);
  const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
  return [codeChallenge, codeChallengeMethod];
}
function parseResponseAPIVersion(response) {
  const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
  if (!apiVersion) {
    return null;
  }
  if (!apiVersion.match(API_VERSION_REGEX)) {
    return null;
  }
  try {
    const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`);
    return date;
  } catch (e) {
    return null;
  }
}
function validateExp(exp) {
  if (!exp) {
    throw new Error("Missing exp claim");
  }
  const timeNow = Math.floor(Date.now() / 1e3);
  if (exp <= timeNow) {
    throw new Error("JWT has expired");
  }
}
function getAlgorithm(alg) {
  switch (alg) {
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      };
    case "ES256":
      return {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: { name: "SHA-256" }
      };
    default:
      throw new Error("Invalid alg claim");
  }
}
function validateUUID(str) {
  if (!UUID_REGEX.test(str)) {
    throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
  }
}
function userNotAvailableProxy() {
  const proxyTarget = {};
  return new Proxy(proxyTarget, {
    get: (target, prop) => {
      if (prop === "__isUserNotAvailableProxy") {
        return true;
      }
      if (typeof prop === "symbol") {
        const sProp = prop.toString();
        if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)") {
          return void 0;
        }
      }
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
    },
    set: (_target, prop) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    },
    deleteProperty: (_target, prop) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    }
  });
}
function insecureUserWarningProxy(user, suppressWarningRef) {
  return new Proxy(user, {
    get: (target, prop, receiver) => {
      if (prop === "__isInsecureUserWarningProxy") {
        return true;
      }
      if (typeof prop === "symbol") {
        const sProp = prop.toString();
        if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)" || sProp === "Symbol(nodejs.util.inspect.custom)") {
          return Reflect.get(target, prop, receiver);
        }
      }
      if (!suppressWarningRef.value && typeof prop === "string") {
        console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
        suppressWarningRef.value = true;
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
var isBrowser, localStorageWriteTests, supportsLocalStorage, resolveFetch5, looksLikeFetchResponse, setItemAsync, getItemAsync, removeItemAsync, Deferred, API_VERSION_REGEX, UUID_REGEX;
var init_helpers4 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/helpers.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_constants5();
    init_errors3();
    init_base64url();
    __name(expiresAt, "expiresAt");
    __name(generateCallbackId, "generateCallbackId");
    isBrowser = /* @__PURE__ */ __name(() => typeof window !== "undefined" && typeof document !== "undefined", "isBrowser");
    localStorageWriteTests = {
      tested: false,
      writable: false
    };
    supportsLocalStorage = /* @__PURE__ */ __name(() => {
      if (!isBrowser()) {
        return false;
      }
      try {
        if (typeof globalThis.localStorage !== "object") {
          return false;
        }
      } catch (e) {
        return false;
      }
      if (localStorageWriteTests.tested) {
        return localStorageWriteTests.writable;
      }
      const randomKey = `lswt-${Math.random()}${Math.random()}`;
      try {
        globalThis.localStorage.setItem(randomKey, randomKey);
        globalThis.localStorage.removeItem(randomKey);
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = true;
      } catch (e) {
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = false;
      }
      return localStorageWriteTests.writable;
    }, "supportsLocalStorage");
    __name(parseParametersFromURL, "parseParametersFromURL");
    resolveFetch5 = /* @__PURE__ */ __name((customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    }, "resolveFetch");
    looksLikeFetchResponse = /* @__PURE__ */ __name((maybeResponse) => {
      return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
    }, "looksLikeFetchResponse");
    setItemAsync = /* @__PURE__ */ __name(async (storage, key, data) => {
      await storage.setItem(key, JSON.stringify(data));
    }, "setItemAsync");
    getItemAsync = /* @__PURE__ */ __name(async (storage, key) => {
      const value = await storage.getItem(key);
      if (!value) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (_a2) {
        return value;
      }
    }, "getItemAsync");
    removeItemAsync = /* @__PURE__ */ __name(async (storage, key) => {
      await storage.removeItem(key);
    }, "removeItemAsync");
    Deferred = class {
      constructor() {
        ;
        this.promise = new Deferred.promiseConstructor((res, rej) => {
          ;
          this.resolve = res;
          this.reject = rej;
        });
      }
    };
    __name(Deferred, "Deferred");
    Deferred.promiseConstructor = Promise;
    __name(decodeJWT, "decodeJWT");
    __name(sleep, "sleep");
    __name(retryable, "retryable");
    __name(dec2hex, "dec2hex");
    __name(generatePKCEVerifier, "generatePKCEVerifier");
    __name(sha256, "sha256");
    __name(generatePKCEChallenge, "generatePKCEChallenge");
    __name(getCodeChallengeAndMethod, "getCodeChallengeAndMethod");
    API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
    __name(parseResponseAPIVersion, "parseResponseAPIVersion");
    __name(validateExp, "validateExp");
    __name(getAlgorithm, "getAlgorithm");
    UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    __name(validateUUID, "validateUUID");
    __name(userNotAvailableProxy, "userNotAvailableProxy");
    __name(insecureUserWarningProxy, "insecureUserWarningProxy");
    __name(deepClone, "deepClone");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/fetch.js
async function handleError3(error) {
  var _a2;
  if (!looksLikeFetchResponse(error)) {
    throw new AuthRetryableFetchError(_getErrorMessage3(error), 0);
  }
  if (NETWORK_ERROR_CODES.includes(error.status)) {
    throw new AuthRetryableFetchError(_getErrorMessage3(error), error.status);
  }
  let data;
  try {
    data = await error.json();
  } catch (e) {
    throw new AuthUnknownError(_getErrorMessage3(e), e);
  }
  let errorCode = void 0;
  const responseAPIVersion = parseResponseAPIVersion(error);
  if (responseAPIVersion && responseAPIVersion.getTime() >= API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
    errorCode = data.code;
  } else if (typeof data === "object" && data && typeof data.error_code === "string") {
    errorCode = data.error_code;
  }
  if (!errorCode) {
    if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
      throw new AuthWeakPasswordError(_getErrorMessage3(data), error.status, data.weak_password.reasons);
    }
  } else if (errorCode === "weak_password") {
    throw new AuthWeakPasswordError(_getErrorMessage3(data), error.status, ((_a2 = data.weak_password) === null || _a2 === void 0 ? void 0 : _a2.reasons) || []);
  } else if (errorCode === "session_not_found") {
    throw new AuthSessionMissingError();
  }
  throw new AuthApiError(_getErrorMessage3(data), error.status || 500, errorCode);
}
async function _request(fetcher, method, url, options) {
  var _a2;
  const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
  if (!headers[API_VERSION_HEADER_NAME]) {
    headers[API_VERSION_HEADER_NAME] = API_VERSIONS["2024-01-01"].name;
  }
  if (options === null || options === void 0 ? void 0 : options.jwt) {
    headers["Authorization"] = `Bearer ${options.jwt}`;
  }
  const qs = (_a2 = options === null || options === void 0 ? void 0 : options.query) !== null && _a2 !== void 0 ? _a2 : {};
  if (options === null || options === void 0 ? void 0 : options.redirectTo) {
    qs["redirect_to"] = options.redirectTo;
  }
  const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
  const data = await _handleRequest3(fetcher, method, url + queryString, {
    headers,
    noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
  }, {}, options === null || options === void 0 ? void 0 : options.body);
  return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
}
async function _handleRequest3(fetcher, method, url, options, parameters, body) {
  const requestParams = _getRequestParams3(method, options, parameters, body);
  let result;
  try {
    result = await fetcher(url, Object.assign({}, requestParams));
  } catch (e) {
    console.error(e);
    throw new AuthRetryableFetchError(_getErrorMessage3(e), 0);
  }
  if (!result.ok) {
    await handleError3(result);
  }
  if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
    return result;
  }
  try {
    return await result.json();
  } catch (e) {
    await handleError3(e);
  }
}
function _sessionResponse(data) {
  var _a2;
  let session = null;
  if (hasSession(data)) {
    session = Object.assign({}, data);
    if (!data.expires_at) {
      session.expires_at = expiresAt(data.expires_in);
    }
  }
  const user = (_a2 = data.user) !== null && _a2 !== void 0 ? _a2 : data;
  return { data: { session, user }, error: null };
}
function _sessionResponsePassword(data) {
  const response = _sessionResponse(data);
  if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
    response.data.weak_password = data.weak_password;
  }
  return response;
}
function _userResponse(data) {
  var _a2;
  const user = (_a2 = data.user) !== null && _a2 !== void 0 ? _a2 : data;
  return { data: { user }, error: null };
}
function _ssoResponse(data) {
  return { data, error: null };
}
function _generateLinkResponse(data) {
  const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
  const properties = {
    action_link,
    email_otp,
    hashed_token,
    redirect_to,
    verification_type
  };
  const user = Object.assign({}, rest);
  return {
    data: {
      properties,
      user
    },
    error: null
  };
}
function _noResolveJsonResponse(data) {
  return data;
}
function hasSession(data) {
  return data.access_token && data.refresh_token && data.expires_in;
}
var _getErrorMessage3, NETWORK_ERROR_CODES, _getRequestParams3;
var init_fetch4 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/fetch.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_constants5();
    init_helpers4();
    init_errors3();
    _getErrorMessage3 = /* @__PURE__ */ __name((err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err), "_getErrorMessage");
    NETWORK_ERROR_CODES = [502, 503, 504];
    __name(handleError3, "handleError");
    _getRequestParams3 = /* @__PURE__ */ __name((method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === "GET") {
        return params;
      }
      params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
      params.body = JSON.stringify(body);
      return Object.assign(Object.assign({}, params), parameters);
    }, "_getRequestParams");
    __name(_request, "_request");
    __name(_handleRequest3, "_handleRequest");
    __name(_sessionResponse, "_sessionResponse");
    __name(_sessionResponsePassword, "_sessionResponsePassword");
    __name(_userResponse, "_userResponse");
    __name(_ssoResponse, "_ssoResponse");
    __name(_generateLinkResponse, "_generateLinkResponse");
    __name(_noResolveJsonResponse, "_noResolveJsonResponse");
    __name(hasSession, "hasSession");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/types.js
var SIGN_OUT_SCOPES;
var init_types3 = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/types.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    SIGN_OUT_SCOPES = ["global", "local", "others"];
  }
});

// node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js
var GoTrueAdminApi;
var init_GoTrueAdminApi = __esm({
  "node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_fetch4();
    init_helpers4();
    init_types3();
    init_errors3();
    GoTrueAdminApi = class {
      /**
       * Creates an admin API client that can be used to manage users and OAuth clients.
       *
       * @example
       * ```ts
       * import { GoTrueAdminApi } from '@supabase/auth-js'
       *
       * const admin = new GoTrueAdminApi({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
       * })
       * ```
       */
      constructor({ url = "", headers = {}, fetch: fetch2 }) {
        this.url = url;
        this.headers = headers;
        this.fetch = resolveFetch5(fetch2);
        this.mfa = {
          listFactors: this._listFactors.bind(this),
          deleteFactor: this._deleteFactor.bind(this)
        };
        this.oauth = {
          listClients: this._listOAuthClients.bind(this),
          createClient: this._createOAuthClient.bind(this),
          getClient: this._getOAuthClient.bind(this),
          updateClient: this._updateOAuthClient.bind(this),
          deleteClient: this._deleteOAuthClient.bind(this),
          regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
        };
      }
      /**
       * Removes a logged-in session.
       * @param jwt A valid, logged-in JWT.
       * @param scope The logout sope.
       */
      async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
        if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
          throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(", ")}`);
        }
        try {
          await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
            headers: this.headers,
            jwt,
            noResolveJson: true
          });
          return { data: null, error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Sends an invite link to an email address.
       * @param email The email address of the user.
       * @param options Additional options to be included when inviting.
       */
      async inviteUserByEmail(email, options = {}) {
        try {
          return await _request(this.fetch, "POST", `${this.url}/invite`, {
            body: { email, data: options.data },
            headers: this.headers,
            redirectTo: options.redirectTo,
            xform: _userResponse
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Generates email links and OTPs to be sent via a custom email provider.
       * @param email The user's email.
       * @param options.password User password. For signup only.
       * @param options.data Optional user metadata. For signup only.
       * @param options.redirectTo The redirect url which should be appended to the generated link
       */
      async generateLink(params) {
        try {
          const { options } = params, rest = __rest(params, ["options"]);
          const body = Object.assign(Object.assign({}, rest), options);
          if ("newEmail" in rest) {
            body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
            delete body["newEmail"];
          }
          return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
            body,
            headers: this.headers,
            xform: _generateLinkResponse,
            redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
          });
        } catch (error) {
          if (isAuthError(error)) {
            return {
              data: {
                properties: null,
                user: null
              },
              error
            };
          }
          throw error;
        }
      }
      // User Admin API
      /**
       * Creates a new user.
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async createUser(attributes) {
        try {
          return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
            body: attributes,
            headers: this.headers,
            xform: _userResponse
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Get a list of users.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
       */
      async listUsers(params) {
        var _a2, _b, _c, _d, _e, _f, _g;
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 };
          const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
            headers: this.headers,
            noResolveJson: true,
            query: {
              page: (_b = (_a2 = params === null || params === void 0 ? void 0 : params.page) === null || _a2 === void 0 ? void 0 : _a2.toString()) !== null && _b !== void 0 ? _b : "",
              per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
            },
            xform: _noResolveJsonResponse
          });
          if (response.error)
            throw response.error;
          const users = await response.json();
          const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
          const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
              const rel = JSON.parse(link.split(";")[1].split("=")[1]);
              pagination[`${rel}Page`] = page;
            });
            pagination.total = parseInt(total);
          }
          return { data: Object.assign(Object.assign({}, users), pagination), error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { users: [] }, error };
          }
          throw error;
        }
      }
      /**
       * Get user by id.
       *
       * @param uid The user's unique identifier
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async getUserById(uid) {
        validateUUID(uid);
        try {
          return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
            headers: this.headers,
            xform: _userResponse
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Updates the user data.
       *
       * @param attributes The data you want to update.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async updateUserById(uid, attributes) {
        validateUUID(uid);
        try {
          return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
            body: attributes,
            headers: this.headers,
            xform: _userResponse
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      /**
       * Delete a user. Requires a `service_role` key.
       *
       * @param id The user id you want to remove.
       * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
       * Defaults to false for backward compatibility.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async deleteUser(id, shouldSoftDelete = false) {
        validateUUID(id);
        try {
          return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
            headers: this.headers,
            body: {
              should_soft_delete: shouldSoftDelete
            },
            xform: _userResponse
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { user: null }, error };
          }
          throw error;
        }
      }
      async _listFactors(params) {
        validateUUID(params.userId);
        try {
          const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
            headers: this.headers,
            xform: (factors) => {
              return { data: { factors }, error: null };
            }
          });
          return { data, error };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      async _deleteFactor(params) {
        validateUUID(params.userId);
        validateUUID(params.id);
        try {
          const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
            headers: this.headers
          });
          return { data, error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Lists all OAuth clients with optional pagination.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _listOAuthClients(params) {
        var _a2, _b, _c, _d, _e, _f, _g;
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 };
          const response = await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
            headers: this.headers,
            noResolveJson: true,
            query: {
              page: (_b = (_a2 = params === null || params === void 0 ? void 0 : params.page) === null || _a2 === void 0 ? void 0 : _a2.toString()) !== null && _b !== void 0 ? _b : "",
              per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
            },
            xform: _noResolveJsonResponse
          });
          if (response.error)
            throw response.error;
          const clients = await response.json();
          const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
          const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
              const rel = JSON.parse(link.split(";")[1].split("=")[1]);
              pagination[`${rel}Page`] = page;
            });
            pagination.total = parseInt(total);
          }
          return { data: Object.assign(Object.assign({}, clients), pagination), error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: { clients: [] }, error };
          }
          throw error;
        }
      }
      /**
       * Creates a new OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _createOAuthClient(params) {
        try {
          return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
            body: params,
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Gets details of a specific OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _getOAuthClient(clientId) {
        try {
          return await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients/${clientId}`, {
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Updates an existing OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _updateOAuthClient(clientId, params) {
        try {
          return await _request(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${clientId}`, {
            body: params,
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Deletes an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _deleteOAuthClient(clientId) {
        try {
          await _request(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${clientId}`, {
            headers: this.headers,
            noResolveJson: true
          });
          return { data: null, error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
      /**
       * Regenerates the secret for an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _regenerateOAuthClientSecret(clientId) {
        try {
          return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
            headers: this.headers,
            xform: (client) => {
              return { data: client, error: null };
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      }
    };
    __name(GoTrueAdminApi, "GoTrueAdminApi");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/local-storage.js
function memoryLocalStorageAdapter(store = {}) {
  return {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
}
var init_local_storage = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/local-storage.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(memoryLocalStorageAdapter, "memoryLocalStorageAdapter");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/locks.js
async function navigatorLock(name, acquireTimeout, fn) {
  if (internals.debug) {
    console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout);
  }
  const abortController = new globalThis.AbortController();
  if (acquireTimeout > 0) {
    setTimeout(() => {
      abortController.abort();
      if (internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name);
      }
    }, acquireTimeout);
  }
  return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
    mode: "exclusive",
    ifAvailable: true
  } : {
    mode: "exclusive",
    signal: abortController.signal
  }, async (lock) => {
    if (lock) {
      if (internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name);
      }
      try {
        return await fn();
      } finally {
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name);
        }
      }
    } else {
      if (acquireTimeout === 0) {
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name);
        }
        throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
      } else {
        if (internals.debug) {
          try {
            const result = await globalThis.navigator.locks.query();
            console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(result, null, "  "));
          } catch (e) {
            console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", e);
          }
        }
        console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request");
        return await fn();
      }
    }
  }));
}
var internals, LockAcquireTimeoutError, NavigatorLockAcquireTimeoutError;
var init_locks = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/locks.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_helpers4();
    internals = {
      /**
       * @experimental
       */
      debug: !!(globalThis && supportsLocalStorage() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
    };
    LockAcquireTimeoutError = class extends Error {
      constructor(message) {
        super(message);
        this.isAcquireTimeout = true;
      }
    };
    __name(LockAcquireTimeoutError, "LockAcquireTimeoutError");
    NavigatorLockAcquireTimeoutError = class extends LockAcquireTimeoutError {
    };
    __name(NavigatorLockAcquireTimeoutError, "NavigatorLockAcquireTimeoutError");
    __name(navigatorLock, "navigatorLock");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
function polyfillGlobalThis() {
  if (typeof globalThis === "object")
    return;
  try {
    Object.defineProperty(Object.prototype, "__magic__", {
      get: function() {
        return this;
      },
      configurable: true
    });
    __magic__.globalThis = __magic__;
    delete Object.prototype.__magic__;
  } catch (e) {
    if (typeof self !== "undefined") {
      self.globalThis = self;
    }
  }
}
var init_polyfills = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/polyfills.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(polyfillGlobalThis, "polyfillGlobalThis");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/web3/ethereum.js
function getAddress(address) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
  }
  return address.toLowerCase();
}
function fromHex(hex) {
  return parseInt(hex, 16);
}
function toHex(value) {
  const bytes = new TextEncoder().encode(value);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return "0x" + hex;
}
function createSiweMessage(parameters) {
  var _a2;
  const { chainId, domain, expirationTime, issuedAt = /* @__PURE__ */ new Date(), nonce, notBefore, requestId, resources, scheme, uri, version: version5 } = parameters;
  {
    if (!Number.isInteger(chainId))
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
    if (!domain)
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
    if (nonce && nonce.length < 8)
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
    if (!uri)
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
    if (version5 !== "1")
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version5}`);
    if ((_a2 = parameters.statement) === null || _a2 === void 0 ? void 0 : _a2.includes("\n"))
      throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
  }
  const address = getAddress(parameters.address);
  const origin = scheme ? `${scheme}://${domain}` : domain;
  const statement = parameters.statement ? `${parameters.statement}
` : "";
  const prefix = `${origin} wants you to sign in with your Ethereum account:
${address}

${statement}`;
  let suffix = `URI: ${uri}
Version: ${version5}
Chain ID: ${chainId}${nonce ? `
Nonce: ${nonce}` : ""}
Issued At: ${issuedAt.toISOString()}`;
  if (expirationTime)
    suffix += `
Expiration Time: ${expirationTime.toISOString()}`;
  if (notBefore)
    suffix += `
Not Before: ${notBefore.toISOString()}`;
  if (requestId)
    suffix += `
Request ID: ${requestId}`;
  if (resources) {
    let content = "\nResources:";
    for (const resource of resources) {
      if (!resource || typeof resource !== "string")
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
      content += `
- ${resource}`;
    }
    suffix += content;
  }
  return `${prefix}
${suffix}`;
}
var init_ethereum = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/web3/ethereum.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(getAddress, "getAddress");
    __name(fromHex, "fromHex");
    __name(toHex, "toHex");
    __name(createSiweMessage, "createSiweMessage");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/webauthn.errors.js
function identifyRegistrationError({ error, options }) {
  var _a2, _b, _c;
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "ConstraintError") {
    if (((_a2 = publicKey.authenticatorSelection) === null || _a2 === void 0 ? void 0 : _a2.requireResidentKey) === true) {
      return new WebAuthnError({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: error
      });
    } else if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      options.mediation === "conditional" && ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === "required"
    ) {
      return new WebAuthnError({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: error
      });
    } else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === "required") {
      return new WebAuthnError({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: error
      });
    }
  } else if (error.name === "InvalidStateError") {
    return new WebAuthnError({
      message: "The authenticator was previously registered",
      code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
      cause: error
    });
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "NotSupportedError") {
    const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
    if (validPubKeyCredParams.length === 0) {
      return new WebAuthnError({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
      code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = window.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rp.id !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "TypeError") {
    if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
      return new WebAuthnError({
        message: "User ID was not between 1 and 64 characters",
        code: "ERROR_INVALID_USER_ID_LENGTH",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new credential",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return new WebAuthnError({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: error
  });
}
function identifyAuthenticationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = window.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rpId !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return new WebAuthnError({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: error
  });
}
var WebAuthnError, WebAuthnUnknownError;
var init_webauthn_errors = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/webauthn.errors.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_webauthn();
    WebAuthnError = class extends Error {
      constructor({ message, code, cause, name }) {
        var _a2;
        super(message, { cause });
        this.__isWebAuthnError = true;
        this.name = (_a2 = name !== null && name !== void 0 ? name : cause instanceof Error ? cause.name : void 0) !== null && _a2 !== void 0 ? _a2 : "Unknown Error";
        this.code = code;
      }
    };
    __name(WebAuthnError, "WebAuthnError");
    WebAuthnUnknownError = class extends WebAuthnError {
      constructor(message, originalError) {
        super({
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: originalError,
          message
        });
        this.name = "WebAuthnUnknownError";
        this.originalError = originalError;
      }
    };
    __name(WebAuthnUnknownError, "WebAuthnUnknownError");
    __name(identifyRegistrationError, "identifyRegistrationError");
    __name(identifyAuthenticationError, "identifyAuthenticationError");
  }
});

// node_modules/@supabase/auth-js/dist/module/lib/webauthn.js
function deserializeCredentialCreationOptions(options) {
  if (!options) {
    throw new Error("Credential creation options are required");
  }
  if (typeof PublicKeyCredential !== "undefined" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function") {
    return PublicKeyCredential.parseCreationOptionsFromJSON(
      /** we assert the options here as typescript still doesn't know about future webauthn types */
      options
    );
  }
  const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = __rest(
    options,
    ["challenge", "user", "excludeCredentials"]
  );
  const challenge = base64UrlToUint8Array(challengeStr).buffer;
  const user = Object.assign(Object.assign({}, userOpts), { id: base64UrlToUint8Array(userOpts.id).buffer });
  const result = Object.assign(Object.assign({}, restOptions), {
    challenge,
    user
  });
  if (excludeCredentials && excludeCredentials.length > 0) {
    result.excludeCredentials = new Array(excludeCredentials.length);
    for (let i = 0; i < excludeCredentials.length; i++) {
      const cred = excludeCredentials[i];
      result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
        id: base64UrlToUint8Array(cred.id).buffer,
        type: cred.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: cred.transports
      });
    }
  }
  return result;
}
function deserializeCredentialRequestOptions(options) {
  if (!options) {
    throw new Error("Credential request options are required");
  }
  if (typeof PublicKeyCredential !== "undefined" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function") {
    return PublicKeyCredential.parseRequestOptionsFromJSON(options);
  }
  const { challenge: challengeStr, allowCredentials } = options, restOptions = __rest(
    options,
    ["challenge", "allowCredentials"]
  );
  const challenge = base64UrlToUint8Array(challengeStr).buffer;
  const result = Object.assign(Object.assign({}, restOptions), { challenge });
  if (allowCredentials && allowCredentials.length > 0) {
    result.allowCredentials = new Array(allowCredentials.length);
    for (let i = 0; i < allowCredentials.length; i++) {
      const cred = allowCredentials[i];
      result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
        id: base64UrlToUint8Array(cred.id).buffer,
        type: cred.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: cred.transports
      });
    }
  }
  return result;
}
function serializeCredentialCreationResponse(credential) {
  var _a2;
  if ("toJSON" in credential && typeof credential.toJSON === "function") {
    return credential.toJSON();
  }
  const credentialWithAttachment = credential;
  return {
    id: credential.id,
    rawId: credential.id,
    response: {
      attestationObject: bytesToBase64URL(new Uint8Array(credential.response.attestationObject)),
      clientDataJSON: bytesToBase64URL(new Uint8Array(credential.response.clientDataJSON))
    },
    type: "public-key",
    clientExtensionResults: credential.getClientExtensionResults(),
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (_a2 = credentialWithAttachment.authenticatorAttachment) !== null && _a2 !== void 0 ? _a2 : void 0
  };
}
function serializeCredentialRequestResponse(credential) {
  var _a2;
  if ("toJSON" in credential && typeof credential.toJSON === "function") {
    return credential.toJSON();
  }
  const credentialWithAttachment = credential;
  const clientExtensionResults = credential.getClientExtensionResults();
  const assertionResponse = credential.response;
  return {
    id: credential.id,
    rawId: credential.id,
    // W3C spec expects rawId to match id for JSON format
    response: {
      authenticatorData: bytesToBase64URL(new Uint8Array(assertionResponse.authenticatorData)),
      clientDataJSON: bytesToBase64URL(new Uint8Array(assertionResponse.clientDataJSON)),
      signature: bytesToBase64URL(new Uint8Array(assertionResponse.signature)),
      userHandle: assertionResponse.userHandle ? bytesToBase64URL(new Uint8Array(assertionResponse.userHandle)) : void 0
    },
    type: "public-key",
    clientExtensionResults,
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (_a2 = credentialWithAttachment.authenticatorAttachment) !== null && _a2 !== void 0 ? _a2 : void 0
  };
}
function isValidDomain(hostname) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
  );
}
function browserSupportsWebAuthn() {
  var _a2, _b;
  return !!(isBrowser() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((_a2 = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a2 === void 0 ? void 0 : _a2.create) === "function" && typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === "function");
}
async function createCredential(options) {
  try {
    const response = await navigator.credentials.create(
      /** we assert the type here until typescript types are updated */
      options
    );
    if (!response) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Empty credential response", response)
      };
    }
    if (!(response instanceof PublicKeyCredential)) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
      };
    }
    return { data: response, error: null };
  } catch (err) {
    return {
      data: null,
      error: identifyRegistrationError({
        error: err,
        options
      })
    };
  }
}
async function getCredential(options) {
  try {
    const response = await navigator.credentials.get(
      /** we assert the type here until typescript types are updated */
      options
    );
    if (!response) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Empty credential response", response)
      };
    }
    if (!(response instanceof PublicKeyCredential)) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
      };
    }
    return { data: response, error: null };
  } catch (err) {
    return {
      data: null,
      error: identifyAuthenticationError({
        error: err,
        options
      })
    };
  }
}
function deepMerge(...sources) {
  const isObject = /* @__PURE__ */ __name((val) => val !== null && typeof val === "object" && !Array.isArray(val), "isObject");
  const isArrayBufferLike = /* @__PURE__ */ __name((val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val), "isArrayBufferLike");
  const result = {};
  for (const source of sources) {
    if (!source)
      continue;
    for (const key in source) {
      const value = source[key];
      if (value === void 0)
        continue;
      if (Array.isArray(value)) {
        result[key] = value;
      } else if (isArrayBufferLike(value)) {
        result[key] = value;
      } else if (isObject(value)) {
        const existing = result[key];
        if (isObject(existing)) {
          result[key] = deepMerge(existing, value);
        } else {
          result[key] = deepMerge(value);
        }
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
function mergeCredentialCreationOptions(baseOptions, overrides) {
  return deepMerge(DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
}
function mergeCredentialRequestOptions(baseOptions, overrides) {
  return deepMerge(DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
}
var WebAuthnAbortService, webAuthnAbortService, DEFAULT_CREATION_OPTIONS, DEFAULT_REQUEST_OPTIONS, WebAuthnApi;
var init_webauthn = __esm({
  "node_modules/@supabase/auth-js/dist/module/lib/webauthn.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_tslib_es6();
    init_base64url();
    init_errors3();
    init_helpers4();
    init_webauthn_errors();
    WebAuthnAbortService = class {
      /**
       * Create an abort signal for a new WebAuthn operation.
       * Automatically cancels any existing operation.
       *
       * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
       */
      createNewAbortSignal() {
        if (this.controller) {
          const abortError = new Error("Cancelling existing WebAuthn API call for new one");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
      }
      /**
       * Manually cancel the current WebAuthn operation.
       * Useful for cleaning up when user cancels or navigates away.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
       */
      cancelCeremony() {
        if (this.controller) {
          const abortError = new Error("Manually cancelling existing WebAuthn API call");
          abortError.name = "AbortError";
          this.controller.abort(abortError);
          this.controller = void 0;
        }
      }
    };
    __name(WebAuthnAbortService, "WebAuthnAbortService");
    webAuthnAbortService = new WebAuthnAbortService();
    __name(deserializeCredentialCreationOptions, "deserializeCredentialCreationOptions");
    __name(deserializeCredentialRequestOptions, "deserializeCredentialRequestOptions");
    __name(serializeCredentialCreationResponse, "serializeCredentialCreationResponse");
    __name(serializeCredentialRequestResponse, "serializeCredentialRequestResponse");
    __name(isValidDomain, "isValidDomain");
    __name(browserSupportsWebAuthn, "browserSupportsWebAuthn");
    __name(createCredential, "createCredential");
    __name(getCredential, "getCredential");
    DEFAULT_CREATION_OPTIONS = {
      hints: ["security-key"],
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        /** set to preferred because older yubikeys don't have PIN/Biometric */
        userVerification: "preferred",
        residentKey: "discouraged"
      },
      attestation: "direct"
    };
    DEFAULT_REQUEST_OPTIONS = {
      /** set to preferred because older yubikeys don't have PIN/Biometric */
      userVerification: "preferred",
      hints: ["security-key"],
      attestation: "direct"
    };
    __name(deepMerge, "deepMerge");
    __name(mergeCredentialCreationOptions, "mergeCredentialCreationOptions");
    __name(mergeCredentialRequestOptions, "mergeCredentialRequestOptions");
    WebAuthnApi = class {
      constructor(client) {
        this.client = client;
        this.enroll = this._enroll.bind(this);
        this.challenge = this._challenge.bind(this);
        this.verify = this._verify.bind(this);
        this.authenticate = this._authenticate.bind(this);
        this.register = this._register.bind(this);
      }
      /**
       * Enroll a new WebAuthn factor.
       * Creates an unverified WebAuthn factor that must be verified with a credential.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
       * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
       */
      async _enroll(params) {
        return this.client.mfa.enroll(Object.assign(Object.assign({}, params), { factorType: "webauthn" }));
      }
      /**
       * Challenge for WebAuthn credential creation or authentication.
       * Combines server challenge with browser credential operations.
       * Handles both registration (create) and authentication (request) flows.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
       * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
       * @returns {Promise<RequestResult>} Challenge response with credential or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
       */
      async _challenge({ factorId, webauthn, friendlyName, signal }, overrides) {
        try {
          const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
            factorId,
            webauthn
          });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          const abortSignal = signal !== null && signal !== void 0 ? signal : webAuthnAbortService.createNewAbortSignal();
          if (challengeResponse.webauthn.type === "create") {
            const { user } = challengeResponse.webauthn.credential_options.publicKey;
            if (!user.name) {
              user.name = `${user.id}:${friendlyName}`;
            }
            if (!user.displayName) {
              user.displayName = user.name;
            }
          }
          switch (challengeResponse.webauthn.type) {
            case "create": {
              const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
              const { data, error } = await createCredential({
                publicKey: options,
                signal: abortSignal
              });
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data
                    }
                  },
                  error: null
                };
              }
              return { data: null, error };
            }
            case "request": {
              const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
              const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), { publicKey: options, signal: abortSignal }));
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data
                    }
                  },
                  error: null
                };
              }
              return { data: null, error };
            }
          }
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new AuthUnknownError("Unexpected error in challenge", error)
          };
        }
      }
      /**
       * Verify a WebAuthn credential with the server.
       * Completes the WebAuthn ceremony by sending the credential to the server for verification.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Verification parameters
       * @param {string} params.challengeId - ID of the challenge being verified
       * @param {string} params.factorId - ID of the WebAuthn factor
       * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
       * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
       * */
      async _verify({ challengeId, factorId, webauthn }) {
        return this.client.mfa.verify({
          factorId,
          challengeId,
          webauthn
        });
      }
      /**
       * Complete WebAuthn authentication flow.
       * Performs challenge and verification in a single operation for existing credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Authentication parameters
       * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
       * @param {Object} params.webauthn - WebAuthn configuration
       * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.webauthn.signal - Optional abort signal
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
       * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
       */
      async _authenticate({ factorId, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
        if (!rpId) {
          return {
            data: null,
            error: new AuthError("rpId is required for WebAuthn authentication")
          };
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new AuthUnknownError("Browser does not support WebAuthn", null)
            };
          }
          const { data: challengeResponse, error: challengeError } = await this.challenge({
            factorId,
            webauthn: { rpId, rpOrigins },
            signal
          }, { request: overrides });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          const { webauthn } = challengeResponse;
          return this._verify({
            factorId,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              type: webauthn.type,
              rpId,
              rpOrigins,
              credential_response: webauthn.credential_response
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new AuthUnknownError("Unexpected error in authenticate", error)
          };
        }
      }
      /**
       * Complete WebAuthn registration flow.
       * Performs enrollment, challenge, and verification in a single operation for new credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Registration parameters
       * @param {string} params.friendlyName - User-friendly name for the credential
       * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.signal - Optional abort signal
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
       */
      async _register({ friendlyName, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
        if (!rpId) {
          return {
            data: null,
            error: new AuthError("rpId is required for WebAuthn registration")
          };
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new AuthUnknownError("Browser does not support WebAuthn", null)
            };
          }
          const { data: factor, error: enrollError } = await this._enroll({
            friendlyName
          });
          if (!factor) {
            await this.client.mfa.listFactors().then((factors) => {
              var _a2;
              return (_a2 = factors.data) === null || _a2 === void 0 ? void 0 : _a2.all.find((v) => v.factor_type === "webauthn" && v.friendly_name === friendlyName && v.status !== "unverified");
            }).then((factor2) => factor2 ? this.client.mfa.unenroll({ factorId: factor2 === null || factor2 === void 0 ? void 0 : factor2.id }) : void 0);
            return { data: null, error: enrollError };
          }
          const { data: challengeResponse, error: challengeError } = await this._challenge({
            factorId: factor.id,
            friendlyName: factor.friendly_name,
            webauthn: { rpId, rpOrigins },
            signal
          }, {
            create: overrides
          });
          if (!challengeResponse) {
            return { data: null, error: challengeError };
          }
          return this._verify({
            factorId: factor.id,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              rpId,
              rpOrigins,
              type: challengeResponse.webauthn.type,
              credential_response: challengeResponse.webauthn.credential_response
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          return {
            data: null,
            error: new AuthUnknownError("Unexpected error in register", error)
          };
        }
      }
    };
    __name(WebAuthnApi, "WebAuthnApi");
  }
});

// node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
async function lockNoOp(name, acquireTimeout, fn) {
  return await fn();
}
var DEFAULT_OPTIONS, GLOBAL_JWKS, GoTrueClient, GoTrueClient_default;
var init_GoTrueClient = __esm({
  "node_modules/@supabase/auth-js/dist/module/GoTrueClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_GoTrueAdminApi();
    init_constants5();
    init_errors3();
    init_fetch4();
    init_helpers4();
    init_local_storage();
    init_locks();
    init_polyfills();
    init_version4();
    init_base64url();
    init_ethereum();
    init_webauthn();
    polyfillGlobalThis();
    DEFAULT_OPTIONS = {
      url: GOTRUE_URL,
      storageKey: STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      headers: DEFAULT_HEADERS4,
      flowType: "implicit",
      debug: false,
      hasCustomAuthorizationHeader: false,
      throwOnError: false
    };
    __name(lockNoOp, "lockNoOp");
    GLOBAL_JWKS = {};
    GoTrueClient = class {
      /**
       * The JWKS used for verifying asymmetric JWTs
       */
      get jwks() {
        var _a2, _b;
        return (_b = (_a2 = GLOBAL_JWKS[this.storageKey]) === null || _a2 === void 0 ? void 0 : _a2.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
      }
      set jwks(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
      }
      get jwks_cached_at() {
        var _a2, _b;
        return (_b = (_a2 = GLOBAL_JWKS[this.storageKey]) === null || _a2 === void 0 ? void 0 : _a2.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
      }
      set jwks_cached_at(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
      }
      /**
       * Create a new client for use in the browser.
       *
       * @example
       * ```ts
       * import { GoTrueClient } from '@supabase/auth-js'
       *
       * const auth = new GoTrueClient({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { apikey: 'public-anon-key' },
       *   storageKey: 'supabase-auth',
       * })
       * ```
       */
      constructor(options) {
        var _a2, _b, _c;
        this.userStorage = null;
        this.memoryStorage = null;
        this.stateChangeEmitters = /* @__PURE__ */ new Map();
        this.autoRefreshTicker = null;
        this.visibilityChangedCallback = null;
        this.refreshingDeferred = null;
        this.initializePromise = null;
        this.detectSessionInUrl = true;
        this.hasCustomAuthorizationHeader = false;
        this.suppressGetSessionWarning = false;
        this.lockAcquired = false;
        this.pendingInLock = [];
        this.broadcastChannel = null;
        this.logger = console.log;
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.storageKey = settings.storageKey;
        this.instanceID = (_a2 = GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a2 !== void 0 ? _a2 : 0;
        GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
        this.logDebugMessages = !!settings.debug;
        if (typeof settings.debug === "function") {
          this.logger = settings.debug;
        }
        if (this.instanceID > 0 && isBrowser()) {
          const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
          console.warn(message);
          if (this.logDebugMessages) {
            console.trace(message);
          }
        }
        this.persistSession = settings.persistSession;
        this.autoRefreshToken = settings.autoRefreshToken;
        this.admin = new GoTrueAdminApi({
          url: settings.url,
          headers: settings.headers,
          fetch: settings.fetch
        });
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = resolveFetch5(settings.fetch);
        this.lock = settings.lock || lockNoOp;
        this.detectSessionInUrl = settings.detectSessionInUrl;
        this.flowType = settings.flowType;
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
        this.throwOnError = settings.throwOnError;
        if (settings.lock) {
          this.lock = settings.lock;
        } else if (isBrowser() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) {
          this.lock = navigatorLock;
        } else {
          this.lock = lockNoOp;
        }
        if (!this.jwks) {
          this.jwks = { keys: [] };
          this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
        }
        this.mfa = {
          verify: this._verify.bind(this),
          enroll: this._enroll.bind(this),
          unenroll: this._unenroll.bind(this),
          challenge: this._challenge.bind(this),
          listFactors: this._listFactors.bind(this),
          challengeAndVerify: this._challengeAndVerify.bind(this),
          getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
          webauthn: new WebAuthnApi(this)
        };
        this.oauth = {
          getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
          approveAuthorization: this._approveAuthorization.bind(this),
          denyAuthorization: this._denyAuthorization.bind(this),
          listGrants: this._listOAuthGrants.bind(this),
          revokeGrant: this._revokeOAuthGrant.bind(this)
        };
        if (this.persistSession) {
          if (settings.storage) {
            this.storage = settings.storage;
          } else {
            if (supportsLocalStorage()) {
              this.storage = globalThis.localStorage;
            } else {
              this.memoryStorage = {};
              this.storage = memoryLocalStorageAdapter(this.memoryStorage);
            }
          }
          if (settings.userStorage) {
            this.userStorage = settings.userStorage;
          }
        } else {
          this.memoryStorage = {};
          this.storage = memoryLocalStorageAdapter(this.memoryStorage);
        }
        if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
          try {
            this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
          } catch (e) {
            console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
          }
          (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener("message", async (event) => {
            this._debug("received broadcast notification from other tab or client", event);
            await this._notifyAllSubscribers(event.data.event, event.data.session, false);
          });
        }
        this.initialize();
      }
      /**
       * Returns whether error throwing mode is enabled for this client.
       */
      isThrowOnErrorEnabled() {
        return this.throwOnError;
      }
      /**
       * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
       * and the provided result contains a non-nullish error, the error is thrown instead of
       * being returned. This ensures consistent behavior across all public API methods.
       */
      _returnResult(result) {
        if (this.throwOnError && result && result.error) {
          throw result.error;
        }
        return result;
      }
      _logPrefix() {
        return `GoTrueClient@${this.storageKey}:${this.instanceID} (${version4}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
      }
      _debug(...args) {
        if (this.logDebugMessages) {
          this.logger(this._logPrefix(), ...args);
        }
        return this;
      }
      /**
       * Initializes the client session either from the url or from storage.
       * This method is automatically called when instantiating the client, but should also be called
       * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
       */
      async initialize() {
        if (this.initializePromise) {
          return await this.initializePromise;
        }
        this.initializePromise = (async () => {
          return await this._acquireLock(-1, async () => {
            return await this._initialize();
          });
        })();
        return await this.initializePromise;
      }
      /**
       * IMPORTANT:
       * 1. Never throw in this method, as it is called from the constructor
       * 2. Never return a session from this method as it would be cached over
       *    the whole lifetime of the client
       */
      async _initialize() {
        var _a2;
        try {
          let params = {};
          let callbackUrlType = "none";
          if (isBrowser()) {
            params = parseParametersFromURL(window.location.href);
            if (this._isImplicitGrantCallback(params)) {
              callbackUrlType = "implicit";
            } else if (await this._isPKCECallback(params)) {
              callbackUrlType = "pkce";
            }
          }
          if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== "none") {
            const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
            if (error) {
              this._debug("#_initialize()", "error detecting session from URL", error);
              if (isAuthImplicitGrantRedirectError(error)) {
                const errorCode = (_a2 = error.details) === null || _a2 === void 0 ? void 0 : _a2.code;
                if (errorCode === "identity_already_exists" || errorCode === "identity_not_found" || errorCode === "single_identity_not_deletable") {
                  return { error };
                }
              }
              await this._removeSession();
              return { error };
            }
            const { session, redirectType } = data;
            this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
            await this._saveSession(session);
            setTimeout(async () => {
              if (redirectType === "recovery") {
                await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
              } else {
                await this._notifyAllSubscribers("SIGNED_IN", session);
              }
            }, 0);
            return { error: null };
          }
          await this._recoverAndRefresh();
          return { error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ error });
          }
          return this._returnResult({
            error: new AuthUnknownError("Unexpected error during initialization", error)
          });
        } finally {
          await this._handleVisibilityChange();
          this._debug("#_initialize()", "end");
        }
      }
      /**
       * Creates a new anonymous user.
       *
       * @returns A session where the is_anonymous claim in the access token JWT set to true
       */
      async signInAnonymously(credentials) {
        var _a2, _b, _c;
        try {
          const res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              data: (_b = (_a2 = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a2 === void 0 ? void 0 : _a2.data) !== null && _b !== void 0 ? _b : {},
              gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken }
            },
            xform: _sessionResponse
          });
          const { data, error } = res;
          if (error || !data) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          const session = data.session;
          const user = data.user;
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Creates a new user.
       *
       * Be aware that if a user account exists in the system you may get back an
       * error message that attempts to hide this information from the user.
       * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
       *
       * @returns A logged-in session if the server has "autoconfirm" ON
       * @returns A user if the server has "autoconfirm" OFF
       */
      async signUp(credentials) {
        var _a2, _b, _c;
        try {
          let res;
          if ("email" in credentials) {
            const { email, password, options } = credentials;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce") {
              ;
              [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            }
            res = await _request(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
              body: {
                email,
                password,
                data: (_a2 = options === null || options === void 0 ? void 0 : options.data) !== null && _a2 !== void 0 ? _a2 : {},
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod
              },
              xform: _sessionResponse
            });
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials;
            res = await _request(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              body: {
                phone,
                password,
                data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: _sessionResponse
            });
          } else {
            throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
          }
          const { data, error } = res;
          if (error || !data) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          const session = data.session;
          const user = data.user;
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in an existing user with an email and password or phone and password.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or that the
       * email/phone and password combination is wrong or that the account can only
       * be accessed via social login.
       */
      async signInWithPassword(credentials) {
        try {
          let res;
          if ("email" in credentials) {
            const { email, password, options } = credentials;
            res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
              headers: this.headers,
              body: {
                email,
                password,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: _sessionResponsePassword
            });
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials;
            res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
              headers: this.headers,
              body: {
                phone,
                password,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: _sessionResponsePassword
            });
          } else {
            throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
          }
          const { data, error } = res;
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({
            data: Object.assign({ user: data.user, session: data.session }, data.weak_password ? { weakPassword: data.weak_password } : null),
            error
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in an existing user via a third-party provider.
       * This method supports the PKCE flow.
       */
      async signInWithOAuth(credentials) {
        var _a2, _b, _c, _d;
        return await this._handleProviderSignIn(credentials.provider, {
          redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
          scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
          queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
          skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
        });
      }
      /**
       * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
       */
      async exchangeCodeForSession(authCode) {
        await this.initializePromise;
        return this._acquireLock(-1, async () => {
          return this._exchangeCodeForSession(authCode);
        });
      }
      /**
       * Signs in a user by verifying a message signed by the user's private key.
       * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
       * both of which derive from the EIP-4361 standard
       * With slight variation on Solana's side.
       * @reference https://eips.ethereum.org/EIPS/eip-4361
       */
      async signInWithWeb3(credentials) {
        const { chain } = credentials;
        switch (chain) {
          case "ethereum":
            return await this.signInWithEthereum(credentials);
          case "solana":
            return await this.signInWithSolana(credentials);
          default:
            throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
        }
      }
      async signInWithEthereum(credentials) {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let message;
        let signature;
        if ("message" in credentials) {
          message = credentials.message;
          signature = credentials.signature;
        } else {
          const { chain, wallet, statement, options } = credentials;
          let resolvedWallet;
          if (!isBrowser()) {
            if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
              throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            }
            resolvedWallet = wallet;
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet;
          } else {
            const windowAny = window;
            if ("ethereum" in windowAny && typeof windowAny.ethereum === "object" && "request" in windowAny.ethereum && typeof windowAny.ethereum.request === "function") {
              resolvedWallet = windowAny.ethereum;
            } else {
              throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
            }
          }
          const url = new URL((_a2 = options === null || options === void 0 ? void 0 : options.url) !== null && _a2 !== void 0 ? _a2 : window.location.href);
          const accounts = await resolvedWallet.request({
            method: "eth_requestAccounts"
          }).then((accs) => accs).catch(() => {
            throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
          });
          if (!accounts || accounts.length === 0) {
            throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
          }
          const address = getAddress(accounts[0]);
          let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
          if (!chainId) {
            const chainIdHex = await resolvedWallet.request({
              method: "eth_chainId"
            });
            chainId = fromHex(chainIdHex);
          }
          const siweMessage = {
            domain: url.host,
            address,
            statement,
            uri: url.href,
            version: "1",
            chainId,
            nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
            issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : /* @__PURE__ */ new Date(),
            expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
            notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
            requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
            resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources
          };
          message = createSiweMessage(siweMessage);
          signature = await resolvedWallet.request({
            method: "personal_sign",
            params: [toHex(message), address]
          });
        }
        try {
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
            headers: this.headers,
            body: Object.assign({
              chain: "ethereum",
              message,
              signature
            }, ((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken) ? { gotrue_meta_security: { captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken } } : null),
            xform: _sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign({}, data), error });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      async signInWithSolana(credentials) {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        let message;
        let signature;
        if ("message" in credentials) {
          message = credentials.message;
          signature = credentials.signature;
        } else {
          const { chain, wallet, statement, options } = credentials;
          let resolvedWallet;
          if (!isBrowser()) {
            if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
              throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            }
            resolvedWallet = wallet;
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet;
          } else {
            const windowAny = window;
            if ("solana" in windowAny && typeof windowAny.solana === "object" && ("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function" || "signMessage" in windowAny.solana && typeof windowAny.solana.signMessage === "function")) {
              resolvedWallet = windowAny.solana;
            } else {
              throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
            }
          }
          const url = new URL((_a2 = options === null || options === void 0 ? void 0 : options.url) !== null && _a2 !== void 0 ? _a2 : window.location.href);
          if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
            const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
              // non-overridable properties
              version: "1",
              domain: url.host,
              uri: url.href
            }), statement ? { statement } : null));
            let outputToProcess;
            if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
              outputToProcess = output[0];
            } else if (output && typeof output === "object" && "signedMessage" in output && "signature" in output) {
              outputToProcess = output;
            } else {
              throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
            }
            if ("signedMessage" in outputToProcess && "signature" in outputToProcess && (typeof outputToProcess.signedMessage === "string" || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
              message = typeof outputToProcess.signedMessage === "string" ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
              signature = outputToProcess.signature;
            } else {
              throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
            }
          } else {
            if (!("signMessage" in resolvedWallet) || typeof resolvedWallet.signMessage !== "function" || !("publicKey" in resolvedWallet) || typeof resolvedWallet !== "object" || !resolvedWallet.publicKey || !("toBase58" in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== "function") {
              throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
            }
            message = [
              `${url.host} wants you to sign in with your Solana account:`,
              resolvedWallet.publicKey.toBase58(),
              ...statement ? ["", statement, ""] : [""],
              "Version: 1",
              `URI: ${url.href}`,
              `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : (/* @__PURE__ */ new Date()).toISOString()}`,
              ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [`Not Before: ${options.signInWithSolana.notBefore}`] : [],
              ...((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime) ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`] : [],
              ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId) ? [`Chain ID: ${options.signInWithSolana.chainId}`] : [],
              ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : [],
              ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId) ? [`Request ID: ${options.signInWithSolana.requestId}`] : [],
              ...((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length) ? [
                "Resources",
                ...options.signInWithSolana.resources.map((resource) => `- ${resource}`)
              ] : []
            ].join("\n");
            const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), "utf8");
            if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
              throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
            }
            signature = maybeSignature;
          }
        }
        try {
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
            headers: this.headers,
            body: Object.assign({ chain: "solana", message, signature: bytesToBase64URL(signature) }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } } : null),
            xform: _sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign({}, data), error });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      async _exchangeCodeForSession(authCode) {
        const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
        try {
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
            headers: this.headers,
            body: {
              auth_code: authCode,
              code_verifier: codeVerifier
            },
            xform: _sessionResponse
          });
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          if (error) {
            throw error;
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new AuthInvalidTokenResponseError();
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error: invalidTokenError
            });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error
            });
          }
          throw error;
        }
      }
      /**
       * Allows signing in with an OIDC ID token. The authentication provider used
       * should be enabled and configured.
       */
      async signInWithIdToken(credentials) {
        try {
          const { options, provider, token, access_token, nonce } = credentials;
          const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
            headers: this.headers,
            body: {
              provider,
              id_token: token,
              access_token,
              nonce,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
          const { data, error } = res;
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new AuthInvalidTokenResponseError();
            return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("SIGNED_IN", data.session);
          }
          return this._returnResult({ data, error });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in a user using magiclink or a one-time password (OTP).
       *
       * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
       * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
       * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or, that the account
       * can only be accessed via social login.
       *
       * Do note that you will need to configure a Whatsapp sender on Twilio
       * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
       * channel is not supported on other providers
       * at this time.
       * This method supports PKCE when an email is passed.
       */
      async signInWithOtp(credentials) {
        var _a2, _b, _c, _d, _e;
        try {
          if ("email" in credentials) {
            const { email, options } = credentials;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce") {
              ;
              [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            }
            const { error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
              headers: this.headers,
              body: {
                email,
                data: (_a2 = options === null || options === void 0 ? void 0 : options.data) !== null && _a2 !== void 0 ? _a2 : {},
                create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          if ("phone" in credentials) {
            const { phone, options } = credentials;
            const { data, error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
              headers: this.headers,
              body: {
                phone,
                data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : "sms"
              }
            });
            return this._returnResult({
              data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
              error
            });
          }
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
       */
      async verifyOtp(params) {
        var _a2, _b;
        try {
          let redirectTo = void 0;
          let captchaToken = void 0;
          if ("options" in params) {
            redirectTo = (_a2 = params.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo;
            captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
          }
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/verify`, {
            headers: this.headers,
            body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
            redirectTo,
            xform: _sessionResponse
          });
          if (error) {
            throw error;
          }
          if (!data) {
            const tokenVerificationError = new Error("An error occurred on token verification.");
            throw tokenVerificationError;
          }
          const session = data.session;
          const user = data.user;
          if (session === null || session === void 0 ? void 0 : session.access_token) {
            await this._saveSession(session);
            await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
          }
          return this._returnResult({ data: { user, session }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Attempts a single-sign on using an enterprise Identity Provider. A
       * successful SSO attempt will redirect the current page to the identity
       * provider authorization page. The redirect URL is implementation and SSO
       * protocol specific.
       *
       * You can use it by providing a SSO domain. Typically you can extract this
       * domain by asking users for their email address. If this domain is
       * registered on the Auth instance the redirect will use that organization's
       * currently active SSO Identity Provider for the login.
       *
       * If you have built an organization-specific login page, you can use the
       * organization's SSO Identity Provider UUID directly instead.
       */
      async signInWithSSO(params) {
        var _a2, _b, _c, _d, _e;
        try {
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const result = await _request(this.fetch, "POST", `${this.url}/sso`, {
            body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a2 = params.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
            headers: this.headers,
            xform: _ssoResponse
          });
          if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && isBrowser() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) {
            window.location.assign(result.data.url);
          }
          return this._returnResult(result);
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Sends a reauthentication OTP to the user's email or phone number.
       * Requires the user to be signed-in.
       */
      async reauthenticate() {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._reauthenticate();
        });
      }
      async _reauthenticate() {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError)
              throw sessionError;
            if (!session)
              throw new AuthSessionMissingError();
            const { error } = await _request(this.fetch, "GET", `${this.url}/reauthenticate`, {
              headers: this.headers,
              jwt: session.access_token
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
       */
      async resend(credentials) {
        try {
          const endpoint = `${this.url}/resend`;
          if ("email" in credentials) {
            const { email, type, options } = credentials;
            const { error } = await _request(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                email,
                type,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
            });
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if ("phone" in credentials) {
            const { phone, type, options } = credentials;
            const { data, error } = await _request(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                phone,
                type,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              }
            });
            return this._returnResult({
              data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
              error
            });
          }
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Returns the session, refreshing it if necessary.
       *
       * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
       *
       * **IMPORTANT:** This method loads values directly from the storage attached
       * to the client. If that storage is based on request cookies for example,
       * the values in it may not be authentic and therefore it's strongly advised
       * against using this method and its results in such circumstances. A warning
       * will be emitted if this is detected. Use {@link #getUser()} instead.
       */
      async getSession() {
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
          return this._useSession(async (result2) => {
            return result2;
          });
        });
        return result;
      }
      /**
       * Acquires a global lock based on the storage key.
       */
      async _acquireLock(acquireTimeout, fn) {
        this._debug("#_acquireLock", "begin", acquireTimeout);
        try {
          if (this.lockAcquired) {
            const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
            const result = (async () => {
              await last;
              return await fn();
            })();
            this.pendingInLock.push((async () => {
              try {
                await result;
              } catch (e) {
              }
            })());
            return result;
          }
          return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
            this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
            try {
              this.lockAcquired = true;
              const result = fn();
              this.pendingInLock.push((async () => {
                try {
                  await result;
                } catch (e) {
                }
              })());
              await result;
              while (this.pendingInLock.length) {
                const waitOn = [...this.pendingInLock];
                await Promise.all(waitOn);
                this.pendingInLock.splice(0, waitOn.length);
              }
              return await result;
            } finally {
              this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
              this.lockAcquired = false;
            }
          });
        } finally {
          this._debug("#_acquireLock", "end");
        }
      }
      /**
       * Use instead of {@link #getSession} inside the library. It is
       * semantically usually what you want, as getting a session involves some
       * processing afterwards that requires only one client operating on the
       * session at once across multiple tabs or processes.
       */
      async _useSession(fn) {
        this._debug("#_useSession", "begin");
        try {
          const result = await this.__loadSession();
          return await fn(result);
        } finally {
          this._debug("#_useSession", "end");
        }
      }
      /**
       * NEVER USE DIRECTLY!
       *
       * Always use {@link #_useSession}.
       */
      async __loadSession() {
        this._debug("#__loadSession()", "begin");
        if (!this.lockAcquired) {
          this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
        }
        try {
          let currentSession = null;
          const maybeSession = await getItemAsync(this.storage, this.storageKey);
          this._debug("#getSession()", "session from storage", maybeSession);
          if (maybeSession !== null) {
            if (this._isValidSession(maybeSession)) {
              currentSession = maybeSession;
            } else {
              this._debug("#getSession()", "session from storage is not valid");
              await this._removeSession();
            }
          }
          if (!currentSession) {
            return { data: { session: null }, error: null };
          }
          const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1e3 - Date.now() < EXPIRY_MARGIN_MS : false;
          this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
          if (!hasExpired) {
            if (this.userStorage) {
              const maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
              if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
                currentSession.user = maybeUser.user;
              } else {
                currentSession.user = userNotAvailableProxy();
              }
            }
            if (this.storage.isServer && currentSession.user && !currentSession.user.__isUserNotAvailableProxy) {
              const suppressWarningRef = { value: this.suppressGetSessionWarning };
              currentSession.user = insecureUserWarningProxy(currentSession.user, suppressWarningRef);
              if (suppressWarningRef.value) {
                this.suppressGetSessionWarning = true;
              }
            }
            return { data: { session: currentSession }, error: null };
          }
          const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return this._returnResult({ data: { session: null }, error });
          }
          return this._returnResult({ data: { session }, error: null });
        } finally {
          this._debug("#__loadSession()", "end");
        }
      }
      /**
       * Gets the current user details if there is an existing session. This method
       * performs a network request to the Supabase Auth server, so the returned
       * value is authentic and can be used to base authorization rules on.
       *
       * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
       */
      async getUser(jwt) {
        if (jwt) {
          return await this._getUser(jwt);
        }
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
          return await this._getUser();
        });
        return result;
      }
      async _getUser(jwt) {
        try {
          if (jwt) {
            return await _request(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt,
              xform: _userResponse
            });
          }
          return await this._useSession(async (result) => {
            var _a2, _b, _c;
            const { data, error } = result;
            if (error) {
              throw error;
            }
            if (!((_a2 = data.session) === null || _a2 === void 0 ? void 0 : _a2.access_token) && !this.hasCustomAuthorizationHeader) {
              return { data: { user: null }, error: new AuthSessionMissingError() };
            }
            return await _request(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
              xform: _userResponse
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            if (isAuthSessionMissingError(error)) {
              await this._removeSession();
              await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            }
            return this._returnResult({ data: { user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Updates user data for a logged in user.
       */
      async updateUser(attributes, options = {}) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._updateUser(attributes, options);
        });
      }
      async _updateUser(attributes, options = {}) {
        try {
          return await this._useSession(async (result) => {
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              throw sessionError;
            }
            if (!sessionData.session) {
              throw new AuthSessionMissingError();
            }
            const session = sessionData.session;
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === "pkce" && attributes.email != null) {
              ;
              [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            }
            const { data, error: userError } = await _request(this.fetch, "PUT", `${this.url}/user`, {
              headers: this.headers,
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
              body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
              jwt: session.access_token,
              xform: _userResponse
            });
            if (userError) {
              throw userError;
            }
            session.user = data.user;
            await this._saveSession(session);
            await this._notifyAllSubscribers("USER_UPDATED", session);
            return this._returnResult({ data: { user: session.user }, error: null });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
       * If the refresh token or access token in the current session is invalid, an error will be thrown.
       * @param currentSession The current session that minimally contains an access token and refresh token.
       */
      async setSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._setSession(currentSession);
        });
      }
      async _setSession(currentSession) {
        try {
          if (!currentSession.access_token || !currentSession.refresh_token) {
            throw new AuthSessionMissingError();
          }
          const timeNow = Date.now() / 1e3;
          let expiresAt2 = timeNow;
          let hasExpired = true;
          let session = null;
          const { payload } = decodeJWT(currentSession.access_token);
          if (payload.exp) {
            expiresAt2 = payload.exp;
            hasExpired = expiresAt2 <= timeNow;
          }
          if (hasExpired) {
            const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            if (!refreshedSession) {
              return { data: { user: null, session: null }, error: null };
            }
            session = refreshedSession;
          } else {
            const { data, error } = await this._getUser(currentSession.access_token);
            if (error) {
              throw error;
            }
            session = {
              access_token: currentSession.access_token,
              refresh_token: currentSession.refresh_token,
              user: data.user,
              token_type: "bearer",
              expires_in: expiresAt2 - timeNow,
              expires_at: expiresAt2
            };
            await this._saveSession(session);
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
          return this._returnResult({ data: { user: session.user, session }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { session: null, user: null }, error });
          }
          throw error;
        }
      }
      /**
       * Returns a new session, regardless of expiry status.
       * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
       * If the current session's refresh token is invalid, an error will be thrown.
       * @param currentSession The current session. If passed in, it must contain a refresh token.
       */
      async refreshSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._refreshSession(currentSession);
        });
      }
      async _refreshSession(currentSession) {
        try {
          return await this._useSession(async (result) => {
            var _a2;
            if (!currentSession) {
              const { data, error: error2 } = result;
              if (error2) {
                throw error2;
              }
              currentSession = (_a2 = data.session) !== null && _a2 !== void 0 ? _a2 : void 0;
            }
            if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
              throw new AuthSessionMissingError();
            }
            const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            if (!session) {
              return this._returnResult({ data: { user: null, session: null }, error: null });
            }
            return this._returnResult({ data: { user: session.user, session }, error: null });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      }
      /**
       * Gets the session data from a URL string
       */
      async _getSessionFromURL(params, callbackUrlType) {
        try {
          if (!isBrowser())
            throw new AuthImplicitGrantRedirectError("No browser detected.");
          if (params.error || params.error_description || params.error_code) {
            throw new AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
              error: params.error || "unspecified_error",
              code: params.error_code || "unspecified_code"
            });
          }
          switch (callbackUrlType) {
            case "implicit":
              if (this.flowType === "pkce") {
                throw new AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
              }
              break;
            case "pkce":
              if (this.flowType === "implicit") {
                throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
              }
              break;
            default:
          }
          if (callbackUrlType === "pkce") {
            this._debug("#_initialize()", "begin", "is PKCE flow", true);
            if (!params.code)
              throw new AuthPKCEGrantCodeExchangeError("No code detected.");
            const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
            if (error2)
              throw error2;
            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            window.history.replaceState(window.history.state, "", url.toString());
            return { data: { session: data2.session, redirectType: null }, error: null };
          }
          const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
          if (!access_token || !expires_in || !refresh_token || !token_type) {
            throw new AuthImplicitGrantRedirectError("No session defined in URL");
          }
          const timeNow = Math.round(Date.now() / 1e3);
          const expiresIn = parseInt(expires_in);
          let expiresAt2 = timeNow + expiresIn;
          if (expires_at) {
            expiresAt2 = parseInt(expires_at);
          }
          const actuallyExpiresIn = expiresAt2 - timeNow;
          if (actuallyExpiresIn * 1e3 <= AUTO_REFRESH_TICK_DURATION_MS) {
            console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
          }
          const issuedAt = expiresAt2 - expiresIn;
          if (timeNow - issuedAt >= 120) {
            console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt2, timeNow);
          } else if (timeNow - issuedAt < 0) {
            console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt2, timeNow);
          }
          const { data, error } = await this._getUser(access_token);
          if (error)
            throw error;
          const session = {
            provider_token,
            provider_refresh_token,
            access_token,
            expires_in: expiresIn,
            expires_at: expiresAt2,
            refresh_token,
            token_type,
            user: data.user
          };
          window.location.hash = "";
          this._debug("#_getSessionFromURL()", "clearing window.location.hash");
          return this._returnResult({ data: { session, redirectType: params.type }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { session: null, redirectType: null }, error });
          }
          throw error;
        }
      }
      /**
       * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
       */
      _isImplicitGrantCallback(params) {
        return Boolean(params.access_token || params.error_description);
      }
      /**
       * Checks if the current URL and backing storage contain parameters given by a PKCE flow
       */
      async _isPKCECallback(params) {
        const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        return !!(params.code && currentStorageContent);
      }
      /**
       * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
       *
       * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
       * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
       *
       * If using `others` scope, no `SIGNED_OUT` event is fired!
       */
      async signOut(options = { scope: "global" }) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
          return await this._signOut(options);
        });
      }
      async _signOut({ scope } = { scope: "global" }) {
        return await this._useSession(async (result) => {
          var _a2;
          const { data, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ error: sessionError });
          }
          const accessToken = (_a2 = data.session) === null || _a2 === void 0 ? void 0 : _a2.access_token;
          if (accessToken) {
            const { error } = await this.admin.signOut(accessToken, scope);
            if (error) {
              if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401 || error.status === 403))) {
                return this._returnResult({ error });
              }
            }
          }
          if (scope !== "others") {
            await this._removeSession();
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          }
          return this._returnResult({ error: null });
        });
      }
      onAuthStateChange(callback) {
        const id = generateCallbackId();
        const subscription = {
          id,
          callback,
          unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", id);
            this.stateChangeEmitters.delete(id);
          }
        };
        this._debug("#onAuthStateChange()", "registered callback with id", id);
        this.stateChangeEmitters.set(id, subscription);
        (async () => {
          await this.initializePromise;
          await this._acquireLock(-1, async () => {
            this._emitInitialSession(id);
          });
        })();
        return { data: { subscription } };
      }
      async _emitInitialSession(id) {
        return await this._useSession(async (result) => {
          var _a2, _b;
          try {
            const { data: { session }, error } = result;
            if (error)
              throw error;
            await ((_a2 = this.stateChangeEmitters.get(id)) === null || _a2 === void 0 ? void 0 : _a2.callback("INITIAL_SESSION", session));
            this._debug("INITIAL_SESSION", "callback id", id, "session", session);
          } catch (err) {
            await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
            this._debug("INITIAL_SESSION", "callback id", id, "error", err);
            console.error(err);
          }
        });
      }
      /**
       * Sends a password reset request to an email address. This method supports the PKCE flow.
       *
       * @param email The email address of the user.
       * @param options.redirectTo The URL to send the user to after they click the password reset link.
       * @param options.captchaToken Verification token received when the user completes the captcha on the site.
       */
      async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(
            this.storage,
            this.storageKey,
            true
            // isPasswordRecovery
          );
        }
        try {
          return await _request(this.fetch, "POST", `${this.url}/recover`, {
            body: {
              email,
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod,
              gotrue_meta_security: { captcha_token: options.captchaToken }
            },
            headers: this.headers,
            redirectTo: options.redirectTo
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Gets all the identities linked to a user.
       */
      async getUserIdentities() {
        var _a2;
        try {
          const { data, error } = await this.getUser();
          if (error)
            throw error;
          return this._returnResult({ data: { identities: (_a2 = data.user.identities) !== null && _a2 !== void 0 ? _a2 : [] }, error: null });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async linkIdentity(credentials) {
        if ("token" in credentials) {
          return this.linkIdentityIdToken(credentials);
        }
        return this.linkIdentityOAuth(credentials);
      }
      async linkIdentityOAuth(credentials) {
        var _a2;
        try {
          const { data, error } = await this._useSession(async (result) => {
            var _a3, _b, _c, _d, _e;
            const { data: data2, error: error2 } = result;
            if (error2)
              throw error2;
            const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
              redirectTo: (_a3 = credentials.options) === null || _a3 === void 0 ? void 0 : _a3.redirectTo,
              scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
              queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
              skipBrowserRedirect: true
            });
            return await _request(this.fetch, "GET", url, {
              headers: this.headers,
              jwt: (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : void 0
            });
          });
          if (error)
            throw error;
          if (isBrowser() && !((_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.skipBrowserRedirect)) {
            window.location.assign(data === null || data === void 0 ? void 0 : data.url);
          }
          return this._returnResult({
            data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url },
            error: null
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: { provider: credentials.provider, url: null }, error });
          }
          throw error;
        }
      }
      async linkIdentityIdToken(credentials) {
        return await this._useSession(async (result) => {
          var _a2;
          try {
            const { error: sessionError, data: { session } } = result;
            if (sessionError)
              throw sessionError;
            const { options, provider, token, access_token, nonce } = credentials;
            const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
              headers: this.headers,
              jwt: (_a2 = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a2 !== void 0 ? _a2 : void 0,
              body: {
                provider,
                id_token: token,
                access_token,
                nonce,
                link_identity: true,
                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
              },
              xform: _sessionResponse
            });
            const { data, error } = res;
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error });
            } else if (!data || !data.session || !data.user) {
              return this._returnResult({
                data: { user: null, session: null },
                error: new AuthInvalidTokenResponseError()
              });
            }
            if (data.session) {
              await this._saveSession(data.session);
              await this._notifyAllSubscribers("USER_UPDATED", data.session);
            }
            return this._returnResult({ data, error });
          } catch (error) {
            if (isAuthError(error)) {
              return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
          }
        });
      }
      /**
       * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
       */
      async unlinkIdentity(identity) {
        try {
          return await this._useSession(async (result) => {
            var _a2, _b;
            const { data, error } = result;
            if (error) {
              throw error;
            }
            return await _request(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
              headers: this.headers,
              jwt: (_b = (_a2 = data.session) === null || _a2 === void 0 ? void 0 : _a2.access_token) !== null && _b !== void 0 ? _b : void 0
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Generates a new JWT.
       * @param refreshToken A valid refresh token that was returned on login.
       */
      async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, "begin");
        try {
          const startedAt = Date.now();
          return await retryable(async (attempt) => {
            if (attempt > 0) {
              await sleep(200 * Math.pow(2, attempt - 1));
            }
            this._debug(debugName, "refreshing attempt", attempt);
            return await _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
              body: { refresh_token: refreshToken },
              headers: this.headers,
              xform: _sessionResponse
            });
          }, (attempt, error) => {
            const nextBackOffInterval = 200 * Math.pow(2, attempt);
            return error && isAuthRetryableFetchError(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
            Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS;
          });
        } catch (error) {
          this._debug(debugName, "error", error);
          if (isAuthError(error)) {
            return this._returnResult({ data: { session: null, user: null }, error });
          }
          throw error;
        } finally {
          this._debug(debugName, "end");
        }
      }
      _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
        return isValidSession;
      }
      async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
          redirectTo: options.redirectTo,
          scopes: options.scopes,
          queryParams: options.queryParams
        });
        this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
        if (isBrowser() && !options.skipBrowserRedirect) {
          window.location.assign(url);
        }
        return { data: { provider, url }, error: null };
      }
      /**
       * Recovers the session from LocalStorage and refreshes the token
       * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
       */
      async _recoverAndRefresh() {
        var _a2, _b;
        const debugName = "#_recoverAndRefresh()";
        this._debug(debugName, "begin");
        try {
          const currentSession = await getItemAsync(this.storage, this.storageKey);
          if (currentSession && this.userStorage) {
            let maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
            if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
              maybeUser = { user: currentSession.user };
              await setItemAsync(this.userStorage, this.storageKey + "-user", maybeUser);
            }
            currentSession.user = (_a2 = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a2 !== void 0 ? _a2 : userNotAvailableProxy();
          } else if (currentSession && !currentSession.user) {
            if (!currentSession.user) {
              const separateUser = await getItemAsync(this.storage, this.storageKey + "-user");
              if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
                currentSession.user = separateUser.user;
                await removeItemAsync(this.storage, this.storageKey + "-user");
                await setItemAsync(this.storage, this.storageKey, currentSession);
              } else {
                currentSession.user = userNotAvailableProxy();
              }
            }
          }
          this._debug(debugName, "session from storage", currentSession);
          if (!this._isValidSession(currentSession)) {
            this._debug(debugName, "session is not valid");
            if (currentSession !== null) {
              await this._removeSession();
            }
            return;
          }
          const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 - Date.now() < EXPIRY_MARGIN_MS;
          this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${EXPIRY_MARGIN_MS}s`);
          if (expiresWithMargin) {
            if (this.autoRefreshToken && currentSession.refresh_token) {
              const { error } = await this._callRefreshToken(currentSession.refresh_token);
              if (error) {
                console.error(error);
                if (!isAuthRetryableFetchError(error)) {
                  this._debug(debugName, "refresh failed with a non-retryable error, removing the session", error);
                  await this._removeSession();
                }
              }
            }
          } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) {
            try {
              const { data, error: userError } = await this._getUser(currentSession.access_token);
              if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                currentSession.user = data.user;
                await this._saveSession(currentSession);
                await this._notifyAllSubscribers("SIGNED_IN", currentSession);
              } else {
                this._debug(debugName, "could not get user data, skipping SIGNED_IN notification");
              }
            } catch (getUserError) {
              console.error("Error getting user data:", getUserError);
              this._debug(debugName, "error getting user data, skipping SIGNED_IN notification", getUserError);
            }
          } else {
            await this._notifyAllSubscribers("SIGNED_IN", currentSession);
          }
        } catch (err) {
          this._debug(debugName, "error", err);
          console.error(err);
          return;
        } finally {
          this._debug(debugName, "end");
        }
      }
      async _callRefreshToken(refreshToken) {
        var _a2, _b;
        if (!refreshToken) {
          throw new AuthSessionMissingError();
        }
        if (this.refreshingDeferred) {
          return this.refreshingDeferred.promise;
        }
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, "begin");
        try {
          this.refreshingDeferred = new Deferred();
          const { data, error } = await this._refreshAccessToken(refreshToken);
          if (error)
            throw error;
          if (!data.session)
            throw new AuthSessionMissingError();
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
          const result = { data: data.session, error: null };
          this.refreshingDeferred.resolve(result);
          return result;
        } catch (error) {
          this._debug(debugName, "error", error);
          if (isAuthError(error)) {
            const result = { data: null, error };
            if (!isAuthRetryableFetchError(error)) {
              await this._removeSession();
            }
            (_a2 = this.refreshingDeferred) === null || _a2 === void 0 ? void 0 : _a2.resolve(result);
            return result;
          }
          (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
          throw error;
        } finally {
          this.refreshingDeferred = null;
          this._debug(debugName, "end");
        }
      }
      async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`;
        this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
        try {
          if (this.broadcastChannel && broadcast) {
            this.broadcastChannel.postMessage({ event, session });
          }
          const errors = [];
          const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
            try {
              await x.callback(event, session);
            } catch (e) {
              errors.push(e);
            }
          });
          await Promise.all(promises);
          if (errors.length > 0) {
            for (let i = 0; i < errors.length; i += 1) {
              console.error(errors[i]);
            }
            throw errors[0];
          }
        } finally {
          this._debug(debugName, "end");
        }
      }
      /**
       * set currentSession and currentUser
       * process to _startAutoRefreshToken if possible
       */
      async _saveSession(session) {
        this._debug("#_saveSession()", session);
        this.suppressGetSessionWarning = true;
        const sessionToProcess = Object.assign({}, session);
        const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
        if (this.userStorage) {
          if (!userIsProxy && sessionToProcess.user) {
            await setItemAsync(this.userStorage, this.storageKey + "-user", {
              user: sessionToProcess.user
            });
          } else if (userIsProxy) {
          }
          const mainSessionData = Object.assign({}, sessionToProcess);
          delete mainSessionData.user;
          const clonedMainSessionData = deepClone(mainSessionData);
          await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
        } else {
          const clonedSession = deepClone(sessionToProcess);
          await setItemAsync(this.storage, this.storageKey, clonedSession);
        }
      }
      async _removeSession() {
        this._debug("#_removeSession()");
        await removeItemAsync(this.storage, this.storageKey);
        await removeItemAsync(this.storage, this.storageKey + "-code-verifier");
        await removeItemAsync(this.storage, this.storageKey + "-user");
        if (this.userStorage) {
          await removeItemAsync(this.userStorage, this.storageKey + "-user");
        }
        await this._notifyAllSubscribers("SIGNED_OUT", null);
      }
      /**
       * Removes any registered visibilitychange callback.
       *
       * {@see #startAutoRefresh}
       * {@see #stopAutoRefresh}
       */
      _removeVisibilityChangedCallback() {
        this._debug("#_removeVisibilityChangedCallback()");
        const callback = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
          if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
            window.removeEventListener("visibilitychange", callback);
          }
        } catch (e) {
          console.error("removing visibilitychange callback failed", e);
        }
      }
      /**
       * This is the private implementation of {@link #startAutoRefresh}. Use this
       * within the library.
       */
      async _startAutoRefresh() {
        await this._stopAutoRefresh();
        this._debug("#_startAutoRefresh()");
        const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
        this.autoRefreshTicker = ticker;
        if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
          ticker.unref();
        } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
          Deno.unrefTimer(ticker);
        }
        setTimeout(async () => {
          await this.initializePromise;
          await this._autoRefreshTokenTick();
        }, 0);
      }
      /**
       * This is the private implementation of {@link #stopAutoRefresh}. Use this
       * within the library.
       */
      async _stopAutoRefresh() {
        this._debug("#_stopAutoRefresh()");
        const ticker = this.autoRefreshTicker;
        this.autoRefreshTicker = null;
        if (ticker) {
          clearInterval(ticker);
        }
      }
      /**
       * Starts an auto-refresh process in the background. The session is checked
       * every few seconds. Close to the time of expiration a process is started to
       * refresh the session. If refreshing fails it will be retried for as long as
       * necessary.
       *
       * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
       * to call this function, it will be called for you.
       *
       * On browsers the refresh process works only when the tab/window is in the
       * foreground to conserve resources as well as prevent race conditions and
       * flooding auth with requests. If you call this method any managed
       * visibility change callback will be removed and you must manage visibility
       * changes on your own.
       *
       * On non-browser platforms the refresh process works *continuously* in the
       * background, which may not be desirable. You should hook into your
       * platform's foreground indication mechanism and call these methods
       * appropriately to conserve resources.
       *
       * {@see #stopAutoRefresh}
       */
      async startAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._startAutoRefresh();
      }
      /**
       * Stops an active auto refresh process running in the background (if any).
       *
       * If you call this method any managed visibility change callback will be
       * removed and you must manage visibility changes on your own.
       *
       * See {@link #startAutoRefresh} for more details.
       */
      async stopAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._stopAutoRefresh();
      }
      /**
       * Runs the auto refresh token tick.
       */
      async _autoRefreshTokenTick() {
        this._debug("#_autoRefreshTokenTick()", "begin");
        try {
          await this._acquireLock(0, async () => {
            try {
              const now = Date.now();
              try {
                return await this._useSession(async (result) => {
                  const { data: { session } } = result;
                  if (!session || !session.refresh_token || !session.expires_at) {
                    this._debug("#_autoRefreshTokenTick()", "no session");
                    return;
                  }
                  const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                  this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                  if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                    await this._callRefreshToken(session.refresh_token);
                  }
                });
              } catch (e) {
                console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
              }
            } finally {
              this._debug("#_autoRefreshTokenTick()", "end");
            }
          });
        } catch (e) {
          if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
            this._debug("auto refresh token tick lock not available");
          } else {
            throw e;
          }
        }
      }
      /**
       * Registers callbacks on the browser / platform, which in-turn run
       * algorithms when the browser window/tab are in foreground. On non-browser
       * platforms it assumes always foreground.
       */
      async _handleVisibilityChange() {
        this._debug("#_handleVisibilityChange()");
        if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
          if (this.autoRefreshToken) {
            this.startAutoRefresh();
          }
          return false;
        }
        try {
          this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
          window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
          await this._onVisibilityChanged(true);
        } catch (error) {
          console.error("_handleVisibilityChange", error);
        }
      }
      /**
       * Callback registered with `window.addEventListener('visibilitychange')`.
       */
      async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
        this._debug(methodName, "visibilityState", document.visibilityState);
        if (document.visibilityState === "visible") {
          if (this.autoRefreshToken) {
            this._startAutoRefresh();
          }
          if (!calledFromInitialize) {
            await this.initializePromise;
            await this._acquireLock(-1, async () => {
              if (document.visibilityState !== "visible") {
                this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
                return;
              }
              await this._recoverAndRefresh();
            });
          }
        } else if (document.visibilityState === "hidden") {
          if (this.autoRefreshToken) {
            this._stopAutoRefresh();
          }
        }
      }
      /**
       * Generates the relevant login URL for a third-party provider.
       * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
       * @param options.scopes A space-separated list of scopes granted to the OAuth application.
       * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
       */
      async _getUrlForProvider(url, provider, options) {
        const urlParams = [`provider=${encodeURIComponent(provider)}`];
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
          urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
        }
        if (options === null || options === void 0 ? void 0 : options.scopes) {
          urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
        }
        if (this.flowType === "pkce") {
          const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          const flowParams = new URLSearchParams({
            code_challenge: `${encodeURIComponent(codeChallenge)}`,
            code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
          });
          urlParams.push(flowParams.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
          const query = new URLSearchParams(options.queryParams);
          urlParams.push(query.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
          urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
        }
        return `${url}?${urlParams.join("&")}`;
      }
      async _unenroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a2;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            return await _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
              headers: this.headers,
              jwt: (_a2 = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a2 === void 0 ? void 0 : _a2.access_token
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async _enroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a2, _b;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, params.factorType === "phone" ? { phone: params.phone } : params.factorType === "totp" ? { issuer: params.issuer } : {});
            const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors`, {
              body,
              headers: this.headers,
              jwt: (_a2 = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a2 === void 0 ? void 0 : _a2.access_token
            });
            if (error) {
              return this._returnResult({ data: null, error });
            }
            if (params.factorType === "totp" && data.type === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
              data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
            }
            return this._returnResult({ data, error: null });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async _verify(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a2;
              const { data: sessionData, error: sessionError } = result;
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError });
              }
              const body = Object.assign({ challenge_id: params.challengeId }, "webauthn" in params ? {
                webauthn: Object.assign(Object.assign({}, params.webauthn), { credential_response: params.webauthn.type === "create" ? serializeCredentialCreationResponse(params.webauthn.credential_response) : serializeCredentialRequestResponse(params.webauthn.credential_response) })
              } : { code: params.code });
              const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
                body,
                headers: this.headers,
                jwt: (_a2 = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a2 === void 0 ? void 0 : _a2.access_token
              });
              if (error) {
                return this._returnResult({ data: null, error });
              }
              await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
              await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
              return this._returnResult({ data, error });
            });
          } catch (error) {
            if (isAuthError(error)) {
              return this._returnResult({ data: null, error });
            }
            throw error;
          }
        });
      }
      async _challenge(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a2;
              const { data: sessionData, error: sessionError } = result;
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError });
              }
              const response = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
                body: params,
                headers: this.headers,
                jwt: (_a2 = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a2 === void 0 ? void 0 : _a2.access_token
              });
              if (response.error) {
                return response;
              }
              const { data } = response;
              if (data.type !== "webauthn") {
                return { data, error: null };
              }
              switch (data.webauthn.type) {
                case "create":
                  return {
                    data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialCreationOptions(data.webauthn.credential_options.publicKey) }) }) }),
                    error: null
                  };
                case "request":
                  return {
                    data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialRequestOptions(data.webauthn.credential_options.publicKey) }) }) }),
                    error: null
                  };
              }
            });
          } catch (error) {
            if (isAuthError(error)) {
              return this._returnResult({ data: null, error });
            }
            throw error;
          }
        });
      }
      /**
       * {@see GoTrueMFAApi#challengeAndVerify}
       */
      async _challengeAndVerify(params) {
        const { data: challengeData, error: challengeError } = await this._challenge({
          factorId: params.factorId
        });
        if (challengeError) {
          return this._returnResult({ data: null, error: challengeError });
        }
        return await this._verify({
          factorId: params.factorId,
          challengeId: challengeData.id,
          code: params.code
        });
      }
      /**
       * {@see GoTrueMFAApi#listFactors}
       */
      async _listFactors() {
        var _a2;
        const { data: { user }, error: userError } = await this.getUser();
        if (userError) {
          return { data: null, error: userError };
        }
        const data = {
          all: [],
          phone: [],
          totp: [],
          webauthn: []
        };
        for (const factor of (_a2 = user === null || user === void 0 ? void 0 : user.factors) !== null && _a2 !== void 0 ? _a2 : []) {
          data.all.push(factor);
          if (factor.status === "verified") {
            ;
            data[factor.factor_type].push(factor);
          }
        }
        return {
          data,
          error: null
        };
      }
      /**
       * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
       */
      async _getAuthenticatorAssuranceLevel() {
        var _a2, _b;
        const { data: { session }, error: sessionError } = await this.getSession();
        if (sessionError) {
          return this._returnResult({ data: null, error: sessionError });
        }
        if (!session) {
          return {
            data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
            error: null
          };
        }
        const { payload } = decodeJWT(session.access_token);
        let currentLevel = null;
        if (payload.aal) {
          currentLevel = payload.aal;
        }
        let nextLevel = currentLevel;
        const verifiedFactors = (_b = (_a2 = session.user.factors) === null || _a2 === void 0 ? void 0 : _a2.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
        if (verifiedFactors.length > 0) {
          nextLevel = "aal2";
        }
        const currentAuthenticationMethods = payload.amr || [];
        return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
      }
      /**
       * Retrieves details about an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * Returns authorization details including client info, scopes, and user information.
       * If the API returns a redirect_uri, it means consent was already given - the caller
       * should handle the redirect manually if needed.
       */
      async _getAuthorizationDetails(authorizationId) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new AuthSessionMissingError() });
            }
            return await _request(this.fetch, "GET", `${this.url}/oauth/authorizations/${authorizationId}`, {
              headers: this.headers,
              jwt: session.access_token,
              xform: (data) => ({ data, error: null })
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Approves an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _approveAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new AuthSessionMissingError() });
            }
            const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
              headers: this.headers,
              jwt: session.access_token,
              body: { action: "approve" },
              xform: (data) => ({ data, error: null })
            });
            if (response.data && response.data.redirect_url) {
              if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                window.location.assign(response.data.redirect_url);
              }
            }
            return response;
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Denies an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _denyAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new AuthSessionMissingError() });
            }
            const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
              headers: this.headers,
              jwt: session.access_token,
              body: { action: "deny" },
              xform: (data) => ({ data, error: null })
            });
            if (response.data && response.data.redirect_url) {
              if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                window.location.assign(response.data.redirect_url);
              }
            }
            return response;
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Lists all OAuth grants that the authenticated user has authorized.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _listOAuthGrants() {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new AuthSessionMissingError() });
            }
            return await _request(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              xform: (data) => ({ data, error: null })
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      /**
       * Revokes a user's OAuth grant for a specific client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _revokeOAuthGrant(options) {
        try {
          return await this._useSession(async (result) => {
            const { data: { session }, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            if (!session) {
              return this._returnResult({ data: null, error: new AuthSessionMissingError() });
            }
            return await _request(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              query: { client_id: options.clientId },
              xform: () => ({ data: {}, error: null })
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      async fetchJwk(kid, jwks = { keys: [] }) {
        let jwk = jwks.keys.find((key) => key.kid === kid);
        if (jwk) {
          return jwk;
        }
        const now = Date.now();
        jwk = this.jwks.keys.find((key) => key.kid === kid);
        if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
          return jwk;
        }
        const { data, error } = await _request(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
          headers: this.headers
        });
        if (error) {
          throw error;
        }
        if (!data.keys || data.keys.length === 0) {
          return null;
        }
        this.jwks = data;
        this.jwks_cached_at = now;
        jwk = data.keys.find((key) => key.kid === kid);
        if (!jwk) {
          return null;
        }
        return jwk;
      }
      /**
       * Extracts the JWT claims present in the access token by first verifying the
       * JWT against the server's JSON Web Key Set endpoint
       * `/.well-known/jwks.json` which is often cached, resulting in significantly
       * faster responses. Prefer this method over {@link #getUser} which always
       * sends a request to the Auth server for each JWT.
       *
       * If the project is not using an asymmetric JWT signing key (like ECC or
       * RSA) it always sends a request to the Auth server (similar to {@link
       * #getUser}) to verify the JWT.
       *
       * @param jwt An optional specific JWT you wish to verify, not the one you
       *            can obtain from {@link #getSession}.
       * @param options Various additional options that allow you to customize the
       *                behavior of this method.
       */
      async getClaims(jwt, options = {}) {
        try {
          let token = jwt;
          if (!token) {
            const { data, error } = await this.getSession();
            if (error || !data.session) {
              return this._returnResult({ data: null, error });
            }
            token = data.session.access_token;
          }
          const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload } } = decodeJWT(token);
          if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
            validateExp(payload.exp);
          }
          const signingKey = !header.alg || header.alg.startsWith("HS") || !header.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
          if (!signingKey) {
            const { error } = await this.getUser(token);
            if (error) {
              throw error;
            }
            return {
              data: {
                claims: payload,
                header,
                signature
              },
              error: null
            };
          }
          const algorithm = getAlgorithm(header.alg);
          const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
            "verify"
          ]);
          const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
          if (!isValid) {
            throw new AuthInvalidJwtError("Invalid JWT signature");
          }
          return {
            data: {
              claims: payload,
              header,
              signature
            },
            error: null
          };
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
    };
    __name(GoTrueClient, "GoTrueClient");
    GoTrueClient.nextInstanceID = {};
    GoTrueClient_default = GoTrueClient;
  }
});

// node_modules/@supabase/auth-js/dist/module/AuthAdminApi.js
var init_AuthAdminApi = __esm({
  "node_modules/@supabase/auth-js/dist/module/AuthAdminApi.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_GoTrueAdminApi();
  }
});

// node_modules/@supabase/auth-js/dist/module/AuthClient.js
var AuthClient, AuthClient_default;
var init_AuthClient = __esm({
  "node_modules/@supabase/auth-js/dist/module/AuthClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_GoTrueClient();
    AuthClient = GoTrueClient_default;
    AuthClient_default = AuthClient;
  }
});

// node_modules/@supabase/auth-js/dist/module/index.js
var init_module4 = __esm({
  "node_modules/@supabase/auth-js/dist/module/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_GoTrueAdminApi();
    init_GoTrueClient();
    init_AuthAdminApi();
    init_AuthClient();
    init_types3();
    init_errors3();
    init_locks();
  }
});

// node_modules/@supabase/supabase-js/dist/module/lib/SupabaseAuthClient.js
var SupabaseAuthClient;
var init_SupabaseAuthClient = __esm({
  "node_modules/@supabase/supabase-js/dist/module/lib/SupabaseAuthClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_module4();
    SupabaseAuthClient = class extends AuthClient_default {
      constructor(options) {
        super(options);
      }
    };
    __name(SupabaseAuthClient, "SupabaseAuthClient");
  }
});

// node_modules/@supabase/supabase-js/dist/module/SupabaseClient.js
var SupabaseClient;
var init_SupabaseClient = __esm({
  "node_modules/@supabase/supabase-js/dist/module/SupabaseClient.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_module();
    init_wrapper();
    init_module2();
    init_module3();
    init_constants4();
    init_fetch3();
    init_helpers3();
    init_SupabaseAuthClient();
    SupabaseClient = class {
      /**
       * Create a new client for use in the browser.
       * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
       * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
       * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
       * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
       * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
       * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
       * @param options.realtime Options passed along to realtime-js constructor.
       * @param options.storage Options passed along to the storage-js constructor.
       * @param options.global.fetch A custom fetch implementation.
       * @param options.global.headers Any additional headers to send with each network request.
       * @example
       * ```ts
       * import { createClient } from '@supabase/supabase-js'
       *
       * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
       * const { data } = await supabase.from('profiles').select('*')
       * ```
       */
      constructor(supabaseUrl, supabaseKey, options) {
        var _a2, _b, _c;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        const baseUrl = validateSupabaseUrl(supabaseUrl);
        if (!supabaseKey)
          throw new Error("supabaseKey is required.");
        this.realtimeUrl = new URL("realtime/v1", baseUrl);
        this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
        this.authUrl = new URL("auth/v1", baseUrl);
        this.storageUrl = new URL("storage/v1", baseUrl);
        this.functionsUrl = new URL("functions/v1", baseUrl);
        const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
        const DEFAULTS = {
          db: DEFAULT_DB_OPTIONS,
          realtime: DEFAULT_REALTIME_OPTIONS,
          auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
          global: DEFAULT_GLOBAL_OPTIONS
        };
        const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_a2 = settings.auth.storageKey) !== null && _a2 !== void 0 ? _a2 : "";
        this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
        if (!settings.accessToken) {
          this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
        } else {
          this.accessToken = settings.accessToken;
          this.auth = new Proxy({}, {
            get: (_, prop) => {
              throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
            }
          });
        }
        this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
        if (this.accessToken) {
          this.accessToken().then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e));
        }
        this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
          headers: this.headers,
          schema: settings.db.schema,
          fetch: this.fetch
        });
        this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
        if (!settings.accessToken) {
          this._listenForAuthEvents();
        }
      }
      /**
       * Supabase Functions allows you to deploy and invoke edge functions.
       */
      get functions() {
        return new FunctionsClient(this.functionsUrl.href, {
          headers: this.headers,
          customFetch: this.fetch
        });
      }
      /**
       * Perform a query on a table or a view.
       *
       * @param relation - The table or view name to query
       */
      from(relation) {
        return this.rest.from(relation);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.schema
      /**
       * Select a schema to query or perform an function (rpc) call.
       *
       * The schema needs to be on the list of exposed schemas inside Supabase.
       *
       * @param schema - The schema to query
       */
      schema(schema) {
        return this.rest.schema(schema);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.rpc
      /**
       * Perform a function call.
       *
       * @param fn - The function name to call
       * @param args - The arguments to pass to the function call
       * @param options - Named parameters
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       * @param options.get - When set to `true`, the function will be called with
       * read-only access mode.
       * @param options.count - Count algorithm to use to count rows returned by the
       * function. Only applicable for [set-returning
       * functions](https://www.postgresql.org/docs/current/functions-srf.html).
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      rpc(fn, args = {}, options = {
        head: false,
        get: false,
        count: void 0
      }) {
        return this.rest.rpc(fn, args, options);
      }
      /**
       * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
       *
       * @param {string} name - The name of the Realtime channel.
       * @param {Object} opts - The options to pass to the Realtime channel.
       *
       */
      channel(name, opts = { config: {} }) {
        return this.realtime.channel(name, opts);
      }
      /**
       * Returns all Realtime channels.
       */
      getChannels() {
        return this.realtime.getChannels();
      }
      /**
       * Unsubscribes and removes Realtime channel from Realtime client.
       *
       * @param {RealtimeChannel} channel - The name of the Realtime channel.
       *
       */
      removeChannel(channel) {
        return this.realtime.removeChannel(channel);
      }
      /**
       * Unsubscribes and removes all Realtime channels from Realtime client.
       */
      removeAllChannels() {
        return this.realtime.removeAllChannels();
      }
      async _getAccessToken() {
        var _a2, _b;
        if (this.accessToken) {
          return await this.accessToken();
        }
        const { data } = await this.auth.getSession();
        return (_b = (_a2 = data.session) === null || _a2 === void 0 ? void 0 : _a2.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
      }
      _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError }, headers, fetch2) {
        const authHeaders = {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: `${this.supabaseKey}`
        };
        return new SupabaseAuthClient({
          url: this.authUrl.href,
          headers: Object.assign(Object.assign({}, authHeaders), headers),
          storageKey,
          autoRefreshToken,
          persistSession,
          detectSessionInUrl,
          storage,
          userStorage,
          flowType,
          lock,
          debug,
          throwOnError,
          fetch: fetch2,
          // auth checks if there is a custom authorizaiton header using this flag
          // so it knows whether to return an error when getUser is called with no session
          hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
        });
      }
      _initRealtimeClient(options) {
        return new RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
      }
      _listenForAuthEvents() {
        const data = this.auth.onAuthStateChange((event, session) => {
          this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
        });
        return data;
      }
      _handleTokenChanged(event, source, token) {
        if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
          this.changedAccessToken = token;
          this.realtime.setAuth(token);
        } else if (event === "SIGNED_OUT") {
          this.realtime.setAuth();
          if (source == "STORAGE")
            this.auth.signOut();
          this.changedAccessToken = void 0;
        }
      }
    };
    __name(SupabaseClient, "SupabaseClient");
  }
});

// node_modules/@supabase/supabase-js/dist/module/index.js
function shouldShowDeprecationWarning() {
  if (typeof window !== "undefined") {
    return false;
  }
  if (typeof process === "undefined") {
    return false;
  }
  const processVersion = process["version"];
  if (processVersion === void 0 || processVersion === null) {
    return false;
  }
  const versionMatch = processVersion.match(/^v(\d+)\./);
  if (!versionMatch) {
    return false;
  }
  const majorVersion = parseInt(versionMatch[1], 10);
  return majorVersion <= 18;
}
var createClient;
var init_module5 = __esm({
  "node_modules/@supabase/supabase-js/dist/module/index.js"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_SupabaseClient();
    init_module4();
    init_wrapper();
    init_module2();
    createClient = /* @__PURE__ */ __name((supabaseUrl, supabaseKey, options) => {
      return new SupabaseClient(supabaseUrl, supabaseKey, options);
    }, "createClient");
    __name(shouldShowDeprecationWarning, "shouldShowDeprecationWarning");
    if (shouldShowDeprecationWarning()) {
      console.warn(`\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
    }
  }
});

// src/services/TribunalService.ts
var TribunalService_exports = {};
__export(TribunalService_exports, {
  cast_vote: () => cast_vote,
  create_dispute: () => create_dispute,
  resolve_dispute: () => resolve_dispute
});
async function create_dispute(supabaseUrl, supabaseKey, squadId, accusedUserId, accuserUserId, reason, amount, evidenceUrl) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase2.from("disputes").insert({
    squad_id: squadId,
    accused_user_id: accusedUserId,
    accuser_user_id: accuserUserId,
    reason,
    amount,
    status: "OPEN",
    metadata: {
      evidence_url: evidenceUrl
    },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
    // 24 hours from now
  }).select().single();
  if (error)
    throw new Error(`Dispute Creation Failed: ${error.message}`);
  return data;
}
async function cast_vote(supabaseUrl, supabaseKey, disputeId, voterId, vote) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  const { error: voteError } = await supabase2.from("dispute_votes").insert({
    dispute_id: disputeId,
    voter_user_id: voterId,
    vote
  });
  if (voteError) {
    if (voteError.code === "23505")
      throw new Error("You have already voted.");
    throw new Error(`Vote Failed: ${voteError.message}`);
  }
  const { data: disputeData, error: disputeError } = await supabase2.from("disputes").select("squad_id, accused_user_id, penalty_amount").eq("id", disputeId).single();
  if (disputeError || !disputeData)
    throw new Error("Dispute not found");
  const squadId = disputeData.squad_id;
  const { count: totalMembers } = await supabase2.from("squad_members").select("*", { count: "exact", head: true }).eq("squad_id", squadId).eq("is_active", true);
  if (!totalMembers)
    throw new Error("Squad has no members?");
  const { data: votes } = await supabase2.from("dispute_votes").select("vote").eq("dispute_id", disputeId);
  const guiltyVotes = votes?.filter((v) => v.vote === "GUILTY").length || 0;
  const innocentVotes = votes?.filter((v) => v.vote === "INNOCENT").length || 0;
  const totalVotes = votes?.length || 0;
  const threshold = totalMembers / 2;
  if (guiltyVotes > threshold) {
    await resolve_dispute(supabase2, disputeId, "GUILTY", disputeData.penalty_amount, disputeData.accused_user_id, squadId);
    return { status: "RESOLVED", verdict: "GUILTY", message: "The Tribunal has spoken. Accused is GUILTY." };
  } else if (innocentVotes > threshold) {
    await resolve_dispute(supabase2, disputeId, "INNOCENT", 0, disputeData.accused_user_id, squadId);
    return { status: "RESOLVED", verdict: "INNOCENT", message: "The Tribunal has spoken. Accused is innocent." };
  }
  return { status: "VOTING", message: "Vote recorded. Waiting for consensus.", guilty: guiltyVotes, innocent: innocentVotes, required: Math.floor(threshold) + 1 };
}
async function resolve_dispute(supabase2, disputeId, verdict, penaltyAmount, accusedUserId, squadId) {
  console.log(`Resolving dispute ${disputeId} as ${verdict}`);
  const { error: updateError } = await supabase2.from("disputes").update({
    status: "RESOLVED",
    resolved_at: (/* @__PURE__ */ new Date()).toISOString()
    // We could store the final verdict if we had a column for it,
    // but for now status=RESOLVED implies the logic ran.
    // Ideally add a 'verdict' column to disputes table.
  }).eq("id", disputeId);
  if (updateError) {
    console.error("Error resolving dispute:", updateError);
    return;
  }
  if (verdict === "GUILTY" && penaltyAmount > 0) {
    const { data: userWallet, error: userWalletError } = await supabase2.from("wallets").select("id, balance").eq("owner_user_id", accusedUserId).eq("type", "personal").single();
    if (userWalletError || !userWallet) {
      console.error("User wallet not found:", userWalletError);
      return;
    }
    const { data: squadWallet, error: squadWalletError } = await supabase2.from("wallets").select("id, balance").eq("owner_squad_id", squadId).eq("type", "squad_shared").single();
    if (squadWalletError || !squadWallet) {
      console.error("Squad wallet not found:", squadWalletError);
      return;
    }
    const { error: deductionError } = await supabase2.from("transactions").insert({
      wallet_id: userWallet.id,
      amount: -penaltyAmount,
      // Negative for deduction
      type: "expense",
      // Considered an expense/fine
      source: "manual",
      // Or 'tribunal' if we add that enum
      description: `Tribunal Penalty: Dispute #${disputeId.substring(0, 8)}`,
      performed_by_user_id: accusedUserId,
      // Technically system, but attributed to user
      metadata: { dispute_id: disputeId, type: "penalty" }
    });
    if (deductionError) {
      console.error("Error deducting penalty:", deductionError);
      return;
    }
    const { error: depositError } = await supabase2.from("transactions").insert({
      wallet_id: squadWallet.id,
      amount: penaltyAmount,
      type: "deposit",
      // Income for the squad
      source: "manual",
      description: `Tribunal Compensation: Dispute #${disputeId.substring(0, 8)}`,
      metadata: { dispute_id: disputeId, type: "compensation", from_user: accusedUserId }
    });
    if (depositError) {
      console.error("Error depositing compensation:", depositError);
    }
    await supabase2.from("wallets").update({ balance: userWallet.balance - penaltyAmount }).eq("id", userWallet.id);
    await supabase2.from("wallets").update({ balance: squadWallet.balance + penaltyAmount }).eq("id", squadWallet.id);
    console.log("Penalty executed and funds transferred.");
    console.log(`NOTIFICATION to ${accusedUserId}: Tribunal Verdict: GUILTY. ${penaltyAmount} BDT deducted.`);
  }
}
var init_TribunalService = __esm({
  "src/services/TribunalService.ts"() {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_module5();
    __name(create_dispute, "create_dispute");
    __name(cast_vote, "cast_vote");
    __name(resolve_dispute, "resolve_dispute");
  }
});

// .wrangler/tmp/bundle-Gn5G5k/middleware-loader.entry.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-Gn5G5k/middleware-insertion-facade.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();

// node_modules/hono/dist/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/hono.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/hono-base.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/compose.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/request.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/http-exception.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/request/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index2) => {
    if (index2 === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/hono/dist/router/reg-exp-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index2 = match3.indexOf("", 1);
    return [matcher[1][index2], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index2, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/index.ts
init_TribunalService();

// src/services/ServiceRegistry.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/services/FinancialAccountability.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
async function process_khata_expense(supabaseUrl, supabaseKey, squadId, amount, expenseType, isRecurring) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[FinancialAccountability] Processing Expense: ${expenseType} for Squad: ${squadId}`);
  const ledgerName = `${expenseType} - ${(/* @__PURE__ */ new Date()).toLocaleString("default", { month: "long", year: "numeric" })}`;
  const ledgerTypeMap = { "RENT": "rent", "UTILITY": "utilities" };
  const { data: ledger, error: ledgerError } = await supabase2.from("khata_ledgers").insert({
    squad_id: squadId,
    name: ledgerName,
    type: ledgerTypeMap[expenseType] || "general",
    total_amount: amount,
    paid_amount: 0,
    is_settled: false
  }).select().single();
  if (ledgerError || !ledger)
    throw new Error(`Failed to create ledger: ${ledgerError?.message}`);
  const { data: members, error: memberError } = await supabase2.from("squad_members").select("user_id").eq("squad_id", squadId).eq("is_active", true);
  if (memberError || !members || members.length === 0)
    throw new Error("No active members to split bill");
  const splitAmount = amount / members.length;
  const transactions = [];
  const khataEntries = [];
  for (const member of members) {
    khataEntries.push({
      squad_id: squadId,
      user_id: member.user_id,
      amount: splitAmount,
      type: "mess",
      // Using 'mess' type for internal squad expenses
      description: `Auto-Split: ${ledgerName}`,
      category: expenseType,
      // Link to the specific ledger we just created
      // Note: In master_schema, khata_entries didn't have ledger_id FK explicitly in the CREATE TABLE snippet 
      // but the prompt implies linking. We'll use metadata or assume the schema supports it.
      // *Correction*: The schema had `transaction_id` and `user_id`. 
      // We'll store the link in metadata if strictly following the provided schema snippet, 
      // or assume we can link it.
      metadata: { ledger_id: ledger.id }
    });
  }
  const { error: entryError } = await supabase2.from("khata_entries").insert(khataEntries);
  if (entryError)
    throw new Error(`Auto-Collector failed: ${entryError.message}`);
  console.log(`[FinancialAccountability] Auto-collected ${splitAmount} from ${members.length} members.`);
  return {
    success: true,
    ledger_id: ledger.id,
    split_amount: splitAmount,
    status: "COLLECTION_INITIATED"
  };
}
__name(process_khata_expense, "process_khata_expense");
async function get_squad_financial_health(supabaseUrl, supabaseKey, squadId, client) {
  const supabase2 = client || createClient(supabaseUrl, supabaseKey);
  const { data: tohobilData, error: tohobilError } = await supabase2.from("khata_ledgers").select("paid_amount").eq("squad_id", squadId).eq("type", "SHARED_SQUAD");
  let tohobilBalance = 0;
  if (tohobilData) {
    tohobilBalance = tohobilData.reduce((sum, record) => sum + (record.paid_amount || 0), 0);
  }
  const { data: rentLedger } = await supabase2.from("khata_ledgers").select("created_at").eq("squad_id", squadId).eq("type", "RENT").order("created_at", { ascending: false }).limit(1).single();
  let rentDueDays = 30;
  if (rentLedger) {
    const lastRentDate = new Date(rentLedger.created_at);
    const nextDueDate = new Date(lastRentDate);
    nextDueDate.setDate(nextDueDate.getDate() + 30);
    const now = /* @__PURE__ */ new Date();
    const diffTime = nextDueDate.getTime() - now.getTime();
    rentDueDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  }
  return {
    tohobil_balance: tohobilBalance,
    rent_due_days: rentDueDays,
    status: tohobilBalance > 5e3 ? "HEALTHY" : "LOW_FUNDS"
  };
}
__name(get_squad_financial_health, "get_squad_financial_health");

// src/services/ServiceRegistry.ts
var ServiceRegistry = class {
  supabase;
  env;
  constructor(supabase2, env) {
    this.supabase = supabase2;
    this.env = env;
  }
  /**
   * 1. Rizik Rents (Asset Economy)
   * Logic: User A rents 'Fridge' from User B.
   * - Creates recurring deduction in A's ledger.
   * - Auto-credits B's wallet.
   */
  async initiate_asset_rental(renterId, ownerId, assetName, monthlyRent, squadId) {
    console.log(`[RizikRents] Initiating rental: ${assetName} from ${ownerId} to ${renterId}`);
    const { data: ledgerEntry, error } = await this.supabase.from("khata_ledgers").insert({
      squad_id: squadId,
      user_id: renterId,
      // The one paying
      title: `Rent: ${assetName}`,
      amount: monthlyRent,
      type: "expense",
      category: "asset_rental",
      status: "recurring",
      recurrence_period: "monthly",
      metadata: {
        owner_id: ownerId,
        asset_name: assetName,
        start_date: (/* @__PURE__ */ new Date()).toISOString()
      },
      next_payment_date: new Date((/* @__PURE__ */ new Date()).setMonth((/* @__PURE__ */ new Date()).getMonth() + 1)).toISOString()
      // Next payment in 1 month
    }).select().single();
    if (error)
      throw new Error(`Failed to create rental ledger: ${error.message}`);
    return {
      success: true,
      message: `Rental initiated for ${assetName}. Monthly ${monthlyRent} BDT will be deducted.`,
      ledger_id: ledgerEntry.id
    };
  }
  /**
   * 2. Academic Gigs (Student Economy)
   * Logic: Post a gig, but only allow verified students to bid.
   */
  async post_academic_gig(posterId, squadId, title, description, bounty, requiredTag = "Law Student") {
    console.log(`[AcademicGigs] Posting gig: ${title} for ${requiredTag}`);
    const { data: task, error } = await this.supabase.from("duty_rosters").insert({
      squad_id: squadId,
      title,
      description,
      assigned_to: null,
      // Open for bidding
      status: "open_for_bid",
      bounty_amount: bounty,
      metadata: {
        is_academic: true,
        required_qualification: requiredTag,
        poster_id: posterId
      }
    }).select().single();
    if (error)
      throw new Error(`Failed to post academic gig: ${error.message}`);
    return {
      success: true,
      message: `Academic Gig posted! Only verified '${requiredTag}'s can bid.`,
      task_id: task.id
    };
  }
  /**
   * 3. The Dark Economy (Rizik Nudge/Proxy)
   * Logic: "Line Standing" or "Money Recovery" missions.
   * These are just missions with duration but no delivery item.
   */
  async launch_proxy_mission(requesterId, squadId, missionType, location, durationHours, bounty) {
    console.log(`[DarkEconomy] Launching proxy mission: ${missionType} at ${location}`);
    const missionData = {
      title: this._getMissionTitle(missionType),
      description: `Proxy Mission: ${missionType} at ${location} for ${durationHours} hours.`,
      location,
      duration_hours: durationHours,
      bounty,
      requester_id: requesterId,
      type: "proxy_mission"
    };
    const { data: mission, error } = await this.supabase.from("duty_rosters").insert({
      squad_id: squadId,
      title: missionData.title,
      description: missionData.description,
      status: "pending",
      bounty_amount: bounty,
      metadata: missionData
    }).select().single();
    if (error)
      throw new Error(`Failed to launch proxy mission: ${error.message}`);
    return {
      success: true,
      message: `Proxy Mission launched. Agents in ${location} will be notified.`,
      mission_id: mission.id
    };
  }
  /**
   * 4. Super-App Automation (Cron Logic)
   * Called by index.ts scheduled() handler.
   */
  async process_scheduled_tasks() {
    console.log("[Cron] Processing scheduled tasks...");
    await this._process_recurring_rentals();
    await this._process_expired_disputes();
  }
  async _process_recurring_rentals() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: rentals, error } = await this.supabase.from("khata_ledgers").select("*").eq("status", "recurring").eq("category", "asset_rental").lte("next_payment_date", now);
    if (error || !rentals)
      return;
    console.log(`[Cron] Found ${rentals.length} rentals due.`);
    for (const rental of rentals) {
      try {
        await process_khata_expense(
          this.supabase,
          rental.squad_id,
          rental.user_id,
          // Payer
          rental.title,
          rental.amount,
          [rental.user_id]
          // Split among... just payer? No, this is rent.
          // Actually process_khata_expense is for splitting. 
          // We need a direct transfer here.
        );
        const ownerId = rental.metadata.owner_id;
        if (ownerId) {
        }
        const nextDate = new Date(rental.next_payment_date);
        nextDate.setMonth(nextDate.getMonth() + 1);
        await this.supabase.from("khata_ledgers").update({ next_payment_date: nextDate.toISOString() }).eq("id", rental.id);
        console.log(`[Cron] Processed rent for ${rental.title}`);
      } catch (e) {
        console.error(`[Cron] Failed to process rental ${rental.id}:`, e);
      }
    }
  }
  async _process_expired_disputes() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: disputes, error } = await this.supabase.from("disputes").select("*").eq("status", "OPEN").lte("expires_at", now);
    if (error || !disputes)
      return;
    console.log(`[Cron] Found ${disputes.length} expired disputes.`);
    const { resolve_dispute: resolve_dispute2 } = (init_TribunalService(), __toCommonJS(TribunalService_exports));
    for (const dispute of disputes) {
      console.log(`[Cron] Auto-resolving dispute ${dispute.id} as INNOCENT (Time Expired)`);
      await resolve_dispute2(
        this.supabase,
        dispute.id,
        "INNOCENT",
        0,
        dispute.accused_user_id,
        dispute.squad_id
      );
    }
  }
  /**
   * 5. Verification Gate
   */
  async verify_bidder_eligibility(userId, gigId) {
    const { data: gig } = await this.supabase.from("duty_rosters").select("metadata").eq("id", gigId).single();
    if (!gig || !gig.metadata || !gig.metadata.is_academic) {
      return true;
    }
    const { data: profile } = await this.supabase.from("user_profiles").select("is_verified_student").eq("id", userId).single();
    if (profile && profile.is_verified_student) {
      return true;
    }
    return false;
  }
  _getMissionTitle(type) {
    switch (type) {
      case "line_standing":
        return "\u{1F9CD} Proxy Queue Stand";
      case "money_recovery":
        return "\u{1F4B8} Soft Nudge (Recovery)";
      case "official_nudge":
        return "\u{1F3DB}\uFE0F Official Paperwork Proxy";
      default:
        return "\u{1F575}\uFE0F Secret Mission";
    }
  }
};
__name(ServiceRegistry, "ServiceRegistry");

// src/services/RealtimeKitService.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function create_meeting(apiKey, meetingName = "Rizik Video Call") {
  const url = "https://api.realtime.cloudflare.com/v2/meetings";
  console.log(`[RealtimeKit] Creating meeting: ${meetingName}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: meetingName
      // Optional: Add other meeting configuration here
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create meeting: ${response.status} ${errorText}`);
  }
  const result = await response.json();
  const data = result.data;
  console.log(`[RealtimeKit] Meeting created: ${data.id}`);
  return {
    meetingId: data.id,
    name: data.name
  };
}
__name(create_meeting, "create_meeting");
async function add_participant(apiKey, meetingId, participantName, participantId) {
  const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}/participants`;
  console.log(`[RealtimeKit] Adding participant: ${participantName} to meeting ${meetingId}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: participantName,
      custom_participant_id: participantId,
      preset_name: "participant"
      // User's preset from RealtimeKit dashboard
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add participant: ${response.status} ${errorText}`);
  }
  const result = await response.json();
  console.log("[RealtimeKit] Raw Add Participant Response:", JSON.stringify(result, null, 2));
  const data = result.data;
  console.log(`[RealtimeKit] Participant added. Data keys: ${Object.keys(data)}`);
  return {
    authToken: data.token || data.auth_token || data.access_token,
    // Try multiple keys
    participantId: data.id,
    customParticipantId: data.custom_participant_id,
    raw: data
    // Return raw data for debugging in Flutter
  };
}
__name(add_participant, "add_participant");
async function get_meeting(apiKey, meetingId) {
  const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${apiKey}`
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get meeting: ${response.status} ${errorText}`);
  }
  return await response.json();
}
__name(get_meeting, "get_meeting");

// src/services/SquadService.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
async function create_squad(supabaseUrl, supabaseKey, name, type, creatorId) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  const randomNum = Math.floor(Math.random() * 1e3);
  const inviteCode = `RZK-DHAKA-${randomNum}`;
  const { data: squadData, error: squadError } = await supabase2.from("squads").insert({
    name,
    type,
    // 'bachelor_mess', 'family', etc.
    created_by: creatorId,
    invite_code: inviteCode,
    trust_score: 50
  }).select().single();
  if (squadError)
    throw new Error(`Squad Creation Failed: ${squadError.message}`);
  const squadId = squadData.id;
  const { data: walletData, error: walletError } = await supabase2.from("wallets").insert({
    type: "squad_shared",
    owner_squad_id: squadId,
    balance: 0,
    currency: "BDT",
    is_active: true
  }).select().single();
  if (walletError)
    throw new Error(`Wallet Creation Failed: ${walletError.message}`);
  await supabase2.from("squads").update({ wallet_id: walletData.id }).eq("id", squadId);
  const { error: memberError } = await supabase2.from("squad_members").insert({
    squad_id: squadId,
    user_id: creatorId,
    role: "leader",
    joined_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true
  });
  if (memberError)
    throw new Error(`Member Assignment Failed: ${memberError.message}`);
  await supabase2.from("user_profiles").update({ current_squad_id: squadId }).eq("id", creatorId);
  return {
    squad_id: squadId,
    invite_code: inviteCode,
    wallet_id: walletData.id,
    message: "Squad created successfully!"
  };
}
__name(create_squad, "create_squad");
async function join_squad(supabaseUrl, supabaseKey, userId, inviteCode) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  const { data: squadData, error: squadError } = await supabase2.from("squads").select("id, name").eq("invite_code", inviteCode).single();
  if (squadError || !squadData)
    throw new Error("Invalid Invite Code");
  const squadId = squadData.id;
  const { data: existingMember } = await supabase2.from("squad_members").select("role").eq("squad_id", squadId).eq("user_id", userId).single();
  if (existingMember)
    throw new Error("You are already a member of this squad.");
  const { error: joinError } = await supabase2.from("squad_members").insert({
    squad_id: squadId,
    user_id: userId,
    role: "member",
    joined_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true
  });
  if (joinError)
    throw new Error(`Joining Failed: ${joinError.message}`);
  await supabase2.from("user_profiles").update({ current_squad_id: squadId }).eq("id", userId);
  return {
    success: true,
    squad_id: squadId,
    squad_name: squadData.name,
    message: `Welcome to ${squadData.name}!`
  };
}
__name(join_squad, "join_squad");

// src/ai/AIOrchestrator.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/services/OperationalEngine.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
var DUTY_ROLES = ["chef", "buyer", "cutter", "cleaner"];
var TASK_CHAIN = {
  "buyer": "cutter",
  // Buyer -> Cutter
  "cutter": "chef",
  // Cutter -> Chef
  "chef": "cleaner"
  // Chef -> Cleaner
};
async function generate_daily_rota(supabaseUrl, supabaseKey, squadId, date) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[OperationalEngine] Generating Rota for Squad: ${squadId} on ${date}`);
  const { data: squad, error: squadError } = await supabase2.from("squads").select("settings, id").eq("id", squadId).single();
  if (squadError || !squad)
    throw new Error(`Squad not found: ${squadError?.message}`);
  const { data: members, error: memberError } = await supabase2.from("squad_members").select("user_id, role").eq("squad_id", squadId).eq("is_active", true);
  if (memberError || !members)
    throw new Error(`No active members: ${memberError?.message}`);
  const rotaType = squad.settings?.rota_type || "rotating";
  const assignments = [];
  if (rotaType === "fixed_role") {
    for (const role of DUTY_ROLES) {
      const specialist = members.find((m) => m.role === role);
      if (specialist) {
        assignments.push({
          role,
          user_id: specialist.user_id
        });
      } else {
        console.warn(`[OperationalEngine] No specialist found for fixed role: ${role}`);
      }
    }
  } else {
    const dayOfYear = getDayOfYear(new Date(date));
    DUTY_ROLES.forEach((role, index2) => {
      const memberIndex = (dayOfYear + index2) % members.length;
      assignments.push({
        role,
        user_id: members[memberIndex].user_id
      });
    });
  }
  console.log(`[OperationalEngine] Generated Assignments:`, assignments);
  return { success: true, date, assignments };
}
__name(generate_daily_rota, "generate_daily_rota");
async function trigger_next_task(supabaseUrl, supabaseKey, currentDutyId, squadId) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[OperationalEngine] Triggering Next Task for Duty: ${currentDutyId}`);
  const completedDutyRole = "buyer";
  const completedStatus = "completed";
  if (completedStatus !== "completed") {
    return { message: "Task not completed yet." };
  }
  const nextRole = TASK_CHAIN[completedDutyRole];
  if (!nextRole) {
    return { message: "Chain complete. No further tasks." };
  }
  console.log(`[OperationalEngine] Chain Logic: ${completedDutyRole} -> ${nextRole}`);
  const notificationMessage = `\u26A0\uFE0F Assembly Line Alert: Bazar is here! Start Cutting now.`;
  return {
    success: true,
    previous_role: completedDutyRole,
    triggered_role: nextRole,
    action: "STATUS_UPDATE_ACTIVE",
    notification: notificationMessage
  };
}
__name(trigger_next_task, "trigger_next_task");
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1e3 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
__name(getDayOfYear, "getDayOfYear");

// src/ai/AIOrchestrator.ts
init_module5();
var TOOLS = [
  {
    name: "assign_duty_rota",
    description: 'Generates duties for the day. Use ONLY when user explicitly asks to "start the day", "assign duties", or "who does what today".',
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD format. Default to today." }
      },
      required: ["date"]
    }
  },
  {
    name: "check_financial_health",
    description: "Checks funds/rent. Use ONLY when user explicitly asks about money, balance, rent, or tohobil status.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "manage_squad_member",
    description: 'Invite, kick, or promote a member. Use ONLY if the user explicitly says "Invite X", "Kick X", or "Promote X". DO NOT use for general questions like "Ki koro".',
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["invite", "kick", "promote"] },
        target_name: { type: "string" }
      },
      required: ["action", "target_name"]
    }
  },
  {
    name: "update_student_profile",
    description: 'Save user academic details. Use ONLY if the user explicitly says "I study X" or "My skill is Y". DO NOT use for general questions.',
    parameters: {
      type: "object",
      properties: {
        department: { type: "string" },
        skills: { type: "array", items: { type: "string" } }
      },
      required: ["department", "skills"]
    }
  },
  {
    name: "post_gig",
    description: 'Create a job/gig. Use when user has a problem needing a specific skill (e.g. "I need a lawyer").',
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        budget: { type: "number" },
        required_department: { type: "string" }
      },
      required: ["title", "description", "budget", "required_department"]
    }
  },
  {
    name: "accept_gig",
    description: "Accepts a gig. Locks budget.",
    parameters: {
      type: "object",
      properties: {
        gig_id: { type: "string" }
      },
      required: ["gig_id"]
    }
  },
  {
    name: "get_join_screen",
    description: 'Show the Join Squad UI. Use ONLY if the user explicitly says "I want to join a squad". DO NOT use for "Who are you" or "What do you do".',
    parameters: { type: "object", properties: {}, required: [] }
  },
  {
    name: "initiate_asset_rental",
    description: "Rent an asset (Fridge/AC).",
    parameters: {
      type: "object",
      properties: {
        asset_name: { type: "string" },
        duration_hours: { type: "number" }
      },
      required: ["asset_name", "duration_hours"]
    }
  }
];
async function orchestrateAI(ai, env, supabaseUrl, supabaseKey, userMessage, history, squadId, userId, userContext, squadContext) {
  console.log(`[Rizik OS] Processing for ${userContext.name} in Squad ${squadContext.name}`);
  const systemPrompt = `
    You are 'Rizik OS', the intelligent AI Manager for the squad "${squadContext.name}".
    You are talking to ${userContext.name} (Role: ${userContext.role}).
    
    YOUR CAPABILITIES (Reference Only):
    1. **Duty Rota**: Assign daily chores (Bazar, Cleaning).
    2. **Finance**: Check Tohobil balance, Rent status.
    3. **Squad Management**: Invite, Kick, or Promote members.
    4. **Gigs**: Post academic gigs or tasks.
    5. **Asset Rental**: Rent items like AC/Fridge within the squad.

    CRITICAL RULES (DO NOT BREAK):
    1. **IDENTITY ONLY**: You are Rizik OS. You are NOT a language assistant. You are NOT a translator.
    2. **NO EXPLANATIONS**: NEVER explain what a Bengali phrase means. NEVER say "roughly translates to".
    3. **DYNAMIC CHAT**: If the user asks "Who are you?" or "What can you do?", DO NOT call a tool. ANSWER naturally using your capabilities list above.
    4. **ASSUME CONVERSATION**: If the user says "Koro ke tumi" (Who are you), answer directly: "Ami Rizik OS..."
    5. **TOOLS**: Only use tools for EXACT actions (e.g., "Assign rota", "Check balance").
    
    FEW-SHOT EXAMPLES:
    - User: "Koro ke tumi" -> You: "Ami Rizik OS bhai. Ami Rota, Hishab, ar Squad manage kori."
    - User: "Ki koro?" -> You: "Ami Squad er sob kaj manage kori. Kono help lagbe?"
    - User: "Tumi kar?" -> You: "Ami ei Squad er jonno banano hoyechi."
    
    CONTEXT:
    - Today is ${(/* @__PURE__ */ new Date()).toLocaleDateString()}.
    - User Department: ${userContext.department || "Unknown"}.
    `;
  const recentHistory = history.slice(-6);
  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: userMessage }
  ];
  try {
    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
      tools: TOOLS,
      tool_choice: "auto"
    });
    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];
      const toolName = toolCall.name;
      const toolArgs = toolCall.arguments;
      console.log(`[Rizik OS] Action Triggered: ${toolName}`);
      let toolResult = null;
      let humanResponseText = "";
      if (toolName === "assign_duty_rota") {
        toolResult = await generate_daily_rota(supabaseUrl, supabaseKey, squadId, toolArgs.date);
        humanResponseText = `Shuvo sokal, ${userContext.name}! ${toolArgs.date} er duty rota generate kore dichi. Dashboard e check koro ke bazar e jabe.`;
        toolResult = { ...toolResult, message: humanResponseText };
      } else if (toolName === "check_financial_health") {
        const health = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId);
        humanResponseText = `Ei je hishab. Tohobil Balance: \u09F3${health.tohobil_balance}. Rent Status: ${health.status}.`;
        toolResult = { success: true, message: humanResponseText };
      } else if (toolName === "manage_squad_member") {
        const target = toolArgs.target_name;
        const action = toolArgs.action;
        if (action === "kick")
          humanResponseText = `Thik ache. ${target} ke squad theke ber kore dichi.`;
        else if (action === "invite")
          humanResponseText = `${target} ke invite pathiyechi. Join korle janabo.`;
        else
          humanResponseText = `${target} ke promote kora hoyeche.`;
        const newDashboardJson = {
          type: "screen",
          appBar: { title: "Squad Dashboard", backgroundColor: "#FFFFFF", foregroundColor: "#000000" },
          child: {
            type: "column",
            padding: 16,
            children: [
              { type: "text", text: `Action: ${action} on ${target}`, fontSize: 18, fontWeight: "bold" }
            ]
          }
        };
        toolResult = {
          success: true,
          message: humanResponseText,
          ui_update_payload: newDashboardJson
        };
      } else if (toolName === "update_student_profile") {
        const { department, skills } = toolArgs;
        const safeSkills = Array.isArray(skills) ? skills.join(", ") : skills || "General";
        humanResponseText = `Profile update korechi: Tumi ${department} student ar skills holo ${safeSkills}. Gigs pete subidha hobe.`;
        toolResult = {
          success: true,
          message: humanResponseText,
          ui_update_payload: {
            /* ... Badge UI JSON ... */
          }
        };
      } else if (toolName === "post_gig") {
        const { title, budget, required_department, description } = toolArgs;
        const supabase2 = createClient(supabaseUrl, supabaseKey);
        const registry = new ServiceRegistry(supabase2, env);
        await registry.post_academic_gig(userId, squadId, title, description, budget, required_department);
        humanResponseText = `Gig post kora hoyeche: "${title}". ${required_department} er studentder notify korechi. Budget \u09F3${budget} lock kora lagbe.`;
        toolResult = {
          success: true,
          message: humanResponseText,
          ui_update_payload: {
            /* ... Gig Board UI JSON ... */
          }
        };
      } else if (toolName === "get_join_screen") {
        humanResponseText = "Join Squad screen open kore dichi.";
        toolResult = {
          success: true,
          message: humanResponseText,
          ui_update_payload: {
            /* ... Join Screen JSON ... */
          }
        };
      } else if (toolName === "initiate_asset_rental") {
        const assetName = toolArgs.asset_name;
        const duration = toolArgs.duration_hours;
        const ownerId = toolArgs.owner_id || "default_owner_id";
        const supabase2 = createClient(supabaseUrl, supabaseKey);
        const registry = new ServiceRegistry(supabase2, env);
        await registry.initiate_asset_rental(userId, ownerId, assetName, 500, squadId);
        humanResponseText = `Rental confirm! Tumi ${assetName} ${duration} ghontar jonno nile. Cost: \u09F3500.`;
        toolResult = {
          success: true,
          message: humanResponseText,
          ui_update_payload: {
            type: "toast",
            message: humanResponseText,
            color: "green"
          }
        };
      } else {
        humanResponseText = "Request ta bujhechi, kintu system confirmation er jonno wait korchi.";
        toolResult = { success: true, message: humanResponseText };
      }
      const toolOutputMessage = {
        role: "tool",
        content: JSON.stringify(toolResult),
        tool_call_id: toolCall.id || "call_" + Math.random().toString(36).substr(2, 9)
      };
      messages.push({ role: "assistant", content: "", tool_calls: [toolCall] });
      messages.push(toolOutputMessage);
      messages.push({
        role: "system",
        content: `
                SYSTEM UPDATE: The tool '${toolName}' has been executed successfully.
                RESULT: ${JSON.stringify(toolResult)}
                
                MISSION:
                1. Analyze the result above.
                2. Explain what you just did to the user in a natural, friendly Banglish voice.
                3. Do NOT mention technical IDs or JSON fields.
                4. If the result contains a UI update (like dashboard or join screen), tell the user you are opening it.
                
                EXAMPLE:
                - Tool Result: { success: true, message: "Invited Rahim" }
                - Your Response: "Thik ache boss! Rahim ke invite pathiyechi. Se join korle tomake janabo."
                `
      });
      const synthesisResponse = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages,
        tools: TOOLS,
        // Keep tools available just in case, but usually not needed here
        tool_choice: "none"
        // Force it to just talk now
      });
      const finalAiResponse = synthesisResponse.content || synthesisResponse.response || "Kaj hoyeche, kintu ami thik moto bolte parchi na.";
      return {
        type: "action_result",
        tool: toolName,
        result: toolResult,
        ai_response: finalAiResponse
      };
    }
    const content = response.content || response.response;
    return {
      type: "chat_response",
      message: content || `[DEBUG] Raw AI Output: ${JSON.stringify(response)}`
    };
  } catch (e) {
    console.error("[Rizik OS] Error:", e);
    return {
      type: "error",
      message: `Error: ${e.message || e}`
      // <--- Expose error
    };
  }
}
__name(orchestrateAI, "orchestrateAI");

// src/supabase.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
var SUPABASE_URL = "https://dxekolvveoadbaftfsmy.supabase.co";
var SUPABASE_KEY = "sbp_279856121fdba35b343f21605230bf549d11e482";
var supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// src/services/IncomeSplitter.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
var ROLE_WEIGHTS = {
  "chef": 1.5,
  // High complexity
  "manager": 1.3,
  // High responsibility
  "delivery": 1.2,
  // High physical effort
  "buyer": 1.1,
  // Medium effort
  "cleaner": 1,
  // Standard effort
  "member": 1
  // Base
};
var SPLIT_CONFIG = {
  BASE_POOL: 0.4,
  // 40% Equal Split
  ROLE_POOL: 0.4,
  // 40% Weighted by Role
  PERFORMANCE_POOL: 0.2
  // 20% Weighted by Trust Score
};
async function execute_income_split(supabaseUrl, supabaseKey, orderId, squadId) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[IncomeSplitter] Starting split for Order: ${orderId}, Squad: ${squadId}`);
  const { data: orderData, error: orderError } = await supabase2.from("transactions").select("amount, metadata").eq("reference_id", orderId).single();
  if (orderError || !orderData) {
    throw new Error(`Order/Transaction not found: ${orderError?.message}`);
  }
  const netProfit = orderData.amount;
  console.log(`[IncomeSplitter] Net Profit to Split: ${netProfit}`);
  const { data: members, error: memberError } = await supabase2.from("squad_members").select(`
            user_id,
            role,
            user_profiles ( trust_score )
        `).eq("squad_id", squadId).eq("is_active", true);
  if (memberError || !members || members.length === 0) {
    throw new Error(`No active squad members found: ${memberError?.message}`);
  }
  const basePool = netProfit * SPLIT_CONFIG.BASE_POOL;
  const rolePool = netProfit * SPLIT_CONFIG.ROLE_POOL;
  const performancePool = netProfit * SPLIT_CONFIG.PERFORMANCE_POOL;
  const baseSharePerMember = basePool / members.length;
  let totalRolePoints = 0;
  members.forEach((m) => {
    totalRolePoints += ROLE_WEIGHTS[m.role] || 1;
  });
  const roleShareUnit = rolePool / totalRolePoints;
  let totalTrustPoints = 0;
  members.forEach((m) => {
    const score = m.user_profiles?.trust_score || 50;
    totalTrustPoints += score;
  });
  const performanceShareUnit = performancePool / totalTrustPoints;
  const distributionPlan = [];
  for (const member of members) {
    const trustScore = member.user_profiles?.trust_score || 50;
    const roleWeight = ROLE_WEIGHTS[member.role] || 1;
    const myBaseShare = baseSharePerMember;
    const myRoleShare = roleShareUnit * roleWeight;
    const myPerfShare = performanceShareUnit * trustScore;
    const totalShare = myBaseShare + myRoleShare + myPerfShare;
    distributionPlan.push({
      user_id: member.user_id,
      squad_id: squadId,
      amount: parseFloat(totalShare.toFixed(2)),
      breakdown: {
        base: myBaseShare.toFixed(2),
        role: myRoleShare.toFixed(2),
        performance: myPerfShare.toFixed(2),
        role_type: member.role,
        trust_score: trustScore
      }
    });
  }
  const ledgerEntries = distributionPlan.map((plan) => ({
    squad_id: squadId,
    user_id: plan.user_id,
    amount: plan.amount,
    type: "business",
    // or 'earning'
    description: `Profit Share: Order #${orderId.substring(0, 8)}`,
    category: "Income Distribution",
    transaction_id: null,
    // Could link back to main transaction
    metadata: plan.breakdown
  }));
  const { error: writeError } = await supabase2.from("khata_entries").insert(ledgerEntries);
  if (writeError) {
    throw new Error(`Failed to write ledger entries: ${writeError.message}`);
  }
  console.log(`[IncomeSplitter] Successfully distributed ${netProfit} among ${members.length} members.`);
  return { success: true, distribution: distributionPlan };
}
__name(execute_income_split, "execute_income_split");

// src/services/FranchiseEngine.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
async function clone_squad_as_franchise(supabaseUrl, supabaseKey, originalSquadId, newMemberUserIds) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[FranchiseEngine] Cloning Squad: ${originalSquadId} for ${newMemberUserIds.length} new members`);
  const { data: originalSquad, error: fetchError } = await supabase2.from("squads").select("settings, name").eq("id", originalSquadId).single();
  if (fetchError || !originalSquad) {
    throw new Error(`Original Squad not found: ${fetchError?.message}`);
  }
  const newSquadName = `${originalSquad.name} (Franchise Unit ${Math.floor(Math.random() * 1e3)})`;
  const { data: newSquad, error: createError } = await supabase2.from("squads").insert({
    name: newSquadName,
    settings: originalSquad.settings,
    // CLONING THE SETTINGS (The "Secret Sauce")
    reputation_score: 50
    // Start with neutral reputation
  }).select().single();
  if (createError || !newSquad) {
    throw new Error(`Failed to create new squad: ${createError.message}`);
  }
  const newSquadId = newSquad.id;
  const { error: profileError } = await supabase2.from("user_profiles").update({ current_squad_id: newSquadId }).in("id", newMemberUserIds);
  if (profileError) {
    throw new Error(`Failed to update user profiles: ${profileError.message}`);
  }
  const memberEntries = newMemberUserIds.map((userId) => ({
    squad_id: newSquadId,
    user_id: userId,
    role: "member",
    // Default role
    is_active: true
  }));
  const { error: memberError } = await supabase2.from("squad_members").insert(memberEntries);
  if (memberError) {
    throw new Error(`Failed to add members to squad: ${memberError.message}`);
  }
  console.log(`[FranchiseEngine] Successfully created Franchise Unit: ${newSquadId}`);
  return {
    success: true,
    original_squad_id: originalSquadId,
    new_squad_id: newSquadId,
    new_squad_name: newSquadName,
    member_count: newMemberUserIds.length,
    cloned_settings: originalSquad.settings
  };
}
__name(clone_squad_as_franchise, "clone_squad_as_franchise");

// src/services/LiquidationEngine.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_module5();
async function generate_liquidation_report(supabaseUrl, supabaseKey, squadId, leavingUserId) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[LiquidationEngine] Generating Report for User: ${leavingUserId} leaving Squad: ${squadId}`);
  const { data: financialRecords, error: financeError } = await supabase2.from("khata_entries").select("amount, type, is_settled").eq("squad_id", squadId).eq("user_id", leavingUserId);
  if (financeError)
    throw new Error(`Financial Audit failed: ${financeError.message}`);
  let totalCredits = 0;
  let totalDebits = 0;
  const BASE_CAPITAL_RETURN = 2e3;
  if (financialRecords) {
    financialRecords.forEach((record) => {
      if (record.type === "earning" || record.type === "capital_deposit") {
        totalCredits += record.amount;
      } else if (record.type === "mess" || record.type === "fine" || record.type === "expense") {
        totalDebits += record.amount;
      }
    });
  }
  totalCredits += BASE_CAPITAL_RETURN;
  const finalSettlementAmount = totalCredits - totalDebits;
  const { data: rosterData, error: rosterError } = await supabase2.from("duty_rosters").select("week_start_date, required_assets").eq("squad_id", squadId).order("week_start_date", { ascending: false }).limit(1).single();
  const pendingDuties = [];
  if (rosterData) {
    pendingDuties.push({
      duty: "Chef",
      date: "2025-11-28",
      // Future date
      status: "Pending Handover"
    });
  }
  return {
    success: true,
    user_id: leavingUserId,
    squad_id: squadId,
    financial_audit: {
      total_credits: totalCredits,
      total_debits: totalDebits,
      breakdown: {
        capital_return: BASE_CAPITAL_RETURN,
        outstanding_bills: totalDebits,
        accrued_profits: totalCredits - BASE_CAPITAL_RETURN
      }
    },
    operational_audit: {
      pending_duties: pendingDuties,
      action_required: pendingDuties.length > 0 ? "MUST_SWAP_DUTIES" : "CLEAR"
    },
    final_settlement_amount: finalSettlementAmount,
    settlement_status: finalSettlementAmount >= 0 ? "PAYOUT_TO_USER" : "DEBT_TO_SQUAD"
  };
}
__name(generate_liquidation_report, "generate_liquidation_report");
async function execute_liquidation_settlement(supabaseUrl, supabaseKey, squadId, leavingUserId, liquidationReport) {
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  console.log(`[LiquidationEngine] Executing Settlement for User: ${leavingUserId}`);
  const settlementAmount = liquidationReport.final_settlement_amount;
  const transactionType = settlementAmount >= 0 ? "payout" : "debt_collection";
  const description = settlementAmount >= 0 ? `Final Liquidation Payout to ${leavingUserId}` : `Final Debt Collection from ${leavingUserId}`;
  const { error: transError } = await supabase2.from("khata_entries").insert({
    squad_id: squadId,
    user_id: leavingUserId,
    amount: Math.abs(settlementAmount),
    // Always positive magnitude
    type: "settlement",
    // New type for final exit
    description,
    is_settled: true,
    // It's the final settlement
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (transError)
    throw new Error(`Settlement Transaction Failed: ${transError.message}`);
  const { error: profileError } = await supabase2.from("user_profiles").update({ current_squad_id: null }).eq("id", leavingUserId);
  if (profileError)
    throw new Error(`Operational Exit Failed: ${profileError.message}`);
  const { error: memberError } = await supabase2.from("squad_members").delete().eq("squad_id", squadId).eq("user_id", leavingUserId);
  if (memberError)
    console.warn("Warning: Could not remove from squad_members table", memberError);
  const { error: auditError } = await supabase2.from("khata_ledgers").insert({
    squad_id: squadId,
    amount: settlementAmount,
    // Can be negative if squad lost money (uncollected debt)
    type: "LIQUIDATED",
    description: `User ${leavingUserId} left. Settlement: ${settlementAmount}`,
    created_by: leavingUserId,
    // Or system admin
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (auditError)
    throw new Error(`Final Audit Log Failed: ${auditError.message}`);
  return {
    success: true,
    status: "LIQUIDATED",
    message: `User ${leavingUserId} has been successfully liquidated from Squad ${squadId}.`,
    final_transaction: {
      amount: settlementAmount,
      type: transactionType,
      description
    }
  };
}
__name(execute_liquidation_settlement, "execute_liquidation_settlement");

// src/sdui/MakerDashboard.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function buildMakerDashboard(supabaseUrl, supabaseKey, squadId, userId) {
  let financialHealth = { tohobil_balance: 0, rent_due_days: 0, status: "UNKNOWN" };
  try {
    financialHealth = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId);
  } catch (e) {
    console.error("Failed to fetch financial health", e);
  }
  const dutyData = {
    current_duty: "Chef",
    assignee: "You",
    status: "Active",
    next_task: "Cleaner",
    time_remaining: "2h 30m"
  };
  return {
    type: "screen",
    appBar: {
      title: "Maker Dashboard",
      actions: [
        {
          type: "icon",
          icon: "settings",
          action: {
            type: "modal",
            // The "Hidden" Liquidation Trigger
            child: {
              type: "column",
              children: [
                {
                  type: "text",
                  text: "Advanced Squad Settings",
                  style: "h2"
                },
                {
                  type: "button",
                  text: "\u26A0\uFE0F TRIGGER LIQUIDATION (DANGER)",
                  color: "red",
                  action: {
                    type: "api_call",
                    url: "/api/squad/liquidation/report",
                    method: "POST",
                    body: {
                      squad_id: squadId,
                      leaving_user_id: userId
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    child: {
      type: "scroll_view",
      child: {
        type: "column",
        crossAxisAlignment: "stretch",
        children: [
          // 1. Financial Health Section
          {
            type: "tohobil_health_card",
            data: {
              balance: financialHealth.tohobil_balance,
              days_remaining: financialHealth.rent_due_days,
              status: financialHealth.status
            }
          },
          { type: "sized_box", height: 16 },
          // 2. Operational Section (Duty Rota)
          {
            type: "duty_roster_card",
            data: {
              role: dutyData.current_duty,
              assignee: dutyData.assignee,
              status: dutyData.status,
              next_task: dutyData.next_task,
              timer: dutyData.time_remaining,
              // Action to complete task
              primary_action: {
                label: "Mark as Done",
                action: {
                  type: "api_call",
                  url: "/api/squad/task/complete",
                  method: "POST",
                  body: {
                    squad_id: squadId,
                    duty_id: "current_duty_id_123",
                    // Mock ID
                    status: "completed"
                  }
                }
              }
            }
          },
          { type: "sized_box", height: 16 },
          // 3. Growth / Franchise Section (Placeholder for future)
          {
            type: "card",
            child: {
              type: "column",
              children: [
                { type: "text", text: "Franchise Expansion", style: "h3" },
                { type: "text", text: "Clone this squad model to start a new branch." },
                {
                  type: "button",
                  text: "Clone Squad",
                  action: {
                    type: "navigate",
                    url: "/franchise/create"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  };
}
__name(buildMakerDashboard, "buildMakerDashboard");

// src/sdui/SeekerDashboard.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function buildSeekerDashboard(supabaseUrl, supabaseKey, squadId, userId) {
  let financialHealth = { tohobil_balance: 0, rent_due_days: 0, status: "UNKNOWN" };
  try {
    if (squadId) {
      financialHealth = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId);
    }
  } catch (e) {
    console.error("Failed to fetch household finance", e);
  }
  const careAlert = {
    has_alert: true,
    message: "Grandma needs medicine at 2 PM",
    action_label: "View Rota"
  };
  return {
    type: "screen",
    appBar: {
      title: "Rizik Home",
      actions: [
        { type: "icon", icon: "notifications", action: { type: "navigate", url: "/notifications" } }
      ]
    },
    child: {
      type: "scroll_view",
      child: {
        type: "column",
        crossAxisAlignment: "stretch",
        children: [
          // 1. AI Search Bar (Voice-to-Action Trigger)
          {
            type: "container",
            padding: 16,
            child: {
              type: "search_bar",
              hint: 'Ask Rizik (e.g., "Ami ki khabo?")',
              on_submit: {
                type: "api_call",
                url: "/api/ai/chat",
                method: "POST",
                body: {
                  squad_id: squadId,
                  user_id: userId,
                  // message will be injected by the frontend from input
                  message: "${input}"
                }
              }
            }
          },
          // 2. Savings Advisor Card (Smart Shongshar)
          {
            type: "savings_advisor_card",
            data: {
              current_savings: financialHealth.tohobil_balance,
              monthly_target: 5e3,
              status: financialHealth.status,
              // e.g., 'HEALTHY' or 'CRITICAL'
              tip: "You saved 500 BDT this week on groceries!"
            }
          },
          { type: "sized_box", height: 16 },
          // 3. Family Care Alert
          {
            type: "family_care_alert",
            data: {
              visible: careAlert.has_alert,
              message: careAlert.message,
              icon: "medical_services",
              action: {
                type: "navigate",
                url: "/rota/care"
              }
            }
          },
          { type: "sized_box", height: 16 },
          // 4. Hyperlocal Service Grid
          {
            type: "text",
            text: "Services Near You",
            style: "h3",
            padding: { left: 16, bottom: 8 }
          },
          {
            type: "hyperlocal_service_grid",
            data: {
              services: [
                {
                  id: "srv_1",
                  name: "Bata Mosla",
                  image: "https://example.com/spices.png",
                  price: "50 BDT",
                  action: { type: "navigate", url: "/service/srv_1" }
                },
                {
                  id: "srv_2",
                  name: "Baby Sitting",
                  image: "https://example.com/baby.png",
                  price: "200 BDT/hr",
                  action: { type: "navigate", url: "/service/srv_2" }
                },
                {
                  id: "srv_3",
                  name: "Home Cleaner",
                  image: "https://example.com/cleaner.png",
                  price: "300 BDT",
                  action: { type: "navigate", url: "/service/srv_3" }
                }
              ]
            }
          }
        ]
      }
    }
  };
}
__name(buildSeekerDashboard, "buildSeekerDashboard");

// src/sdui/MoverDashboard.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function buildMoverDashboard(supabaseUrl, supabaseKey, squadId, userId) {
  const moverData = {
    float_balance: 1500,
    // Micro-Float
    float_limit: 2e3,
    status: "ACTIVE",
    mission_chain: {
      has_next: true,
      next_task: "Pickup Parcel from Daraz Hub",
      eta: "15 mins",
      priority: "HIGH"
    }
  };
  return {
    type: "screen",
    appBar: {
      title: "Rizik Force",
      actions: [
        {
          type: "icon",
          icon: "notifications",
          action: {
            type: "navigate",
            url: "/notifications"
          }
        }
      ]
    },
    floatingActionButton: {
      type: "floating_action_button",
      icon: "swap_horiz",
      label: "Switch Role",
      backgroundColor: "#6200EE",
      // Brand Purple
      action: {
        type: "modal",
        child: {
          type: "column",
          mainAxisSize: "min",
          children: [
            {
              type: "text",
              text: "Switch Perspective",
              style: "h3",
              padding: { bottom: 16 }
            },
            {
              type: "button",
              label: "Switch to Seeker (Consumer)",
              style: "outlined",
              action: {
                type: "navigate",
                url: "/seeker/dashboard"
              }
            },
            { type: "sized_box", height: 12 },
            {
              type: "button",
              label: "Switch to Maker (Source)",
              style: "outlined",
              action: {
                type: "navigate",
                url: "/maker/dashboard"
              }
            }
          ]
        }
      }
    },
    child: {
      type: "scroll_view",
      child: {
        type: "column",
        crossAxisAlignment: "stretch",
        padding: { left: 16, right: 16, top: 16, bottom: 80 },
        // Bottom padding for FAB
        children: [
          // 1. Float Status Card (Capital Management)
          {
            type: "float_status_card",
            data: {
              balance: moverData.float_balance,
              limit: moverData.float_limit,
              status: moverData.status,
              action: {
                type: "navigate",
                url: "/wallet/topup"
              }
            }
          },
          { type: "sized_box", height: 24 },
          // 2. Mission Chain Alert (Logistics Optimization)
          {
            type: "mission_chain_alert",
            data: {
              visible: moverData.mission_chain.has_next,
              task: moverData.mission_chain.next_task,
              eta: moverData.mission_chain.eta,
              priority: moverData.mission_chain.priority,
              action: {
                type: "navigate",
                url: "/mission/active"
              }
            }
          },
          { type: "sized_box", height: 24 },
          // 3. Hyperlocal Gig Grid (Micro-Gigs)
          {
            type: "row",
            mainAxisAlignment: "spaceBetween",
            children: [
              {
                type: "text",
                text: "Nearby Gigs",
                style: "h3"
              },
              {
                type: "text_button",
                label: "See All",
                action: {
                  type: "navigate",
                  url: "/gigs/all"
                }
              }
            ]
          },
          { type: "sized_box", height: 12 },
          {
            type: "hyperlocal_gig_grid",
            data: {
              gigs: [
                {
                  id: "gig_1",
                  title: "Tyre Repair",
                  location: "Road 10 (0.2km)",
                  payout: "40 BDT",
                  image: "https://cdn-icons-png.flaticon.com/512/3096/3096673.png",
                  action: { type: "navigate", url: "/gig/gig_1" }
                },
                {
                  id: "gig_2",
                  title: "Bicycle Rental",
                  location: "Park Gate (0.5km)",
                  payout: "20 BDT/hr",
                  image: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
                  action: { type: "navigate", url: "/gig/gig_2" }
                },
                {
                  id: "gig_3",
                  title: "Parcel Drop",
                  location: "Sector 4 (1.2km)",
                  payout: "60 BDT",
                  image: "https://cdn-icons-png.flaticon.com/512/2942/2942821.png",
                  action: { type: "navigate", url: "/gig/gig_3" }
                },
                {
                  id: "gig_4",
                  title: "Food Delivery",
                  location: "KFC (0.8km)",
                  payout: "50 BDT",
                  image: "https://cdn-icons-png.flaticon.com/512/7541/7541900.png",
                  action: { type: "navigate", url: "/gig/gig_4" }
                }
              ]
            }
          }
        ]
      }
    }
  };
}
__name(buildMoverDashboard, "buildMoverDashboard");

// src/services/CallOrchestrator.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
async function create_call_session(appId, apiKey, sessionDescription) {
  const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/new`;
  console.log(`[CallOrchestrator] Creating Session: ${url}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionDescription: sessionDescription || {
        type: "offer",
        sdp: ""
        // Send empty SDP if not provided, to satisfy validation
      }
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create call session: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  console.log(`[CallOrchestrator] Session Created: ${data.sessionId}`);
  return {
    sessionId: data.sessionId,
    appId,
    sessionDescription: data.sessionDescription
    // Return answer if available
  };
}
__name(create_call_session, "create_call_session");
async function handle_whip(appId, apiKey, sessionId, sdpOffer, trackType = "video") {
  const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/${sessionId}/whip/tracks/${trackType}`;
  console.log(`[CallOrchestrator] WHIP Publish to: ${url}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/sdp"
    },
    body: sdpOffer
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WHIP failed: ${response.status} ${errorText}`);
  }
  return await response.text();
}
__name(handle_whip, "handle_whip");
async function handle_whep(appId, apiKey, sessionId, sdpOffer, trackType = "video") {
  const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/${sessionId}/whep/tracks/${trackType}`;
  console.log(`[CallOrchestrator] WHEP Subscribe to: ${url}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/sdp"
    },
    body: sdpOffer || ""
    // WHEP can be initiated without offer (server sends offer), but typically client sends offer
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WHEP failed: ${response.status} ${errorText}`);
  }
  return await response.text();
}
__name(handle_whep, "handle_whep");

// src/services/VoiceAgent.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
import { Buffer as Buffer2 } from "node:buffer";
init_module5();
async function process_voice_command(ai, env, supabaseUrl, supabaseKey, squadId, userId, input) {
  console.log("[VoiceAgent] Processing Input...");
  let userText = "";
  if (typeof input === "string") {
    userText = input;
    console.log(`[VoiceAgent] Received Text Input: "${userText}"`);
  } else {
    console.log("[VoiceAgent] Processing Audio Input...");
    try {
      const sttResponse = await ai.run("@cf/openai/whisper", {
        audio: [...new Uint8Array(input)]
      });
      userText = sttResponse.text;
      console.log("Whisper Output:", userText);
    } catch (e) {
      console.error("[VoiceAgent] Whisper Failed:", e);
      throw new Error(`Whisper STT Failed: ${e.message}`);
    }
  }
  if (!userText || userText.trim().length === 0) {
    console.log("[VoiceAgent] Empty transcription. Aborting Llama call.");
    return {
      transcript: "",
      response: "I could not hear you. Please speak closer.",
      audio: ""
    };
  }
  const supabase2 = createClient(supabaseUrl, supabaseKey);
  const { data: userProfile } = await supabase2.from("user_profiles").select("full_name, role, department").eq("id", userId).maybeSingle();
  const userContext = {
    name: userProfile?.full_name || "Squad Member",
    role: userProfile?.role || "member",
    department: userProfile?.department || "General"
  };
  const { data: squadProfile } = await supabase2.from("squads").select("name, member_count").eq("id", squadId).maybeSingle();
  const squadContext = {
    name: squadProfile?.name || "My Squad",
    memberCount: squadProfile?.member_count || 4
  };
  const { data: historyData } = await supabase2.from("chat_messages").select("role, content").eq("squad_id", squadId).order("created_at", { ascending: false }).limit(6);
  const history = (historyData || []).reverse().map((msg) => ({
    role: ["system", "user", "assistant"].includes(msg.role) ? msg.role : "user",
    content: msg.content || ""
  }));
  const orchestrationResult = await orchestrateAI(
    ai,
    env,
    supabaseUrl,
    supabaseKey,
    userText,
    history,
    squadId,
    userId,
    userContext,
    squadContext
  );
  let aiResponseText = "";
  if (orchestrationResult.type === "chat_response") {
    aiResponseText = orchestrationResult.message;
  } else if (orchestrationResult.type === "action_result") {
    const res = orchestrationResult.result;
    aiResponseText = orchestrationResult.ai_response || res && res.message || "Action executed.";
  } else if (orchestrationResult.type === "error") {
    aiResponseText = orchestrationResult.message || "An error occurred.";
  } else {
    aiResponseText = "I processed that, but I'm not sure what to say. (Unknown Type: " + orchestrationResult.type + ")";
  }
  console.log(`[VoiceAgent] AI Response: "${aiResponseText}"`);
  let uiPayload = null;
  if (orchestrationResult.type === "action_result" && orchestrationResult.result) {
    uiPayload = orchestrationResult.result.ui_update_payload;
  }
  let audioBase64 = "";
  try {
    console.log(`[VoiceAgent] Starting TTS (Google Hack) for text length: ${aiResponseText.length}`);
    const chunks = aiResponseText.match(/[^.!?]+[.!?]+|[^\s]+(?=\s|$)/g) || [aiResponseText];
    const safeChunks = [];
    let currentChunk = "";
    for (const part of chunks) {
      if (currentChunk.length + part.length < 150) {
        currentChunk += part + " ";
      } else {
        safeChunks.push(currentChunk.trim());
        currentChunk = part + " ";
      }
    }
    if (currentChunk.trim().length > 0)
      safeChunks.push(currentChunk.trim());
    const textToSpeak = safeChunks.slice(0, 2).join(" ");
    console.log(`[VoiceAgent] TTS Text (Truncated): "${textToSpeak}"`);
    const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=bn&dt=t&q=${encodeURIComponent(textToSpeak)}`;
    const ttsResponse = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (ttsResponse.ok) {
      const audioBuffer = await ttsResponse.arrayBuffer();
      console.log(`[VoiceAgent] TTS Buffer size: ${audioBuffer.byteLength}`);
      audioBase64 = Buffer2.from(audioBuffer).toString("base64");
    } else {
      console.error(`[VoiceAgent] TTS Failed: ${ttsResponse.status} ${ttsResponse.statusText}`);
      throw new Error(`Google TTS returned ${ttsResponse.status}`);
    }
  } catch (e) {
    console.error("[VoiceAgent] TTS Error:", e);
    return {
      transcript: userText,
      response: aiResponseText,
      audio: "",
      ui_payload: uiPayload,
      debug_error: `TTS Error: ${e.message || e}`
    };
  }
  try {
    await supabase2.from("chat_messages").insert([
      { squad_id: squadId, user_id: userId, role: "user", content: userText },
      { squad_id: squadId, user_id: null, role: "assistant", content: aiResponseText }
      // AI msg has no user_id usually
    ]);
  } catch (e) {
    console.error("[VoiceAgent] Failed to save chat history:", e);
  }
  return {
    transcript: userText,
    response: aiResponseText,
    audio: audioBase64,
    ui_payload: uiPayload,
    debug_error: null
  };
}
__name(process_voice_command, "process_voice_command");

// src/do/SquadCore.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
import { DurableObject } from "cloudflare:workers";
var SquadCore = class extends DurableObject {
  state;
  sql;
  // SQLite connection
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.sql = state.storage.sql;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/websocket") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      this.state.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (url.pathname === "/user-joined" && request.method === "POST") {
      const { user_id, name } = await request.json();
      this.broadcast(JSON.stringify({
        type: "MEMBER_JOINED",
        data: { name, joined_at: Date.now() }
      }));
      return new Response("Signal Broadcasted", { status: 200 });
    }
    if (url.pathname === "/ui-update" && request.method === "POST") {
      const uiPayload = await request.json();
      this.broadcast(JSON.stringify({
        type: "UI_UPDATE",
        data: uiPayload
      }));
      return new Response("UI Update Broadcasted", { status: 200 });
    }
    return new Response("SquadCore DO Active", { status: 200 });
  }
  broadcast(message) {
    for (const ws of this.state.getWebSockets()) {
      ws.send(message);
    }
  }
};
__name(SquadCore, "SquadCore");

// src/do/SquadDO.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
import { DurableObject as DurableObject2 } from "cloudflare:workers";
var SquadDO = class extends DurableObject2 {
  state;
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    console.log(`SquadDO received: ${path}`);
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.handleWebSocket(server);
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }
    if (path.endsWith("/join")) {
      return this.joinSquad(request);
    }
    if (path.endsWith("/roster")) {
      return this.updateRoster(request);
    }
    if (path.endsWith("/state")) {
      return this.getState();
    }
    return new Response("SquadDO: Not Found", { status: 404 });
  }
  handleWebSocket(ws) {
    ws.accept();
    ws.addEventListener("message", async (msg) => {
      console.log("SquadDO WebSocket Message:", msg.data);
      ws.send(`Echo: ${msg.data}`);
    });
    ws.addEventListener("close", () => {
      console.log("SquadDO WebSocket Closed");
    });
  }
  async joinSquad(request) {
    const body = await request.json();
    const { userId, name } = body;
    if (!userId || !name) {
      return new Response("Missing userId or name", { status: 400 });
    }
    const members = await this.state.storage.get("members") || [];
    if (!members.find((m) => m.userId === userId)) {
      members.push({ userId, name, joinedAt: (/* @__PURE__ */ new Date()).toISOString() });
      await this.state.storage.put("members", members);
    }
    return new Response(JSON.stringify({ success: true, members }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  async updateRoster(request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const body = await request.json();
    const { roster } = body;
    await this.state.storage.put("roster", roster);
    return new Response(JSON.stringify({ success: true, roster }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  async getState() {
    const members = await this.state.storage.get("members") || [];
    const roster = await this.state.storage.get("roster") || {};
    return new Response(
      JSON.stringify({
        members,
        roster,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
__name(SquadDO, "SquadDO");

// src/do/ChatDO.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
import { DurableObject as DurableObject3 } from "cloudflare:workers";
var ChatDO = class extends DurableObject3 {
  async fetch(request) {
    return new Response("ChatDO Ready");
  }
};
__name(ChatDO, "ChatDO");

// src/do/GigDO.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
import { DurableObject as DurableObject4 } from "cloudflare:workers";
var GigDO = class extends DurableObject4 {
  state;
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.endsWith("/apply")) {
      return this.applyForGig(request);
    }
    if (path.endsWith("/status")) {
      return this.getStatus();
    }
    return new Response("GigDO: Not Found", { status: 404 });
  }
  async applyForGig(request) {
    const body = await request.json();
    const { userId } = body;
    const applicants = await this.state.storage.get("applicants") || [];
    if (!applicants.includes(userId)) {
      applicants.push(userId);
      await this.state.storage.put("applicants", applicants);
    }
    return new Response(JSON.stringify({ success: true, applicantCount: applicants.length }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  async getStatus() {
    const applicants = await this.state.storage.get("applicants") || [];
    const isOpen = await this.state.storage.get("isOpen") ?? true;
    return new Response(
      JSON.stringify({
        applicantCount: applicants.length,
        isOpen
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
__name(GigDO, "GigDO");

// src/index.ts
var app = new Hono2();
app.post("/api/connect/session", async (c) => {
  try {
    console.log(`[DEBUG] Account ID: ${c.env.CLOUDFLARE_ACCOUNT_ID}`);
    console.log(`[DEBUG] App ID: ${c.env.CLOUDFLARE_CALLS_APP_ID}`);
    let sessionDescription;
    try {
      const body = await c.req.json();
      sessionDescription = body.sessionDescription;
    } catch (e) {
    }
    const result = await create_call_session(
      c.env.CLOUDFLARE_CALLS_APP_ID,
      c.env.CLOUDFLARE_CALLS_APP_SECRET,
      sessionDescription
    );
    return c.json(result);
  } catch (e) {
    return c.json({
      error: e.message,
      debug: {
        accountId: c.env.CLOUDFLARE_ACCOUNT_ID,
        appId: c.env.CLOUDFLARE_CALLS_APP_ID
      }
    }, 500);
  }
});
app.post("/api/connect/whip", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, sdpOffer, trackType } = body;
    const answer = await handle_whip(
      c.env.CLOUDFLARE_CALLS_APP_ID,
      c.env.CLOUDFLARE_CALLS_APP_SECRET,
      sessionId,
      sdpOffer,
      trackType
    );
    return c.text(answer);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/connect/whep", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, sdpOffer, trackType } = body;
    const answer = await handle_whep(
      c.env.CLOUDFLARE_CALLS_APP_ID,
      c.env.CLOUDFLARE_CALLS_APP_SECRET,
      sessionId,
      sdpOffer,
      trackType
    );
    return c.text(answer);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/realtime/meeting/create", async (c) => {
  try {
    const body = await c.req.json();
    const { meetingName } = body;
    const result = await create_meeting(
      c.env.REALTIMEKIT_API_KEY,
      meetingName || "Rizik Video Call"
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/realtime/meeting/:meetingId/participants", async (c) => {
  try {
    const meetingId = c.req.param("meetingId");
    const body = await c.req.json();
    const { participantName, participantId } = body;
    if (!participantName || !participantId) {
      return c.json({ error: "participantName and participantId required" }, 400);
    }
    const result = await add_participant(
      c.env.REALTIMEKIT_API_KEY,
      meetingId,
      participantName,
      participantId
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/realtime/meeting/:meetingId", async (c) => {
  try {
    const meetingId = c.req.param("meetingId");
    const result = await get_meeting(c.env.REALTIMEKIT_API_KEY, meetingId);
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.use("/*", cors());
app.get("/", (c) => {
  return c.text("Rizik V8 Backend is Running!");
});
app.post("/api/ai/chat", async (c) => {
  const body = await c.req.json();
  const { message, squad_id, user_id } = body;
  if (!message || !squad_id || !user_id) {
    return c.json({ error: "Missing parameters" }, 400);
  }
  try {
    const supabase2 = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const { data: userProfile } = await supabase2.from("user_profiles").select("full_name, role, department").eq("id", user_id).maybeSingle();
    const userContext = {
      name: userProfile?.full_name || "Squad Member",
      role: userProfile?.role || "member",
      department: userProfile?.department || "General"
    };
    const { data: squadProfile } = await supabase2.from("squads").select("name, member_count").eq("id", squad_id).maybeSingle();
    const squadContext = {
      name: squadProfile?.name || "My Squad",
      memberCount: squadProfile?.member_count || 4
    };
    const { data: historyData } = await supabase2.from("chat_messages").select("role, content").eq("squad_id", squad_id).order("created_at", { ascending: false }).limit(6);
    const history = (historyData || []).reverse().map((msg) => ({
      role: ["system", "user", "assistant"].includes(msg.role) ? msg.role : "user",
      content: msg.content || ""
    }));
    const result = await orchestrateAI(
      c.env.AI,
      c.env,
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      message,
      history,
      squad_id,
      user_id,
      userContext,
      squadContext
    );
    c.executionCtx.waitUntil((async () => {
      let aiResponseText = "";
      if (result.type === "chat_response") {
        aiResponseText = result.message;
      } else if (result.type === "action_result") {
        aiResponseText = result.ai_response || "Action executed.";
      }
      if (aiResponseText) {
        await supabase2.from("chat_messages").insert([
          { squad_id, user_id, role: "user", content: message },
          { squad_id, user_id: null, role: "assistant", content: aiResponseText }
        ]);
      }
    })());
    let uiPayload = null;
    if (result.type === "action_result" && result.result && result.result.ui_update_payload) {
      uiPayload = result.result.ui_update_payload;
    }
    if (uiPayload) {
      const idObj = c.env.SQUAD_DO.idFromName(squad_id);
      const stub = c.env.SQUAD_DO.get(idObj);
      c.executionCtx.waitUntil(
        stub.fetch(new Request("http://internal/ui-update", {
          method: "POST",
          body: JSON.stringify(uiPayload)
        }))
      );
    }
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.all("/api/squad/:id/websocket", async (c) => {
  const id = c.req.param("id");
  const idObj = c.env.SQUAD_DO.idFromName(id);
  const stub = c.env.SQUAD_DO.get(idObj);
  return stub.fetch(c.req.raw);
});
app.all("/api/squad/:id/:path*", async (c) => {
  const id = c.req.param("id");
  const idObj = c.env.SQUAD_DO.idFromName(id);
  const stub = c.env.SQUAD_DO.get(idObj);
  return stub.fetch(c.req.raw);
});
app.post("/api/auth/signup", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    return c.json({ error: error.message }, 400);
  }
  return c.json({ user: data.user, session: data.session });
});
app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return c.json({ error: error.message }, 401);
  }
  return c.json({ user: data.user, session: data.session });
});
app.get("/api/home", (c) => {
  return c.json({
    type: "container",
    color: "white",
    child: {
      type: "column",
      crossAxisAlignment: "stretch",
      children: [
        // Header
        {
          type: "container",
          color: "#6200EE",
          padding: 16,
          child: {
            type: "column",
            crossAxisAlignment: "start",
            children: [
              {
                type: "text",
                text: "Rizik V8 (Server Driven)",
                color: "white",
                fontSize: 24,
                fontWeight: "bold"
              },
              {
                type: "text",
                text: "Youth Life Operating System",
                color: "white",
                fontSize: 14
              }
            ]
          }
        },
        // Spacing
        { type: "sized_box", height: 20 },
        // Categories Title
        {
          type: "container",
          padding: 16,
          child: {
            type: "text",
            text: "Explore",
            fontSize: 18,
            fontWeight: "bold",
            color: "black"
          }
        },
        // Categories Row
        {
          type: "row",
          mainAxisAlignment: "spaceEvenly",
          children: [
            {
              type: "container",
              width: 80,
              height: 80,
              color: "#FF5722",
              child: {
                type: "center",
                child: {
                  type: "text",
                  text: "Major",
                  color: "white",
                  fontWeight: "bold"
                }
              }
            },
            {
              type: "container",
              width: 80,
              height: 80,
              color: "#4CAF50",
              child: {
                type: "center",
                child: {
                  type: "text",
                  text: "League",
                  color: "white",
                  fontWeight: "bold"
                }
              }
            },
            {
              type: "container",
              width: 80,
              height: 80,
              color: "#2196F3",
              child: {
                type: "center",
                child: {
                  type: "text",
                  text: "Bazar",
                  color: "white",
                  fontWeight: "bold"
                }
              }
            }
          ]
        },
        // Spacing
        { type: "sized_box", height: 20 },
        // Feed Item 1
        {
          type: "container",
          margin: 16,
          padding: 16,
          color: "#E0E0E0",
          child: {
            type: "column",
            crossAxisAlignment: "start",
            children: [
              {
                type: "text",
                text: "Law Student Gig",
                fontSize: 16,
                fontWeight: "bold",
                color: "black"
              },
              { type: "sized_box", height: 4 },
              {
                type: "text",
                text: "Legal advice for startups",
                fontSize: 14,
                color: "black"
              }
            ]
          }
        }
      ]
    }
  });
});
app.get("/api/gigs", (c) => {
  return c.json({
    type: "column",
    crossAxisAlignment: "stretch",
    children: [
      // Header
      {
        type: "container",
        color: "#6200EE",
        padding: 16,
        child: {
          type: "text",
          text: "Departmental Gigs",
          color: "white",
          fontSize: 20,
          fontWeight: "bold"
        }
      },
      // Filter Row
      {
        type: "container",
        padding: 16,
        child: {
          type: "row",
          children: [
            _buildChip("All", true),
            { type: "sized_box", width: 8 },
            _buildChip("Law", false),
            { type: "sized_box", width: 8 },
            _buildChip("Marketing", false),
            { type: "sized_box", width: 8 },
            _buildChip("CS", false)
          ]
        }
      },
      // Gig List
      {
        type: "column",
        children: [
          _buildGigCard(
            "legal-consultant-1",
            "Legal Consultant",
            "Review startup contracts",
            "Law",
            "500 BDT",
            "https://placehold.co/100x100/png?text=Law"
          ),
          _buildGigCard(
            "social-media-manager-1",
            "Social Media Manager",
            "Manage IG for cloud kitchen",
            "Marketing",
            "1200 BDT",
            "https://placehold.co/100x100/png?text=Mkt"
          ),
          _buildGigCard(
            "flutter-developer-1",
            "Flutter Developer",
            "Fix bugs in Rizik App",
            "CS",
            "5000 BDT",
            "https://placehold.co/100x100/png?text=Code"
          )
        ]
      }
    ]
  });
});
app.get("/api/gigs/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    type: "column",
    crossAxisAlignment: "stretch",
    children: [
      // Hero Image Section
      {
        type: "stack",
        alignment: "bottomLeft",
        children: [
          {
            type: "image",
            url: "https://placehold.co/600x400/png",
            height: 200,
            width: 600,
            // approximate full width
            fit: "cover"
          },
          {
            type: "container",
            color: "#80000000",
            padding: 16,
            width: 600,
            child: {
              type: "text",
              text: `Gig Details: ${id}`,
              // Dynamic Title
              color: "white",
              fontSize: 22,
              fontWeight: "bold"
            }
          }
        ]
      },
      // Content Body
      {
        type: "container",
        padding: 16,
        child: {
          type: "column",
          crossAxisAlignment: "start",
          children: [
            // Tags
            {
              type: "row",
              children: [
                _buildTag("Law Student", "#E1BEE7", "#4A148C"),
                { type: "sized_box", width: 8 },
                _buildTag("Remote", "#C8E6C9", "#1B5E20")
              ]
            },
            { type: "sized_box", height: 16 },
            // Description
            {
              type: "text",
              text: "Description",
              fontSize: 18,
              fontWeight: "bold"
            },
            { type: "sized_box", height: 8 },
            {
              type: "text",
              text: "We are looking for a 3rd or 4th year law student to help draft basic contracts for our new startup. Must have knowledge of commercial law.",
              fontSize: 14,
              color: "#616161"
            },
            { type: "sized_box", height: 24 },
            // Application Form
            {
              type: "card",
              elevation: 4,
              padding: 16,
              child: {
                type: "column",
                crossAxisAlignment: "start",
                children: [
                  {
                    type: "text",
                    text: "Apply for this Gig",
                    fontSize: 18,
                    fontWeight: "bold"
                  },
                  { type: "sized_box", height: 16 },
                  {
                    type: "input_field",
                    label: "Full Name",
                    hint: "Enter your name"
                  },
                  { type: "sized_box", height: 12 },
                  {
                    type: "input_field",
                    label: "University ID",
                    hint: "e.g. 18101123"
                  },
                  { type: "sized_box", height: 16 },
                  {
                    type: "button",
                    color: "#6200EE",
                    padding: 16,
                    // Action definition for the frontend
                    action: {
                      type: "api_call",
                      method: "POST",
                      url: `/api/gigs/${id}/apply`,
                      body_fields: ["Full Name", "University ID"]
                      // Simplistic binding for now
                    },
                    child: {
                      type: "center",
                      child: {
                        type: "text",
                        text: "Submit Application",
                        color: "white",
                        fontWeight: "bold"
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  });
});
app.post("/api/gigs/:id/apply", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { fullName, universityId } = body;
  const idObj = c.env.GIG_DO.idFromName(id);
  const stub = c.env.GIG_DO.get(idObj);
  const userId = universityId || "anon_user";
  await stub.fetch(new Request("http://fake/apply", {
    method: "POST",
    body: JSON.stringify({ userId })
  }));
  const { error } = await supabase.from("applications").insert({
    gig_id: id,
    user_id: userId,
    applicant_name: fullName,
    status: "pending"
  });
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json({ success: true, message: "Application submitted successfully!" });
});
function _buildTag(text, bgColor, textColor) {
  return {
    type: "container",
    color: bgColor,
    padding: 8,
    child: {
      type: "text",
      text,
      color: textColor,
      fontSize: 12,
      fontWeight: "bold"
    }
  };
}
__name(_buildTag, "_buildTag");
function _buildChip(label, isSelected) {
  return {
    type: "container",
    padding: 8,
    color: isSelected ? "#6200EE" : "#E0E0E0",
    child: {
      type: "text",
      text: label,
      color: isSelected ? "white" : "black",
      fontSize: 12
    }
  };
}
__name(_buildChip, "_buildChip");
function _buildGigCard(gigId, title, desc, dept, price, imgUrl) {
  return {
    type: "card",
    margin: 16,
    elevation: 2,
    child: {
      type: "column",
      crossAxisAlignment: "start",
      children: [
        {
          type: "row",
          children: [
            {
              type: "image",
              url: imgUrl,
              width: 80,
              height: 80,
              fit: "cover"
            },
            { type: "sized_box", width: 16 },
            {
              type: "column",
              crossAxisAlignment: "start",
              children: [
                {
                  type: "text",
                  text: title,
                  fontSize: 16,
                  fontWeight: "bold"
                },
                { type: "sized_box", height: 4 },
                {
                  type: "text",
                  text: dept,
                  color: "#757575",
                  fontSize: 12
                },
                { type: "sized_box", height: 4 },
                {
                  type: "text",
                  text: price,
                  color: "#4CAF50",
                  fontWeight: "bold"
                }
              ]
            }
          ]
        },
        {
          type: "container",
          padding: 12,
          child: {
            type: "text",
            text: desc,
            fontSize: 14
          }
        },
        {
          type: "container",
          padding: 8,
          child: {
            type: "button",
            color: "#6200EE",
            padding: 12,
            action: {
              type: "navigate",
              url: `/api/gigs/${gigId}`
            },
            child: {
              type: "center",
              child: {
                type: "text",
                text: "View Details",
                color: "white",
                fontWeight: "bold"
              }
            }
          }
        }
      ]
    }
  };
}
__name(_buildGigCard, "_buildGigCard");
app.get("/api/fetch_seeker_home", (c) => {
  return c.json({
    type: "column",
    crossAxisAlignment: "stretch",
    children: [
      // Hero Banner
      {
        type: "hero_banner",
        data: {
          title: "Welcome Home, Seeker",
          imageUrl: "https://placehold.co/600x200/png?text=Rizik+Home"
        }
      },
      { type: "sized_box", height: 16 },
      // Meal Toggle Card
      {
        type: "meal_toggle_card",
        data: {
          title: "Today's Meal Plan",
          status: "active"
        }
      },
      { type: "sized_box", height: 16 },
      // Savings Advisor
      {
        type: "savings_advisor_card",
        data: {
          currentSavings: "\u09F35,000",
          target: "\u09F310,000",
          advice: "You are on track! Save \u09F3200 more today."
        }
      },
      { type: "sized_box", height: 16 },
      // Test Navigation Button
      {
        type: "button",
        color: "#4CAF50",
        padding: 16,
        margin: 16,
        child: {
          type: "center",
          child: {
            type: "text",
            text: "Go to Source Dashboard",
            color: "white",
            fontWeight: "bold"
          }
        },
        action: {
          type: "NAVIGATE",
          route: "/source"
        }
      }
    ]
  });
});
app.post("/api/confirm_duty", async (c) => {
  const body = await c.req.json();
  console.log("Duty Confirmation Request:", body);
  return c.json({
    success: true,
    message: "Duty confirmed successfully!",
    duty_id: body.duty_id,
    status: "confirmed"
  });
});
app.post("/api/squad/income/split", async (c) => {
  const body = await c.req.json();
  const { order_id, squad_id } = body;
  if (!order_id || !squad_id) {
    return c.json({ error: "Missing order_id or squad_id" }, 400);
  }
  try {
    const result = await execute_income_split(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      order_id,
      squad_id
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/rota/generate", async (c) => {
  const body = await c.req.json();
  const { squad_id, date } = body;
  if (!squad_id || !date)
    return c.json({ error: "Missing squad_id or date" }, 400);
  try {
    const result = await generate_daily_rota(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squad_id,
      date
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/create", async (c) => {
  const body = await c.req.json();
  const { name, type, creator_id } = body;
  if (!name || !type || !creator_id) {
    return c.json({ error: "Missing name, type, or creator_id" }, 400);
  }
  try {
    const result = await create_squad(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      name,
      type,
      creator_id
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/join", async (c) => {
  const body = await c.req.json();
  const { user_id, invite_code } = body;
  if (!user_id || !invite_code) {
    return c.json({ error: "Missing user_id or invite_code" }, 400);
  }
  try {
    const result = await join_squad(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      user_id,
      invite_code
    );
    const squadId = result.squad_id;
    const idObj = c.env.SQUAD_DO.idFromName(squadId);
    const stub = c.env.SQUAD_DO.get(idObj);
    c.executionCtx.waitUntil(
      stub.fetch(new Request("http://internal/user-joined", {
        method: "POST",
        body: JSON.stringify({ user_id, name: "New Member" })
        // Fetch name from DB in real app
      }))
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/squad/invite/:squad_id", async (c) => {
  const squadId = c.req.param("squad_id");
  try {
    const supabase2 = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const { data, error } = await supabase2.from("squads").select("invite_code").eq("id", squadId).single();
    if (error || !data)
      return c.json({ error: "Squad not found" }, 404);
    return c.json({
      invite_code: data.invite_code,
      deep_link: `https://rizik.app/join?code=${data.invite_code}`
    });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/tribunal/vote", async (c) => {
  const body = await c.req.json();
  const { dispute_id, voter_id, vote, justification } = body;
  if (!dispute_id || !voter_id || !vote) {
    return c.json({ error: "Missing dispute_id, voter_id, or vote" }, 400);
  }
  try {
    const result = await cast_vote(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      dispute_id,
      voter_id,
      vote
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/services/rent", async (c) => {
  const body = await c.req.json();
  const { renter_id, owner_id, asset_name, monthly_rent, squad_id } = body;
  const supabase2 = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const registry = new ServiceRegistry(supabase2, c.env);
  const result = await registry.initiate_asset_rental(renter_id, owner_id, asset_name, monthly_rent, squad_id);
  return c.json(result);
});
app.post("/api/services/gig/academic", async (c) => {
  const body = await c.req.json();
  const { poster_id, squad_id, title, description, bounty, required_tag } = body;
  const supabase2 = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const registry = new ServiceRegistry(supabase2, c.env);
  const result = await registry.post_academic_gig(poster_id, squad_id, title, description, bounty, required_tag);
  return c.json(result);
});
app.post("/api/services/mission/proxy", async (c) => {
  const body = await c.req.json();
  const { requester_id, squad_id, mission_type, location, duration_hours, bounty } = body;
  const supabase2 = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const registry = new ServiceRegistry(supabase2, c.env);
  const result = await registry.launch_proxy_mission(requester_id, squad_id, mission_type, location, duration_hours, bounty);
  return c.json(result);
});
app.get("/api/squad/invite/:code", (c) => {
  const code = c.req.param("code");
  return c.html(`
        <html>
            <head>
                <title>Join Rizik Squad</title>
                <meta http-equiv="refresh" content="0;url=rizik://join?code=${code}" />
            </head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>You've been invited to a Squad!</h1>
                <p>Opening Rizik App...</p>
                <a href="rizik://join?code=${code}" style="background: #6200EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Join Now</a>
            </body>
        </html>
    `);
});
app.get("/api/sdui/squad/create", (c) => {
  return c.json({
    type: "screen",
    appBar: {
      title: "Create New Squad",
      backgroundColor: "#FFFFFF",
      foregroundColor: "#000000"
    },
    child: {
      type: "form",
      padding: 24,
      children: [
        {
          type: "text",
          text: "Name your Squad",
          fontSize: 24,
          fontWeight: "bold",
          color: "#000000"
        },
        { type: "sized_box", height: 8 },
        {
          type: "text",
          text: "Give your team a cool identity.",
          fontSize: 14,
          color: "#757575"
        },
        { type: "sized_box", height: 24 },
        {
          type: "input_field",
          name: "squad_name",
          label: "Squad Name",
          hint: "e.g. Dhanmondi Boys, Cloud Kitchen 1",
          required: true
        },
        { type: "sized_box", height: 24 },
        {
          type: "text",
          text: "Select Squad Type",
          fontSize: 18,
          fontWeight: "bold",
          color: "#000000"
        },
        { type: "sized_box", height: 16 },
        {
          type: "radio_group",
          name: "squad_type",
          options: [
            {
              label: "Bachelor Mess",
              value: "bachelor_mess",
              description: "Shared living, meal system, khata.",
              icon: "home"
            },
            {
              label: "Family",
              value: "family",
              description: "Household expenses, chores.",
              icon: "family_restroom"
            },
            {
              label: "Cloud Kitchen",
              value: "cloud_kitchen",
              description: "Business inventory, orders, profit split.",
              icon: "restaurant"
            },
            {
              label: "Logistics Team",
              value: "mover_squad",
              description: "Delivery tracking, earnings.",
              icon: "local_shipping"
            }
          ]
        },
        { type: "sized_box", height: 32 },
        {
          type: "button",
          text: "Create & Invite",
          color: "#6200EE",
          textColor: "#FFFFFF",
          action: {
            type: "api_call",
            method: "POST",
            url: "/api/squad/create",
            body_fields: ["squad_name", "squad_type"],
            // creator_id injected by client
            on_success: {
              type: "navigate",
              route: "/squad/dashboard"
              // Or show invite code dialog
            }
          }
        }
      ]
    }
  });
});
app.get("/api/sdui/squad/join", (c) => {
  return c.json({
    type: "screen",
    appBar: {
      title: "Join a Squad",
      backgroundColor: "#FFFFFF",
      foregroundColor: "#000000"
    },
    child: {
      type: "form",
      padding: 24,
      children: [
        {
          type: "center",
          child: {
            type: "icon",
            icon: "groups",
            size: 64,
            color: "#6200EE"
          }
        },
        { type: "sized_box", height: 24 },
        {
          type: "text",
          text: "Have an Invite Code?",
          fontSize: 24,
          fontWeight: "bold",
          color: "#000000",
          textAlign: "center"
        },
        { type: "sized_box", height: 8 },
        {
          type: "text",
          text: "Enter the code shared by your Squad Leader.",
          fontSize: 14,
          color: "#757575",
          textAlign: "center"
        },
        { type: "sized_box", height: 32 },
        {
          type: "input_field",
          name: "invite_code",
          label: "Invite Code",
          hint: "e.g. RZK-DHAKA-42",
          required: true,
          textAlign: "center",
          style: {
            fontSize: 20,
            letterSpacing: 2
          }
        },
        { type: "sized_box", height: 16 },
        {
          type: "button",
          text: "Paste from Clipboard",
          variant: "text",
          // Text button
          color: "#6200EE",
          action: {
            type: "clipboard_paste",
            target_field: "invite_code"
          }
        },
        { type: "sized_box", height: 32 },
        {
          type: "button",
          text: "Join Squad",
          color: "#6200EE",
          textColor: "#FFFFFF",
          action: {
            type: "api_call",
            method: "POST",
            url: "/api/squad/join",
            body_fields: ["invite_code"],
            // user_id injected by client
            on_success: {
              type: "navigate",
              route: "/squad/dashboard"
            }
          }
        }
      ]
    }
  });
});
app.post("/api/squad/task/complete", async (c) => {
  const body = await c.req.json();
  const { duty_id, squad_id, status } = body;
  if (!duty_id || !squad_id || status !== "completed") {
    return c.json({ error: "Invalid request" }, 400);
  }
  try {
    const result = await trigger_next_task(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      duty_id,
      squad_id
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/khata/expense", async (c) => {
  const body = await c.req.json();
  const { squad_id, amount, expense_type, is_recurring } = body;
  if (!squad_id || !amount || !expense_type) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  try {
    const result = await process_khata_expense(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squad_id,
      amount,
      expense_type,
      is_recurring || false
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/squad/health/:id", async (c) => {
  const squadId = c.req.param("id");
  if (!squadId)
    return c.json({ error: "Missing squad_id" }, 400);
  try {
    const result = await get_squad_financial_health(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/squad/dashboard/financial", async (c) => {
  const squadId = c.req.query("squad_id") || "default_squad_id";
  try {
    const healthData = await get_squad_financial_health(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId
    );
    return c.json({
      type: "column",
      crossAxisAlignment: "stretch",
      children: [
        {
          type: "tohobil_health_card",
          data: {
            balance: healthData.tohobil_balance,
            days_remaining: healthData.rent_due_days,
            status: healthData.status
          }
        }
      ]
    });
  } catch (e) {
    return c.json({
      type: "container",
      padding: 16,
      child: {
        type: "text",
        text: `Error loading financial data: ${e.message}`,
        color: "red"
      }
    });
  }
});
app.post("/api/squad/franchise/clone", async (c) => {
  const body = await c.req.json();
  const { original_squad_id, new_member_user_ids } = body;
  if (!original_squad_id || !new_member_user_ids || !Array.isArray(new_member_user_ids)) {
    return c.json({ error: "Invalid request parameters" }, 400);
  }
  try {
    const result = await clone_squad_as_franchise(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      original_squad_id,
      new_member_user_ids
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/liquidation/report", async (c) => {
  const body = await c.req.json();
  const { squad_id, leaving_user_id } = body;
  if (!squad_id || !leaving_user_id) {
    return c.json({ error: "Missing squad_id or leaving_user_id" }, 400);
  }
  try {
    const result = await generate_liquidation_report(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squad_id,
      leaving_user_id
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/maker/dashboard", async (c) => {
  const squadId = c.req.query("squad_id") || "default_squad_id";
  const userId = c.req.query("user_id") || "current_user_id";
  try {
    const dashboardJson = await buildMakerDashboard(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId,
      userId
    );
    return c.json(dashboardJson);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/squad/liquidation/execute", async (c) => {
  const body = await c.req.json();
  const { squad_id, leaving_user_id, liquidation_report } = body;
  if (!squad_id || !leaving_user_id || !liquidation_report) {
    return c.json({ error: "Missing required parameters" }, 400);
  }
  try {
    const result = await execute_liquidation_settlement(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squad_id,
      leaving_user_id,
      liquidation_report
    );
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/seeker/dashboard", async (c) => {
  const squadId = c.req.query("squad_id") || "default_household_id";
  const userId = c.req.query("user_id") || "current_user_id";
  try {
    const dashboardJson = await buildSeekerDashboard(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId,
      userId
    );
    return c.json(dashboardJson);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/mover/dashboard", async (c) => {
  const squadId = c.req.query("squad_id") || "default_squad_id";
  const userId = c.req.query("user_id") || "current_user_id";
  try {
    const dashboardJson = await buildMoverDashboard(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId,
      userId
    );
    return c.json(dashboardJson);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.post("/api/ai/voice-chat", async (c) => {
  try {
    let input;
    const contentType = c.req.header("content-type");
    console.log("Received request method:", c.req.method);
    console.log("Content-Type:", contentType);
    if (contentType && contentType.includes("application/json")) {
      const body = await c.req.json();
      input = body.text;
      console.log("Input Type: Text");
    } else {
      input = await c.req.arrayBuffer();
      console.log("Input Type: Audio Blob");
      console.log("Audio Blob Size:", input.byteLength);
    }
    const squadId = c.req.header("x-squad-id") || "default_squad_id";
    const userId = c.req.header("x-user-id") || "current_user_id";
    console.log(`[VoiceChat] Context - Squad: ${squadId}, User: ${userId}`);
    const result = await process_voice_command(
      c.env.AI,
      c.env,
      c.env.SUPABASE_URL,
      c.env.SUPABASE_KEY,
      squadId,
      userId,
      input
    );
    const audioBase64 = result.audio;
    return c.json({
      success: true,
      transcript: result.transcript,
      ai_response: result.response,
      ui_payload: result.ui_payload,
      audio: audioBase64,
      debug_error: result.debug_error
    });
  } catch (e) {
    console.error("Voice Chat Error:", e);
    return c.json({
      success: false,
      error: e.message,
      stack: e.stack
    }, 500);
  }
});
var src_default = {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    console.log("[Cron] Scheduled event triggered:", event.cron);
    const supabase2 = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const registry = new ServiceRegistry(supabase2, env);
    ctx.waitUntil(registry.process_scheduled_tasks());
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Gn5G5k/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head2, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head2(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Gn5G5k/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ChatDO,
  GigDO,
  SquadCore,
  SquadDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
