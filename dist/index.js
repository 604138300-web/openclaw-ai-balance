import { defineFeaturePlugin } from "openclaw/plugin-sdk/feature-plugin";
import { contract } from "./contract.js";
import { DatabaseSync } from "node:sqlite";
const BALANCE_API = "https://api.deepseek.com/user/balance";
const AUTH_DB = "E:\\AI\\openclaw\\agents\\workmate\\agent\\openclaw-agent.sqlite";
function readApiKey(provider) {
    if (process.env[`${provider.toUpperCase()}_API_KEY`]) {
        return String(process.env[`${provider.toUpperCase()}_API_KEY`]);
    }
    try {
        const db = new DatabaseSync(AUTH_DB, { readOnly: true });
        const row = db.prepare("SELECT store_json FROM auth_profile_store WHERE store_key='primary'").get();
        db.close();
        if (!row?.store_json)
            return "";
        const store = JSON.parse(row.store_json);
        for (const profile of Object.values(store.profiles ?? {})) {
            if (profile.provider === provider && profile.key)
                return String(profile.key);
        }
    }
    catch (e) {
        console.error("[ai-balance] read key failed:", e);
    }
    return "";
}
async function fetchDeepSeekBalance(apiKey) {
    if (!apiKey)
        return null;
    try {
        const resp = await fetch(BALANCE_API, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok)
            return null;
        const data = await resp.json();
        const info = (data.balance_infos ?? [])[0];
        if (!info)
            return null;
        return {
            provider: "deepseek",
            displayName: "DeepSeek",
            balance: Number(info.total_balance ?? 0),
            currency: String(info.currency ?? "CNY"),
            granted: Number(info.granted_balance ?? 0),
            toppedUp: Number(info.topped_up_balance ?? 0),
        };
    }
    catch {
        return null;
    }
}
export default defineFeaturePlugin({
    contract,
    name: "AI Balance",
    description: "Show live provider balance in OpenClaw Control.",
    setup(api) {
        api.registerHttpRoute({
            path: "/plugins/ai-balance/balances",
            auth: "gateway",
            match: "exact",
            handler: async (_req, res) => {
                const providers = [];
                const ds = await fetchDeepSeekBalance(readApiKey("deepseek"));
                if (ds)
                    providers.push(ds);
                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "no-store",
                });
                res.end(JSON.stringify({ providers, updatedAt: new Date().toISOString() }));
                return true;
            },
        });
        return {
            balance: async () => ({
                providers: [],
                updatedAt: new Date().toISOString(),
            }),
        };
    },
});
