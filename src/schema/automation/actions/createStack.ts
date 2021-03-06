/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const createStackInputs: JsonLS.JSONSchema = {
    description: "Creates a new AWS CloudFormation stack from a template.",
    properties: {
        inputs: {
            properties: {
                Capabilities: {
                    description:
                        "A list of values that you specify before AWS CloudFormation can create certain stacks. Some stack templates include resources that can affect permissions in your AWS account. For example, creating new AWS Identity and Access Management (IAM) users can affect permissions in your account. For those stacks, you must explicitly acknowledge their capabilities by specifying this parameter. \n\nValid values include CAPABILITY_IAM, CAPABILITY_NAMED_IAM, and CAPABILITY_AUTO_EXPAND.\n\nIf you have IAM resources, you can specify either capability. If you have IAM resources with custom names, you must specify CAPABILITY_NAMED_IAM. If you don't specify this parameter, this action returns an InsufficientCapabilities error. The following resources require you to specify either CAPABILITY_IAM or CAPABILITY_NAMED_IAM.\n\n",
                    type: ["string", "array"],
                    items: {
                        type: "string",
                        enum: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"],
                    },
                },
                ClientRequestToken: {
                    description:
                        "A unique identifier for this CreateStack request. Specify this token if you set maxAttempts in this step to a value greater than 1. By specifying this token, AWS CloudFormation knows that you're not attempting to create a new stack with the same name.",
                    type: "string",
                    pattern: "[a-zA-Z0-9][-a-zA-Z0-9]*",
                    maxLength: 128,
                    minLength: 1,
                },
                DisableRollback: {
                    description:
                        "Set to true to disable rollback of the stack if stack creation failed.\n\nConditional: You can specify either the DisableRollback parameter or the OnFailure parameter, but not both.",
                    type: ["string", "boolean"],
                    default: false,
                },
                NotificationARNs: {
                    description: "The Amazon SNS topic ARNs for publishing stack-related events.",
                    type: ["string", "array"],
                    items: {
                        type: "string",
                    },
                    maxItems: 5,
                },
                onFailure: {
                    description:
                        "Determines the action to take if stack creation failed. You must specify DO_NOTHING, ROLLBACK, or DELETE.\n\nConditional: You can specify either the OnFailure parameter or the DisableRollback parameter, but not both.",
                    type: "string",
                    default: "ROLLBACK",
                    enum: ["DO_NOTHING", "ROLLBACK", "DELETE"],
                },
                Parameters: {
                    description: "A list of Parameter structures that specify input parameters for the stack.",
                    type: ["string", "array"],
                    items: {
                        type: "object",
                    },
                },
                ResourceTypes: {
                    description:
                        "The template resource types that you have permissions to work with for this create stack action.",
                    type: ["string", "array"],
                    items: {
                        type: "string",
                    },
                    minItems: 1,
                    maxItems: 256,
                },
                RoleARN: {
                    description:
                        "The Amazon Resource Name (ARN) of an IAM role that AWS CloudFormation assumes to create the stack. AWS CloudFormation uses the role's credentials to make calls on your behalf. AWS CloudFormation always uses this role for all future operations on the stack. As long as users have permission to operate on the stack, AWS CloudFormation uses this role even if the users don't have permission to pass it. Ensure that the role grants the least amount of privileges.\n\nIf you don't specify a value, AWS CloudFormation uses the role that was previously associated with the stack. If no role is available, AWS CloudFormation uses a temporary session that is generated from your user credentials.",
                    type: "string",
                    maxLength: 2048,
                    minLength: 20,
                },
                StackName: {
                    description:
                        "The name that is associated with the stack. The name must be unique in the region in which you are creating the stack.\n\nA stack name can contain only alphanumeric characters (case sensitive) and hyphens. It must start with an alphabetic character and cannot be longer than 128 characters.",
                    type: "string",
                    maxLength: 128,
                },
                StackPolicyBody: {
                    description:
                        "Structure containing the stack policy body.\n\nConditional: You can specify either the StackPolicyBody parameter or the StackPolicyURL parameter, but not both.",
                    type: "string",
                    maxLength: 16384,
                    minLength: 1,
                },
                StackPolicyURL: {
                    description:
                        "Location of a file containing the stack policy. The URL must point to a policy located in an S3 bucket in the same region as the stack. The maximum file size allowed for the stack policy is 16 KB.\n\nConditional: You can specify either the StackPolicyBody parameter or the StackPolicyURL parameter, but not both.",
                    type: "string",
                    maxLength: 1350,
                    minLength: 1,
                },
                Tags: {
                    description:
                        "Key-value pairs to associate with this stack. AWS CloudFormation also propagates these tags to the resources created in the stack. You can specify a maximum number of 10 tags.",
                },
                TemplateBody: {
                    description:
                        "Structure containing the template body with a minimum length of 1 byte and a maximum length of 51,200 bytes.\n\nConditional: You can specify either the TemplateBody parameter or the TemplateURL parameter, but not both.",
                    type: "string",
                    minLength: 1,
                },
                TemplateURL: {
                    description:
                        "Location of a file containing the template body. The URL must point to a template that is located in an S3 bucket. The maximum size allowed for the template is 460,800 bytes.\n\nConditional: You can specify either the TemplateBody parameter or the TemplateURL parameter, but not both.",
                    type: "string",
                    maxLength: 1024,
                    minLength: 1,
                },
                TimeoutInMinutes: {
                    description:
                        "The amount of time that can pass before the stack status becomes CREATE_FAILED. If DisableRollback is not set or is set to false, the stack will be rolled back.",
                    type: ["integer", "string"],
                    minimum: 1,
                },
            },
            required: ["StackName"],
        },
    },
};

export const createStackSnippet: SnippetDefinition = {
    label: "Snippet: aws:createStack",
    description: "Creates a new AWS CloudFormation stack from a template.",
    body: {
        name: "${1:createStack}",
        action: "aws:createStack",
        maxAttempts: 1,
        onFailure: "Abort",
        inputs: {
            Capabilities: ["CAPABILITY_IAM"],
            StackName: "myStack",
            TemplateURL: "http://s3.amazonaws.com/doc-example-bucket/myStackTemplate",
            TimeoutInMinutes: 5,
        },
    },
};
