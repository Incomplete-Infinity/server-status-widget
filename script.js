const { log } = console;
const now = () => new Date();
const pause = (callback, milliseconds) => setTimeout(callback, milliseconds);

// Helper function to calculate uptime
const calculateUptime = (startTime, endTime) => {
  const diff = endTime - startTime;
  const seconds = Math.max(Math.floor(diff / 1000), 0);
  const minutes = Math.max(Math.floor(seconds / 60), 0);
  const hours = Math.max(Math.floor(minutes / 60), 0);

  return seconds + minutes + hours > 0
    ? `<span class="text-warning fs-5">
         <span style="width:2em;" class="text-success fs-3">${
        hours % 24
      }</span>h : <span style="width:2em;" class="text-success fs-3">${
        minutes % 60
      }</span>m : <span style="width:2em;" class="text-success fs-3">${
        seconds % 60
      }</span>s</span>`
    : `0`;
};


// Define the custom element
class EveServerStatus extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h3 class="text-center align-center pt-3"><span class="spinner-border"></span>&nbsp;Loading Server Status...</h3>`;
    this.fetchServerStatus();
  }

  fetchServerStatus() {
    const apiUrl =
      "https://esi.evetech.net/latest/status/?datasource=tranquility";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const { server_version, players, start_time } = data;
        const isOnline = players > 0;
        const serverStatus = isOnline
          ? `<span class="text-success">Online</span>😀`
          : `<span class="text-danger">Offline</span>💔`;

        const playerCount = players
          ? `<span class="text-info">${players}</span>`
          : `<span class="text-warning">${0}</span>`;
        const startTime = new Date(start_time);
        const uptime = calculateUptime(startTime, now());

        this.innerHTML = `
<table class="table table-borderless table-stripped table-striped-columns table-hover">
  <thead>
    <tr>
      <th colspan="2" id="fw-header">
        <h2>Eve Online Server Status</h2>
        <h4 class="text-secondary">SINGULARITY</h4>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-end">⚡&nbsp;Server&nbsp;Status&nbsp;:&nbsp;</td>
      <td id="status" class="text-start">${serverStatus}</td>
    </tr>
    <tr>
      <td class="column-a">👨‍👩‍👧‍👦&nbsp;Player&nbsp;Count&nbsp;:&nbsp;</td>
      <td class="column-b" id="player-count">${playerCount}</td>
    </tr>
    <tr>
      <td class="column-a">⏱&nbsp;Uptime&nbsp;:&nbsp;</td>
      <td class="column-b" id="uptime"><span id="uptime">${uptime}</span></td>
    </tr>
    <tr>
      <td class="column-a">🎰&nbsp;Version&nbsp;:&nbsp;</td>
      <td class="column-b" id="version">${server_version ?? "n/a"}</td>
    </tr>
  </tbody>
</table>`;

        this.updateUptime(startTime);
      })
      .catch(() => {
        this.innerHTML = "Failed to retrieve server status.";
      });
  }

  updateUptime(startTime) {
    const uptimeElement = this.querySelector("#uptime");

    setInterval(() => {
      const uptime = calculateUptime(startTime, now());
      uptimeElement.innerHTML = uptime; // Use innerHTML instead of textContent
    }, 1000);
  }
}

const init = () => {
  // Define the custom element tag
  customElements.define("eve-server-status", EveServerStatus);

  // Automatically update the server status every 60 seconds
  setInterval(() => {
    const serverStatusElement = document.querySelector("eve-server-status");
    serverStatusElement.fetchServerStatus();
  }, 30000);
};

pause(init, 1000);
