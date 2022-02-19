module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // For styling scroll bars
    require("tailwind-scrollbar"),
  ],
  variants: {
    scrollbar: ["rounded"],
  },
  corePlugins: {
    preflight: true,
  },
};
