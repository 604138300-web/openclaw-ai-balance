import { defineControlUiPlugin } from "openclaw/plugin-sdk/control-ui";
import "./control-ui.css";

const ENDPOINT = "/plugins/ai-balance/balances";

export default defineControlUiPlugin({
  id: "ai-balance",
  activate(host) {
    host.ui.registerNavigation({
      id: "ai-balance",
      label: "AI 余额",
      page: { id: "ai-balance" },
      icon: "wallet",
    });

    host.ui.registerPage({
      id: "ai-balance",
      label: "AI 余额",
      mount(container, context) {
        const section = document.createElement("section");
        section.className = "ai-balance-page";

        const header = document.createElement("div");
        header.className = "ai-balance-header";
        const heading = document.createElement("h1");
        heading.textContent = "AI 余额";
        const refreshBtn = document.createElement("button");
        refreshBtn.textContent = "刷新";
        refreshBtn.className = "ai-balance-refresh";
        header.append(heading, refreshBtn);

        const list = document.createElement("div");
        list.className = "ai-balance-list";

        const footer = document.createElement("div");
        footer.className = "ai-balance-footer";

        const render = (data: { providers: any[]; updatedAt: string }) => {
          list.innerHTML = "";
          if (!data.providers || data.providers.length === 0) {
            const empty = document.createElement("p");
            empty.className = "ai-balance-empty";
            empty.textContent = "暂无余额数据";
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
              const sym = p.currency === "CNY" ? "¥" : p.currency === "USD" ? "$" : "";
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
          note.textContent = "本地模型（ollama）与未配置的提供商不显示余额";
          list.append(note);
          footer.textContent = "最后更新：" + new Date(data.updatedAt).toLocaleString("zh-CN");
        };

        const load = async () => {
          refreshBtn.disabled = true;
          refreshBtn.textContent = "加载中…";
          try {
            const resp = await fetch(ENDPOINT, { credentials: "same-origin" });
            if (!resp.ok) throw new Error("HTTP " + resp.status);
            const data = await resp.json();
            if (!context.signal.aborted) render(data);
          } catch (error) {
            if (!context.signal.aborted) footer.textContent = "加载失败：" + String(error);
          } finally {
            if (!context.signal.aborted) {
              refreshBtn.disabled = false;
              refreshBtn.textContent = "刷新";
            }
          }
        };

        refreshBtn.onclick = load;
        section.append(header, list, footer);
        container.append(section);
        void load();
        return { dispose: () => section.remove() };
      },
    });
  },
});
