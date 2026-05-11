async function logoutUser() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "/signIn.html";
}

document.getElementById("connectDevicesLogout")?.addEventListener("click", () => {
    logoutUser();
});

const INTEGRATION_ENDPOINTS = {
    strava: "/api/integrations/strava/connect",
    whoop: "/api/integrations/whoop/connect"
};

async function postIntegrationConnect(key, btn) {
    const statusEl = document.getElementById("integrationStatus");
    const path = INTEGRATION_ENDPOINTS[key];
    if (!statusEl || !btn || !path) return;

    const label = key === "strava" ? "Strava" : "WHOOP";

    statusEl.textContent = "";
    btn.disabled = true;

    try {
        const res = await fetch(path, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        let body = {};
        try {
            body = await res.json();
        } catch {
            /* non-JSON */
        }

        statusEl.classList.remove("connect-devices-status--error");

        if (res.status === 501) {
            statusEl.textContent =
                body.message ||
                `${label} connection is not implemented yet. OAuth and token storage will be added on the server.`;
        } else if (!res.ok) {
            statusEl.classList.add("connect-devices-status--error");
            statusEl.textContent = body.message || `${label}: something went wrong (${res.status}).`;
        } else {
            statusEl.textContent = body.message || `${label}: connected.`;
        }
    } catch {
        statusEl.classList.add("connect-devices-status--error");
        statusEl.textContent = "Network error. Try again.";
    } finally {
        btn.disabled = false;
    }
}

document.getElementById("connectStravaBtn")?.addEventListener("click", function handleStrava() {
    postIntegrationConnect("strava", this);
});

document.getElementById("connectWhoopBtn")?.addEventListener("click", function handleWhoop() {
    postIntegrationConnect("whoop", this);
});
