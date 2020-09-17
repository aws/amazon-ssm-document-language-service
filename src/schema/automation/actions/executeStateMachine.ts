import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const executeStateMachineInputs: JsonLS.JSONSchema = {
    description: "Run an AWS Step Functions state machine.",
    properties: {
        inputs: {
            properties: {
                stateMachineArn: {
                    description: "The ARN of the Step Functions state machine.",
                    type: "string",
                },
                name: {
                    description: "The name of the execution.",
                    type: "string",
                },
                input: {
                    description: "A string that contains the JSON input data for the execution.",
                    type: "string",
                },
            },
            required: ["stateMachineArn"],
        },
    },
};
