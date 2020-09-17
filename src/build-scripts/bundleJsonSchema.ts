/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import path from "path";
import fs from "fs";
import { ssmDocumentSchema } from "../schema/ssmDocumentSchema";

const args = process.argv.slice(2);
if (args.length != 1) {
    throw new Error("Invalid command arguments. Expecting one argument for the output file.");
}
const fileRelativePath = args[0];
const fileAbsolutePath = path.resolve(fileRelativePath);
console.log(`Saving JSON schema to "${fileAbsolutePath}"`);

const jsonSchemaContent = JSON.stringify(ssmDocumentSchema);

fs.writeFileSync(fileAbsolutePath, jsonSchemaContent, "utf8");
