import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    name: "custom-overrides",
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default config;
