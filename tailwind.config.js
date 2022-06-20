module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // For styling scroll bars
    require("tailwind-scrollbar"),
    // For truncating long lines into X number of lines - "line-clamp-X"
    require("@tailwindcss/line-clamp"),
  ],
  darkMode: "class",
  variants: {
    scrollbar: ["rounded"],
  },
  corePlugins: {
    preflight: true,
  },
};
