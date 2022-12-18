import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import zip from "rollup-plugin-zip";
import replace from "@rollup/plugin-replace";
import strip from "@rollup/plugin-strip";
import typescript from "@rollup/plugin-typescript";
import dotenv from "dotenv";
import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";

dotenv.config();

const isProduction = process.env.NODE_ENV == "production";

export default {
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    isProduction &&
      strip({
        include: ["**/*.ts"],
      }),
    replace({
      SET_ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      preventAssignment: true,
    }),
    typescript(),
    chromeExtension(),
    simpleReloader(),
    resolve(),
    commonjs(),
    isProduction && zip({ dir: "releases" }),
  ],
};
