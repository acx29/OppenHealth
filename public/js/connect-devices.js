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

document.getElementById("connectGarminBtn")?.addEventListener("click", async () => {
    const statusEl = document.getElementById("garminStatus");
    const btn = document.getElementById("connectGarminBtn");
    if (!statusEl || !btn) return;

    statusEl.textContent = "";
    btn.disabled = true;

    try {
        const res = await fetch("/api/integrations/garmin/connect", {
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
                "Garmin sync is not implemented yet. Server-side GarminDB integration will replace this stub.";
        } else if (!res.ok) {
            statusEl.classList.add("connect-devices-status--error");
            statusEl.textContent = body.message || `Something went wrong (${res.status}).`;
        } else {
            statusEl.textContent = body.message || "Connected.";
        }
    } catch {
        statusEl.classList.add("connect-devices-status--error");
        statusEl.textContent = "Network error. Try again.";
    } finally {
        btn.disabled = false;
    }
});
