async function logoutUser() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "/signIn.html";
}

const userNameEditRoot = document.getElementById("userNameEdit");
const userNameBtn = document.getElementById("userNameBtn");
const userNameSpan = document.getElementById("userName");
const userNameInput = document.getElementById("userNameInput");

let nameBeforeEdit = "";

function setNameEditorInteractive(enabled) {
    if (!userNameBtn) return;
    userNameBtn.disabled = !enabled;
    userNameBtn.setAttribute(
        "aria-label",
        enabled ? "Edit display name" : "Display name"
    );
}

function leaveDisplayNameEditMode() {
    if (!userNameEditRoot || !userNameBtn || !userNameInput) return;
    userNameEditRoot.classList.remove("user-name-edit--active");
    userNameInput.hidden = true;
    userNameBtn.hidden = false;
}

function cancelDisplayNameEdit() {
    if (!userNameInput) return;
    userNameInput.value = nameBeforeEdit;
    leaveDisplayNameEditMode();
}

async function commitDisplayNameEdit() {
    if (!userNameSpan || !userNameInput) return;

    const next = userNameInput.value.trim();
    if (!next) {
        userNameInput.value = nameBeforeEdit;
        leaveDisplayNameEditMode();
        return;
    }

    if (next === nameBeforeEdit) {
        leaveDisplayNameEditMode();
        return;
    }

    const revertTo = nameBeforeEdit;

    userNameSpan.textContent = next;
    leaveDisplayNameEditMode();

    userNameEditRoot?.classList.add("user-name-edit--saving");
    userNameEditRoot?.setAttribute("aria-busy", "true");

    try {
        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: next })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            userNameSpan.textContent = revertTo;
            window.alert(data.message || "Could not update name.");
            return;
        }

        userNameSpan.textContent = data.name ?? next;
    } finally {
        userNameEditRoot?.classList.remove("user-name-edit--saving");
        userNameEditRoot?.removeAttribute("aria-busy");
    }
}

function initDisplayNameEditor() {
    if (!userNameBtn || !userNameInput || !userNameSpan || !userNameEditRoot) return;

    userNameBtn.addEventListener("click", () => {
        if (userNameBtn.disabled) return;
        nameBeforeEdit = userNameSpan.textContent.trim();
        userNameEditRoot.classList.add("user-name-edit--active");
        userNameBtn.hidden = true;
        userNameInput.hidden = false;
        userNameInput.value = nameBeforeEdit;
        userNameInput.focus();
        userNameInput.select();
    });

    userNameInput.addEventListener("blur", () => {
        queueMicrotask(() => {
            if (userNameInput.hidden) return;
            void commitDisplayNameEdit();
        });
    });

    userNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            userNameInput.blur();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            cancelDisplayNameEdit();
        }
    });
}

initDisplayNameEditor();

/** Local calendar date as YYYY-MM-DD (matches how we show workout times to the user). */
function localDateKeyFromIso(iso) {
    const date = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Midnight local time for the given Date (mutates and returns same instance). */
function startOfLocalDay(date) {
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Sunday at local midnight for the week that contains `day` (local).
 * @param {Date} day
 */
function sundayOfWeekContaining(day) {
    const d = new Date(day);
    startOfLocalDay(d);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

const HEATMAP_WEEKS = 53;

/**
 * GitHub-style grid: columns = weeks (oldest left), rows = Sun–Sat top to bottom.
 * @param {Array<{ created_at: string }>} workouts
 */
function renderStatsHeatmap(workouts) {
    const root = document.getElementById("statsHeatmap");
    if (!root) return;

    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const w of workouts) {
        const key = localDateKeyFromIso(w.created_at);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const today = new Date();
    startOfLocalDay(today);

    const thisWeekSunday = sundayOfWeekContaining(today);
    const firstSunday = new Date(thisWeekSunday);
    firstSunday.setDate(thisWeekSunday.getDate() - (HEATMAP_WEEKS - 1) * 7);

    root.replaceChildren();

    for (let c = 0; c < HEATMAP_WEEKS; c++) {
        for (let r = 0; r < 7; r++) {
            const cellDate = new Date(firstSunday);
            cellDate.setDate(firstSunday.getDate() + c * 7 + r);
            startOfLocalDay(cellDate);

            const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
            const n = counts.get(key) ?? 0;

            const el = document.createElement("span");
            el.className = "stats-heatmap-cell";

            if (cellDate > today) {
                el.classList.add("stats-heatmap-cell--future");
                el.title = `${key} (upcoming)`;
            } else if (n === 0) {
                el.classList.add("stats-heatmap-cell--empty");
                el.title = `${key}: No workout`;
            } else if (n === 1) {
                el.classList.add("stats-heatmap-cell--lvl1");
                el.title = `${key}: 1 workout`;
            } else {
                el.classList.add("stats-heatmap-cell--lvl2");
                el.title = `${key}: ${n} workouts`;
            }

            root.appendChild(el);
        }
    }
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

    /** @type {Array<{ id: string; sport: string; distance_miles: number | null; duration_minutes: number; avg_hr: number | null; created_at: string }>} */
    const workouts = await res.json();

    renderStatsHeatmap(workouts);

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
            <div class="workout-card__actions">
                <button class="workout-card-delete">Delete</button>
            </div>
        `;

        const deleteBtn = li.querySelector(".workout-card-delete");
        if(deleteBtn){
            
            deleteBtn.addEventListener("click", async () => {
                const confirmed = window.confirm("Are you sure you want to delete this workout?");
                if(confirmed){
                    await deleteWorkout(w.id);
                }
            });
            
        }

        listEl.appendChild(li);
    }
}

async function checkSetup() {
    const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
    });

    const profile = await res.json();

    if (!res.ok) { // This block makes sure that we still see somehting even if the profile is not found
        console.error(profile); // outputs error message from the server
        const header = document.querySelector(".header-tab");
        const main = document.getElementById("dashboardMain");
        if (header) header.classList.remove("header-hidden");
        if (main) main.classList.remove("header-hidden");
        const nameEl = document.getElementById("userName");
        if (nameEl) {
            nameEl.textContent = "there";
        }
        setNameEditorInteractive(false);
        return;
    }

    const nameEl = document.getElementById("userName");
    if (nameEl && profile.name) {
        nameEl.textContent = profile.name;
    }
    setNameEditorInteractive(true);

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
        const nameSpan = document.getElementById("userName");
        if (nameSpan) {
            nameSpan.textContent = name;
        }
        setNameEditorInteractive(true);
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

async function deleteWorkout(workoutID){
    const res = await fetch(`/api/workouts/${workoutID}`, {
        method: "DELETE",
        credentials: "include"
    });

    if(!res.ok){
        const err = await res.json();
        console.error(err.message || "Could not delete workout."); // error message from the server
        return;
    }    

    await loadWorkouts(); // reloads the workouts
}


checkSetup();
