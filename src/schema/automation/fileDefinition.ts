/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../ssmLanguageService";

export const fileDefinition: JsonLS.JSONSchema = {
    type: "object",
    description: "Attachment definition.",
    required: ["checksums"],
    properties: {
        checksums: {
            type: "object",
            description: "Checksums of the attachment.",
            required: ["sha256"],
            properties: {
                sha256: {
                    type: "string",
                    description: "SHA256 hash of the attachment content",
                    minLength: 64,
                    maxLength: 64,
                    pattern: "[A-Fa-f0-9]{64}",
                },
            },
            additionalProperties: false,
        },
    },
    additionalProperties: false,
};
