/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const runInstancesInputs: JsonLS.JSONSchema = {
    description: "Launches a new instance.",
    properties: {
        inputs: {
            properties: {
                ImageId: {
                    description: "The ID of the Amazon Machine Image (AMI).",
                    type: "string",
                },
                InstanceType: {
                    description:
                        "The instance type. \n\nIf an instance type value is not provided, the m1.small instance type is used.",
                    type: "string",
                },
                MinInstanceCount: {
                    description: "The minimum number of instances to be launched.",
                    type: ["integer", "string"],
                },
                MaxInstanceCount: {
                    description: "The maximum number of instances to be launched.",
                    type: ["integer", "string"],
                },
                AdditionalInfo: {
                    description: "Reserved.",
                    type: "string",
                },
                BlockDeviceMappings: {
                    description: "The block devices for the instance.",
                    type: ["string", "array"],
                    items: {
                        type: "object",
                    },
                },
                ClientToken: {
                    description: "The identifier to ensure idempotency of the request.",
                    type: "string",
                },
                DisableApiTermination: {
                    description: "Enables or disables instance API termination.",
                    type: ["boolean", "string"],
                },
                EbsOptimized: {
                    description: "Enables or disables EBS optimization.",
                    type: ["boolean", "string"],
                },
                IamInstanceProfileArn: {
                    description: "The ARN of the IAM instance profile for the instance.",
                    type: "string",
                },
                IamInstanceProfileName: {
                    description: "The name of the IAM instance profile for the instance.",
                    type: "string",
                },
                InstanceInitiatedShutdownBehavior: {
                    description: "Indicates whether the instance stops or terminates on system shutdown.",
                    type: "string",
                },
                KernelId: {
                    description: "The ID of the kernel.",
                    type: "string",
                },
                KeyName: {
                    description: "The name of the key pair.",
                    type: "string",
                },
                Monitoring: {
                    description: "Enables or disables detailed monitoring.",
                    type: ["string", "boolean"],
                },
                NetworkInterfaces: {
                    description: "The network interfaces.",
                },
                Placement: {
                    description: "The placement for the instance.",
                    type: ["object", "string"],
                },
                PrivateIpAddress: {
                    description: "The primary IPv4 address.",
                    type: "string",
                },
                RamdiskId: {
                    description: "The ID of the RAM disk.",
                    type: "string",
                },
                SecurityGroupIds: {
                    description: "The IDs of the security groups for the instance.",
                },
                SecurityGroup: {
                    description: "The names of the security groups for the instance.",
                },
                SubnetId: {
                    description: "The subnet ID.",
                    type: "string",
                },
                TagSpecifications: {
                    description:
                        "The tags to apply to the resources during launch. You can only tag instances and volumes at launch. The specified tags are applied to all instances or volumes that are created during launch. To tag an instance after it has been launched, use the aws:createTags – Create tags for AWS resources action.",
                },
                UserData: {
                    description:
                        "An execution script provided as a string literal value. If a literal value is entered, then it must be Base64-encoded.",
                    type: "string",
                },
            },
            required: ["ImageId"],
        },
    },
};

export const runInstancesSnippet: SnippetDefinition = {
    label: "Snippet: aws:runInstances",
    description: "Launches a new instance.",
    body: {
        name: "${1:runInstances}",
        action: "aws:runInstances",
        maxAttempts: 3,
        timeoutSeconds: 1200,
        onFailure: "Abort",
        inputs: {
            ImageId: "ami-12345678",
            InstanceType: "t2.micro",
            MinInstanceCount: 1,
            MaxInstanceCount: 1,
            IamInstanceProfileName: "myRunCmdRole",
            TagSpecifications: [
                {
                    ResourceType: "instance",
                    Tags: [
                        {
                            Key: "LaunchedBy",
                            Value: "SSMAutomation",
                        },
                        {
                            Key: "Category",
                            Value: "HighAvailabilityFleetHost",
                        },
                    ],
                },
            ],
        },
    },
};
