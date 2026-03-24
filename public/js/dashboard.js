async function logoutUser() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "/signIn.html";
}

/**
 * Fetches workouts from our Express API.
 * The browser sends cookies (JWT) because of credentials: "include".
 * Express runs requireAuth → Supabase validates the user → we query workouts for that user_id.
 */
async function loadWorkouts() {
    const listEl = document.getElementById("workoutsList");
    const emptyEl = document.getElementById("workoutsEmpty");
    if (!listEl || !emptyEl) return;

    const res = await fetch("/api/workouts", {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok) {
        console.error("Could not load workouts");
        return;
    }

    /** @type {Array<{ sport: string; distance_miles: number | null; duration_minutes: number; avg_hr: number | null; created_at: string }>} */
    const workouts = await res.json();

    listEl.innerHTML = "";
    if (!workouts.length) {
        emptyEl.hidden = false;
        listEl.hidden = true;
        return;
    }

    emptyEl.hidden = true;
    listEl.hidden = false;

    for (const w of workouts) {
        const li = document.createElement("li");
        li.className = "workout-card";
        const when = new Date(w.created_at).toLocaleString();
        const sportLabel = w.sport.charAt(0).toUpperCase() + w.sport.slice(1);
        let detail = `${w.duration_minutes} min`;
        if (w.sport === "running" && w.distance_miles != null) {
            detail += ` · ${Number(w.distance_miles)} mi`;
        }
        if (w.avg_hr != null) {
            detail += ` · avg HR ${w.avg_hr} bpm`;
        }
        li.innerHTML = `
            <div class="workout-card__sport">${sportLabel}</div>
            <div class="workout-card__meta">${detail}</div>
            <div class="workout-card__time">${when}</div>
        `;
        listEl.appendChild(li);
    }
}

async function checkSetup() {
    const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
    });

    const profile = await res.json();

    if (!res.ok) {
        console.error(profile);
        return;
    }

    const nameEl = document.getElementById("userName");
    if (nameEl && profile.name) {
        nameEl.textContent = profile.name;
    }

    const header = document.querySelector(".header-tab");
    if (header) {
        header.classList.remove("header-hidden");
    }

    const main = document.getElementById("dashboardMain");
    if (main) {
        main.classList.remove("header-hidden");
    }

    if (!profile.setup_complete) {
        document.getElementById("setupModal").classList.remove("hidden");
    } else {
        await loadWorkouts();
    }
}

const setupSubmitBtn = document.getElementById("setupSubmit");
if (setupSubmitBtn) {
    setupSubmitBtn.addEventListener("click", async () => {
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
        await loadWorkouts();
    });
}

/* ---------- Log activity modal + History API ----------
   Problem: the browser Back button changes the *history stack* (real navigation),
   not your modal’s “step”. We push lightweight history entries when the modal opens
   and when the user goes to Running, then listen for "popstate" to sync the UI.

   - Back on Running step → pops to “sport picker” state (same page, no full reload).
   - Back on sport step → pops our modal state; modal closes; you stay on /dashboard.
*/

const activityModal = document.getElementById("activityModal");
const activityStepSport = document.getElementById("activityStepSport");
const activityStepRunning = document.getElementById("activityStepRunning");
const activityError = document.getElementById("activityError");

const ACTIVITY_STATE_KEY = "dhActivity";

function resetActivityFormFields() {
    if (activityError) activityError.textContent = "";
    if (activityStepSport) activityStepSport.classList.remove("hidden");
    if (activityStepRunning) activityStepRunning.classList.add("hidden");
    const rd = document.getElementById("runDistance");
    const rt = document.getElementById("runDuration");
    const rh = document.getElementById("runAvgHr");
    if (rd) rd.value = "";
    if (rt) rt.value = "";
    if (rh) rh.value = "";
}

/** Show / hide modal and steps to match history.state (after popstate or push). */
function syncActivityModalFromHistory() {
    if (!activityModal || !activityStepSport || !activityStepRunning) return;

    const s = history.state;
    if (s && s[ACTIVITY_STATE_KEY]) {
        activityModal.classList.remove("hidden");
        if (s.step === "running") {
            activityStepSport.classList.add("hidden");
            activityStepRunning.classList.remove("hidden");
        } else {
            activityStepSport.classList.remove("hidden");
            activityStepRunning.classList.add("hidden");
        }
        return;
    }

    activityModal.classList.add("hidden");
    resetActivityFormFields();
}

function openActivityModal() {
    if (!activityModal) return;
    resetActivityFormFields();
    activityModal.classList.remove("hidden");
    history.pushState(
        { [ACTIVITY_STATE_KEY]: true, step: "sport" },
        "",
        window.location.href
    );
}

/**
 * Close modal and remove our history entries so Back doesn’t leave a “ghost” state.
 */
function closeActivityModal() {
    if (!activityModal) return;

    if (!activityModal.classList.contains("hidden") && history.state?.[ACTIVITY_STATE_KEY]) {
        const depth = history.state.step === "running" ? 2 : 1;
        history.go(-depth);
        return;
    }

    activityModal.classList.add("hidden");
    resetActivityFormFields();
}

window.addEventListener("popstate", () => {
    syncActivityModalFromHistory();
});

if (
    activityModal &&
    activityStepSport &&
    activityStepRunning
) {
    const openBtn = document.getElementById("openActivityModal");
    if (openBtn) {
        openBtn.addEventListener("click", openActivityModal);
    }

    const closeBtn = document.getElementById("closeActivityModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeActivityModal);
    }

    activityModal.addEventListener("click", (e) => {
        if (e.target === activityModal) {
            closeActivityModal();
        }
    });

    const runningSportBtn = document.querySelector(
        '.sport-pill[data-sport="running"]'
    );
    if (runningSportBtn) {
        runningSportBtn.addEventListener("click", () => {
            if (activityError) activityError.textContent = "";
            history.pushState(
                { [ACTIVITY_STATE_KEY]: true, step: "running" },
                "",
                window.location.href
            );
            syncActivityModalFromHistory();
        });
    }

    const backBtn = document.getElementById("activityBack");
    if (backBtn) {
        backBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (history.state?.[ACTIVITY_STATE_KEY] && history.state.step === "running") {
                history.back();
            }
        });
    }

    const submitRunBtn = document.getElementById("activitySubmitRun");
    if (submitRunBtn) {
        submitRunBtn.addEventListener("click", async () => {
            if (activityError) activityError.textContent = "";

            const distance_miles = document.getElementById("runDistance")?.value.trim() ?? "";
            const duration_minutes =
                document.getElementById("runDuration")?.value.trim() ?? "";
            const avg_hr = document.getElementById("runAvgHr")?.value.trim() ?? "";

            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    sport: "running",
                    duration_minutes,
                    distance_miles,
                    avg_hr
                })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (activityError) {
                    activityError.textContent =
                        data.message ||
                        data.error_description ||
                        "Could not save workout.";
                }
                return;
            }

            closeActivityModal();
            await loadWorkouts();
        });
    }
}

checkSetup();
