/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const changeInstanceStateInputs: JsonLS.JSONSchema = {
    description:
        "Changes or asserts the state of the instance.\n\nThis action can be used in assert mode (do not run the API to change the state but verify the instance is in the desired state.) To use assert mode, set the CheckStateOnly parameter to true. This mode is useful when running the Sysprep command on Windows, which is an asynchronous command that can run in the background for a long time. You can ensure that the instance is stopped before you create an AMI.",
    properties: {
        inputs: {
            properties: {
                InstanceIds: {
                    description: "The IDs of the instances.",
                },
                CheckStateOnly: {
                    description:
                        "If false, sets the instance state to the desired state. If true, asserts the desired state using polling.",
                    type: ["boolean", "string"],
                    default: false,
                },
                DesiredState: {
                    description:
                        "The desired state. When set to running, this action waits for the Amazon EC2 state to be Running, the Instance Status to be OK, and the System Status to be OK before completing.",
                    type: "string",
                    oneOf: [
                        {
                            enum: ["running", "stopped", "terminated"],
                        },
                        {
                            pattern: "^{{[ ]{0,1}[a-zA-Z_.]+[ ]{0,1}}}$",
                        },
                    ],
                },
                Force: {
                    description:
                        "If set, forces the instances to stop. The instances do not have an opportunity to flush file system caches or file system metadata. If you use this option, you must perform file system check and repair procedures. This option is not recommended for EC2 instances for Windows Server.",
                    type: ["string", "boolean"],
                },
            },
            required: ["InstanceIds", "DesiredState"],
        },
    },
};

export const changeInstanceStateSnippet: SnippetDefinition = {
    label: "Snippet: aws:changeInstanceState",
    description:
        "Changes or asserts the state of the instance.\n\nThis action can be used in assert mode (do not run the API to change the state but verify the instance is in the desired state.) To use assert mode, set the CheckStateOnly parameter to true. This mode is useful when running the Sysprep command on Windows, which is an asynchronous command that can run in the background for a long time. You can ensure that the instance is stopped before you create an AMI.",
    body: {
        name: "${1:changeInstanceState}",
        action: "aws:changeInstanceState",
        maxAttempts: 3,
        timeoutSeconds: 3600,
        onFailure: "Abort",
        inputs: {
            InstanceIds: ["i-1234567890abcdef0"],
            CheckStateOnly: true,
            DesiredState: "stopped",
        },
    },
};
