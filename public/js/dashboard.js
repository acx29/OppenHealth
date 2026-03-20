async function logoutUser() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "/signIn.html"; // just redirects
}

async function checkSetup() {
    const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
    }); // grabs from backend

    const profile = await res.json();

    if (!res.ok) {
        console.error(profile);
        return;
    }

    if (!profile.setup_complete) { // the popup appears
        document.getElementById("setupModal").classList.remove("hidden");
    }
}

document.getElementById("setupSubmit").addEventListener("click", async () => {
    const name = document.getElementById("nameInput").value.trim();
    const username = document.getElementById("usernameInput").value.trim();
    const errorText = document.getElementById("setupError");

    errorText.textContent = "";

    if (!name || !username) {
        errorText.textContent = "Both fields are required.";
        return;
    }

    const res = await fetch("/api/profile/setup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, username })
    });

    const data = await res.json();

    if (!res.ok) {
        errorText.textContent = data.message || "Setup failed.";
        return;
    }

    document.getElementById("setupModal").classList.add("hidden");
});

checkSetup();