/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { defineConfig } from "tsdown";

const OUT_DIR = "./dist";
const ADOBE_LICENSE_BANNER = `
/**
 * @license
 * 
 * Copyright ${new Date().getFullYear()} Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
`.trimStart();

export default defineConfig({
  banner: {
    dts: ADOBE_LICENSE_BANNER,
    js: ADOBE_LICENSE_BANNER,
  },
  dts: true,
  entry: [
    "./source/index.ts",
    "./source/otel.ts",
    "./source/integrations/index.ts",
  ],

  failOnWarn: "ci-only",

  format: {
    cjs: {
      outputOptions: {
        dir: `${OUT_DIR}/cjs`,
      },
    },
    esm: {
      outputOptions: {
        dir: `${OUT_DIR}/es`,
      },
    },
  },
  minify: {
    compress: true,
  },

  nodeProtocol: "strip",
  outputOptions: {
    dir: OUT_DIR,
    legalComments: "inline",

    minifyInternalExports: true,
  },

  publint: true,
  treeshake: true,
});
