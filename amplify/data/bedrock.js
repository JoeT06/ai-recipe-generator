// The tutorial's model (Claude 3.5 Sonnet v2) is retired on Bedrock.
// This calls Amazon Nova 2 Lite through the US cross-region inference profile,
// using the Bedrock Converse API so the model can be swapped by changing one ID.
export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  // Construct the prompt with the provided ingredients
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  // Return the request configuration
  return {
    resourcePath: `/model/us.amazon.nova-2-lite-v1:0/converse`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
        },
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return { error: ctx.error.message };
  }
  if (ctx.result.statusCode !== 200) {
    return { error: ctx.result.body };
  }
  // Parse the response body
  const parsedBody = JSON.parse(ctx.result.body);
  // Extract the text content from the response
  const textBlock = parsedBody.output.message.content.find((block) => block.text);
  const res = {
    body: textBlock ? textBlock.text : "No text returned",
  };
  // Return the response
  return res;
}
