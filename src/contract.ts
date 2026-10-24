import { Type } from "typebox";
import { defineFeatureContract } from "openclaw/plugin-sdk/feature-contract";

export const contract = defineFeatureContract({
  pluginId: "ai-balance",
  operations: {
    balance: {
      kind: "query",
      description: "Query live provider balance (served by /plugins/ai-balance/balances).",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({
        providers: Type.Array(Type.Any()),
        updatedAt: Type.String(),
      }),
    },
  },
  events: {},
});
