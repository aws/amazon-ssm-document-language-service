/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const runCommandInputs: JsonLS.JSONSchema = {
    description:
        "Runs the specified commands.\n\nAutomation only supports output of one Run Command action. A document can include multiple Run Command actions, but output is supported for only one action at a time.",
    properties: {
        inputs: {
            properties: {
                DocumentName: {
                    description: "The name of the Run Command document.",
                    type: "string",
                },
                InstanceIds: {
                    description:
                        "The instance IDs where you want the command to run. You can specify a maximum of 50 IDs.\n\nYou can also use the pseudo parameter {{RESOURCE_ID}} in place of instance IDs to more easily run the command on all instances in the target group.\n\nAnother alternative is to send commands to a fleet of instances by using the Targets parameter. The Targets parameter accepts Amazon EC2 tags.",
                    type: ["string", "array"],
                    items: {
                        type: "string",
                    },
                },
                Targets: {
                    description:
                        "An array of search criteria that targets instances by using a Key,Value combination that you specify. Targets is required if you don't provide one or more instance IDs in the call.",
                    type: ["string", "array"],
                    items: {
                        type: "object",
                    },
                },
                Parameters: {
                    description: "The required and optional parameters specified in the document.",
                    type: ["string", "object"],
                },
                CloudWatchOutputConfig: {
                    description: "Configuration options for sending command output to Amazon CloudWatch Logs.",
                    type: ["object", "string"],
                },
                Comment: {
                    description: "User-defined information about the command.",
                    type: "string",
                },
                DocumentHash: {
                    description: "The hash for the document.",
                    type: "string",
                },
                DocumentHashType: {
                    description: "The type of the hash.",
                    type: "string",
                    oneOf: [
                        {
                            enum: ["Sha256", "Sha1"],
                        },
                        {
                            pattern: "^{{[ ]{0,1}[a-zA-Z_.]+[ ]{0,1}}}$",
                        },
                    ],
                },
                NotificationConfig: {
                    description: "The configurations for sending notifications.",
                },
                OutputS3BucketName: {
                    description: "The name of the S3 bucket for command execution responses.",
                    type: "string",
                },
                OutputS3KeyPrefix: {
                    description: "The prefix.",
                    type: "string",
                },
                ServiceRoleArn: {
                    description: "The ARN of the IAM role.",
                    type: "string",
                },
                TimeoutSeconds: {
                    description: "THe run-command timeout value, in seconds.",
                    type: ["string", "integer"],
                },
            },
            required: ["DocumentName"],
        },
    },
};

export const runCommandSnippet: SnippetDefinition = {
    label: "Snippet: aws:runCommand",
    description:
        "Runs the specified commands.\n\nAutomation only supports output of one Run Command action. A document can include multiple Run Command actions, but output is supported for only one action at a time.",
    body: {
        name: "${1:runCommand}",
        action: "aws:runCommand",
        inputs: {
            DocumentName: "AWS-RunPowerShellScript",
            InstanceIds: ["{{InstanceIds}}"],
            Parameters: {
                commands: ["(Get-WmiObject -Class Win32_ComputerSystem).PartOfDomain"],
            },
        },
    },
};
