!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("lodash"),require("redux")):"function"==typeof define&&define.amd?define(["lodash","redux"],t):"object"==typeof exports?exports.reducerlessRedux=t(require("lodash"),require("redux")):e.reducerlessRedux=t(e.lodash,e.redux)}(window,function(e,t){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(t,r){t.exports=e},function(e,r){e.exports=t},function(e,t,r){"use strict";r.r(t);var n=r(1),o=r(0),u=r.n(o);const i={};function c(e){return e}function a(e){"function"!=typeof e&&(console.warn("WARNING: Ignoring an attempt to cache a non-function."),e=c);let t=`// fn: ${+new Date}-${r=8,parseInt(new Array(r).fill("").map(()=>Math.floor(10*Math.random())).join(""))}\n`+e.toString();var r;return i[t]=e,t}function l(e){return"function"==typeof e?e:"string"==typeof e?i[e]:c}function f(e,t){function r(r,n){let o=u.a.get(n,"meta.nbpr");return t&&!o?t(r,n):function(e,t=null,r){const{path:n=null,value:o=null,fn:i=null}=u.a.get(r,"payload",{});if(u.a.get(r,"meta.nbpr")===e){let e=u.a.cloneDeep(t);if(null!==n)if(null===e&&(e={}),"object"!=typeof e)console.error(`Could not set path ${n}: state must be an object, got ${t}.`),e=t;else if(i){const t=u.a.get(e,n);u.a.set(e,n,l(i)(t))}else u.a.set(e,n,o);else e=i?l(i)(e):o;return e}return t}(e,r,n)}return r.reducerless=!0,r}function s(e,t,r){if(t&&e&&"string"==typeof e){if(!t[e])return t[e]=f(e),r&&r.replaceReducer(r.reducerCombiner(t)),!0;if(!t[e].reducerless)return t[e]=f(e,t[e]),r&&r.replaceReducer(r.reducerCombiner(t)),!0}return!1}const d=(e={})=>{const{reducers:t={},reducerCombiner:r=n.combineReducers,preloadedState:o={},enhancer:i}=e;Object.keys(o).forEach(e=>s(e,t)),Object.keys(t).length||(t.redux_loaded=(()=>!0));let c=Object(n.createStore)(r(t),o,i);return c.select=function(e,t){let r=this;if("string"!=typeof e||!e)throw new Error("stateKey must be a non-empty string");return{set(n,o={}){s(e,r.reducers,r);let i=n,c=void 0;"function"==typeof n&&(i=void 0,c=a(n));let f=`SET_${e.toUpperCase()}`,d=o;"string"==typeof o&&(f+=`_${o.toUpperCase()}`,d={});const p={type:f},y={payload:{path:t,value:i,fn:c},meta:{nbpr:e}},b=u.a.merge(p,d,y);return r.dispatch(b),u.a.set(u.a.cloneDeep(b),"payload.fn",l(c))}}}.bind(c),c.reducers=t,c.reducerCombiner=r,c};r.d(t,"initializeStore",function(){return d})}])});