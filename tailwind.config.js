/** @type {import('tailwindcss').Config} */
// NativeWind requires its preset to be included in the Tailwind config.
// Without this, importing the Metro config will throw an error and
// force Metro to fall back to dynamic `import(...)`, which fails on
// Windows because the absolute path is treated as an unsupported URL
// scheme ('c:' protocol). Adding the preset lets `require()` succeed
// and avoids the ESM loader issue.
/** @type {import('tailwindcss').Config} */
module.exports = {
  // the preset package exports a compiled Tailwind config helper
  // which is what NativeWind expects. `nativewind/tailwind` is
  // not a published path so we load the `preset` package instead.
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
