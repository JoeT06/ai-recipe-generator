import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.us-east-1.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "us-east-1",
      signingServiceName: "bedrock",
    },
  }
);

// The US inference profile routes to us-east-1, us-east-2, and us-west-2,
// so the role needs the profile plus the model in each of those regions.
bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      "arn:aws:bedrock:*:*:inference-profile/us.anthropic.claude-haiku-5-5*",
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-5-5*",
    ],
    actions: ["bedrock:InvokeModel"],
  })
);
