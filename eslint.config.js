import nodeConfig from "@chyzwar/eslint-config/node";

export default [
  ...nodeConfig,
  {
    ignores: ["**/lib/"],
  },
  {
    files: ["packages/*/src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: [
          "./packages/*/tsconfig.json",
        ],
      },
    },
    rules: {
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
    },
  },
]; 
