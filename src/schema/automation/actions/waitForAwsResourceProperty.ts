import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const waitForAwsResourcePropertyInputs: JsonLS.JSONSchema = {
    description:
        "The aws:waitForAwsResourceProperty action enables your Automation workflow to wait for a specific resource state or event state before continuing the workflow.",
    properties: {
        inputs: {
            properties: {
                Service: {
                    description:
                        "The AWS service namespace that contains the API action that you want to run. For example, the namespace for Systems Manager is ssm. The namespace for Amazon EC2 is ec2.",
                    type: "string",
                },
                Api: {
                    description: "The name of the API action that you want to run.",
                    type: "string",
                },
                PropertySelector: {
                    description: "The JSONPath to a specific attribute in the response object.",
                },
                DesiredValues: {
                    description: "The expected status or state on which to continue the Automation workflow.",
                },
            },
            additionalProperties: true,
            required: ["Service", "Api", "PropertySelector", "DesiredValues"],
        },
    },
};