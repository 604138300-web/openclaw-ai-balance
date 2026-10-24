// src/control-ui.ts
import { defineControlUiPlugin } from "openclaw/plugin-sdk/control-ui";
var ENDPOINT = "/plugins/ai-balance/balances";
var control_ui_default = defineControlUiPlugin({
  id: "ai-balance",
  activate(host) {
    host.ui.registerNavigation({
      id: "ai-balance",
      label: "AI \u4F59\u989D",
      page: { id: "ai-balance" },
      icon: "wallet"
    });
    host.ui.registerPage({
      id: "ai-balance",
      label: "AI \u4F59\u989D",
      mount(container, context) {
        const section = document.createElement("section");
        section.className = "ai-balance-page";
        const header = document.createElement("div");
        header.className = "ai-balance-header";
        const heading = document.createElement("h1");
        heading.textContent = "AI \u4F59\u989D";
        const refreshBtn = document.createElement("button");
        refreshBtn.textContent = "\u5237\u65B0";
        refreshBtn.className = "ai-balance-refresh";
        header.append(heading, refreshBtn);
        const list = document.createElement("div");
        list.className = "ai-balance-list";
        const footer = document.createElement("div");
        footer.className = "ai-balance-footer";
        const render = (data) => {
          list.innerHTML = "";
          if (!data.providers || data.providers.length === 0) {
            const empty = document.createElement("p");
            empty.className = "ai-balance-empty";
            empty.textContent = "\u6682\u65E0\u4F59\u989D\u6570\u636E";
            list.append(empty);
          } else {
            for (const p of data.providers) {
              const card = document.createElement("article");
              card.className = "ai-balance-card";
              const name = document.createElement("div");
              name.className = "ai-balance-name";
              name.textContent = p.displayName;
              const amount = document.createElement("div");
              amount.className = "ai-balance-amount";
              const sym = p.currency === "CNY" ? "\xA5" : p.currency === "USD" ? "$" : "";
              amount.textContent = sym + Number(p.balance).toFixed(2);
              const unit = document.createElement("div");
              unit.className = "ai-balance-unit";
              unit.textContent = p.currency;
              card.append(name, amount, unit);
              list.append(card);
            }
          }
          const note = document.createElement("p");
          note.className = "ai-balance-hint";
          note.textContent = "\u672C\u5730\u6A21\u578B\uFF08ollama\uFF09\u4E0E\u672A\u914D\u7F6E\u7684\u63D0\u4F9B\u5546\u4E0D\u663E\u793A\u4F59\u989D";
          list.append(note);
          footer.textContent = "\u6700\u540E\u66F4\u65B0\uFF1A" + new Date(data.updatedAt).toLocaleString("zh-CN");
        };
        const load = async () => {
          refreshBtn.disabled = true;
          refreshBtn.textContent = "\u52A0\u8F7D\u4E2D\u2026";
          try {
            const resp = await fetch(ENDPOINT, { credentials: "same-origin" });
            if (!resp.ok) throw new Error("HTTP " + resp.status);
            const data = await resp.json();
            if (!context.signal.aborted) render(data);
          } catch (error) {
            if (!context.signal.aborted) footer.textContent = "\u52A0\u8F7D\u5931\u8D25\uFF1A" + String(error);
          } finally {
            if (!context.signal.aborted) {
              refreshBtn.disabled = false;
              refreshBtn.textContent = "\u5237\u65B0";
            }
          }
        };
        refreshBtn.onclick = load;
        section.append(header, list, footer);
        container.append(section);
        void load();
        return { dispose: () => section.remove() };
      }
    });
  }
});
export {
  control_ui_default as default
};
