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

import { readdir, rename } from "node:fs/promises";

import { defineConfig } from "tsdown";

const OUT_DIR = "./dist";
export default defineConfig({
  entry: ["./source/index.ts", "./source/otel.ts"],
  format: ["cjs", "esm"],

  outputOptions: {
    legalComments: "inline",
    dir: OUT_DIR,
  },

  dts: true,
  treeshake: true,

  hooks: {
    "build:before": (ctx) => {
      if (ctx.buildOptions.output) {
        // Move each output into its own directory.
        const { format } = ctx.buildOptions.output;
        ctx.buildOptions.output.dir += `/${format}`;
      }
    },

    "build:done": async (_) => {
      // For some reason the types for CJS are being placed out of the CJS directory.
      // This is a workaround to move them into the CJS directory.
      const files = await readdir(OUT_DIR);
      const ctsFiles = files.filter((file) => file.endsWith(".d.cts"));

      const renamePromises = ctsFiles.map((file) => {
        const sourcePath = `${OUT_DIR}/${file}`;
        const targetPath = `${OUT_DIR}/cjs/${file}`;
        return rename(sourcePath, targetPath);
      });

      await Promise.all(renamePromises);
    },
  },
});
