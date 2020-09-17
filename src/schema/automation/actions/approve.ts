/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";

export const approveInputs: JsonLS.JSONSchema = {
    properties: {
        inputs: {
            properties: {
                NotificationArn: {
                    description:
                        'The ARN of an Amazon SNS topic for Automation approvals. When you specify an aws:approve step in an Automation document, Automation sends a message to this topic letting principals know that they must either approve or reject an Automation step. The title of the Amazon SNS topic must be prefixed with "Automation".',
                    type: "string",
                },
                Message: {
                    description:
                        "The information you want to include in the SNS topic when the approval request is sent. The maximum message length is 4096 characters.",
                    type: "string",
                },
                MinRequiredApprovals: {
                    description:
                        "The minimum number of approvals required to resume the Automation execution. If you don't specify a value, the system defaults to one. The value for this parameter must be a positive number. The value for this parameter can't exceed the number of approvers defined by the Approvers parameter.",
                    type: ["string", "integer"],
                },
                Approvers: {
                    description:
                        "A list of AWS authenticated principals who are able to either approve or reject the action. The maximum number of approvers is 10. You can specify principals by using any of the following formats:\n\nAn AWS Identity and Access Management (IAM) user name\n\nAn IAM user ARN\n\nAn IAM role ARN\n\nAn IAM assume role user ARN",
                    type: "StringList",
                },
            },
            required: ["Approvers"],
        },
    },
    required: ["inputs"],
};
