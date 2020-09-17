import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const deleteImageInputs: JsonLS.JSONSchema = {
    description: "Deletes the specified image and all related snapshots.",
    properties: {
        inputs: {
            properties: {
                ImageId: {
                    description: "The ID of the image to be deleted.",
                    type: "string",
                },
            },
            required: ["ImageId"],
        },
    },
};

export const deleteImageSnippet: SnippetDefinition = {
    label: "aws:deleteImage",
    description: "aws:deleteImage action snippet",
    body: {
        name: "deleteImage",
        action: "aws:deleteImage",
        maxAttempts: 3,
        timeoutSeconds: 180,
        onFailure: "Abort",
        inputs: {
            ImageId: "ami-12345678",
        },
    },
};
