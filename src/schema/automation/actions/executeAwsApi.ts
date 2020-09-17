import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const executeAwsApiInputs: JsonLS.JSONSchema = {
    description:
        "Calls and runs AWS API actions. Most API actions are supported, although not all API actions have been tested.",
    properties: {
        inputs: {
            properties: {
                Service: {
                    description: "The AWS service namespace that contains the API action that you want to run.",
                    type: "string",
                },
                Api: {
                    description: "The name of the API action that you want to run.",
                    type: "string",
                },
            },
            additionalProperties: true,
            required: ["Service"],
        },
    },
};

export const executeAwsApiSnippet: SnippetDefinition = {
    label: "aws:executeAwsApi",
    description: "aws:executeAwsApi action snippet",
    body: {
        name: "executeAwsApi",
        action: "aws:executeAwsApi",
        inputs: {
            Service: "The official namespace of the service",
            Api: "The API action or method name",
            "API action inputs or parameters": "A value",
        },
        outputs: [
            {
                Name: "The name for a user-specified output key",
                Selector: "A response object specified by using JSONPath format",
                Type: "The data type",
            },
        ],
    },
};
