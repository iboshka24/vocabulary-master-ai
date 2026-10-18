/* Reading comfort settings: theme (system / light / dark), text size (S–XL), high contrast and wider
   letter/line spacing. Stored in localStorage "vm.display"; the tiny inline script in <head> applies the
   same rules before the first paint (test/display.js runs that script and checks it agrees with resolve()). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VMDisplay = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var KEY = 'vm.display', LEGACY_THEME = 'vm.theme';
  var THEMES = ['system', 'light', 'dark'], SIZES = ['s', 'm', 'l', 'xl'];
  var DEFAULTS = { theme: 'light', size: 'm', contrast: false, spacing: false };

  // Anything unknown falls back to a default; before v2.15 only "vm.theme" (light/dark) existed.
  function normalize(raw, legacyTheme) {
    var o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var legacy = legacyTheme === 'dark' || legacyTheme === 'light' ? legacyTheme : DEFAULTS.theme;
    return {
      theme: THEMES.indexOf(o.theme) >= 0 ? o.theme : legacy,
      size: SIZES.indexOf(o.size) >= 0 ? o.size : DEFAULTS.size,
      contrast: o.contrast === true,
      spacing: o.spacing === true
    };
  }
  // The data-* attributes the CSS reacts to (null = attribute absent).
  function resolve(settings, prefersDark) {
    var s = normalize(settings);
    return {
      theme: s.theme === 'system' ? (prefersDark ? 'dark' : 'light') : s.theme,
      size: s.size === 'm' ? null : s.size,
      contrast: s.contrast ? 'high' : null,
      spacing: s.spacing ? 'wide' : null
    };
  }
  function apply(el, resolved) {
    el.dataset.theme = resolved.theme;
    ['size', 'contrast', 'spacing'].forEach(function (k) {
      if (resolved[k]) el.dataset[k] = resolved[k]; else delete el.dataset[k];
    });
  }
  function load(storage) {
    var legacy = null;
    try { legacy = storage.getItem(LEGACY_THEME); return normalize(JSON.parse(storage.getItem(KEY) || 'null'), legacy); }
    catch (e) { return normalize(null, null); }
  }
  function save(storage, settings) {
    try { storage.setItem(KEY, JSON.stringify(normalize(settings))); return true; } catch (e) { return false; }
  }
  return { KEY: KEY, THEMES: THEMES, SIZES: SIZES, DEFAULTS: DEFAULTS, normalize: normalize, resolve: resolve, apply: apply, load: load, save: save };
});
