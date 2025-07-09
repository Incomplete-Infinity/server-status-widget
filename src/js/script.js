class EveServerStatus extends HTMLElement {
  constructor() {
    super();
    const tmpl = document.getElementById("eve-server-status-template").content;
    this.appendChild(tmpl.cloneNode(true));
  }

  connectedCallback() {
    this.querySelector("table").hidden = true;
    this.querySelector("#loading-indicator").hidden = false;

    // Initialize display classes with their container elements
    this.uptimeDisplay = new UptimeDisplay(this.querySelector("#uptime"));
    this.playerCountDisplay = new PlayerCountDisplay(this.querySelector("#player-count"));
    this.serverStatusDisplay = new ServerStatusDisplay(this.querySelector("#status"));
    this.versionDisplay = new VersionDisplay(this.querySelector("#version"));

    this.fetchServerStatus();
  }

  fetchServerStatus = () => {
    fetch("https://esi.evetech.net/latest/status/?datasource=tranquility")
      .then(res => res.json())
      .then(({ server_version, players, start_time }) => {
        this.querySelector("#loading-indicator").hidden = true;
        this.querySelector("table").hidden = false;

        this.serverStatusDisplay.update(players > 0);
        this.playerCountDisplay.update(players);
        this.versionDisplay.update(server_version);

        const startTime = new Date(start_time);
        this.uptimeDisplay.start(startTime);
      })
      .catch(() => {
        this.querySelector("#loading-indicator").textContent = "Failed to retrieve server status.";
      });
  };
}

class UptimeDisplay {
  constructor(container) {
    this.container = container;
    this.template = document.getElementById("uptime-template").content;
    this.element = this.template.cloneNode(true);
    this.container.innerHTML = "";
    this.container.appendChild(this.element);
    this.hours = this.container.querySelector("[part=hours]");
    this.minutes = this.container.querySelector("[part=minutes]");
    this.seconds = this.container.querySelector("[part=seconds]");
    this.intervalId = null;
  }

  start(startTime) {
    this.stop();
    this.update(startTime);
    this.intervalId = setInterval(() => this.update(startTime), 1000);
  }

  update(startTime) {
    const diff = Date.now() - startTime.getTime();
    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / 60000) % 60;
    const h = Math.floor(diff / 3600000);
    this.hours.textContent = String(h).padStart(2, "0");
    this.minutes.textContent = String(m).padStart(2, "0");
    this.seconds.textContent = String(s).padStart(2, "0");
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

class PlayerCountDisplay {
  constructor(container) {
    this.container = container;
    this.template = document.getElementById("player-count-template").content;
  }

  update(count) {
    this.container.innerHTML = "";
    const el = this.template.cloneNode(true);
    el.querySelector("[part=player-count]").textContent = count || "0";
    this.container.appendChild(el);
  }
}

class ServerStatusDisplay {
  constructor(container) {
    this.container = container;
    this.template = document.getElementById("server-status-template").content;
  }

  update(isOnline) {
    this.container.innerHTML = "";
    const el = this.template.cloneNode(true);
    const span = el.querySelector("[part=server-status]");
    if (isOnline) {
      span.textContent = "Online 😀";
      span.classList.add("text-success");
      span.classList.remove("text-danger");
    } else {
      span.textContent = "Offline 💔";
      span.classList.add("text-danger");
      span.classList.remove("text-success");
    }
    this.container.appendChild(el);
  }
}

class VersionDisplay {
  constructor(container) {
    this.container = container;
    this.template = document.getElementById("version-template").content;
  }

  update(version) {
    this.container.innerHTML = "";
    const el = this.template.cloneNode(true);
    el.querySelector("[part=version]").textContent = version ?? "n/a";
    this.container.appendChild(el);
  }
}

customElements.define("eve-server-status", EveServerStatus);
