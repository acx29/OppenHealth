/** Thin fetch wrapper for the NestJS API. All errors surface as ApiError with a clean message. */

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;

    try {
        res = await fetch(path, {
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin", // send/receive the httpOnly auth cookie
            ...init
        });
    } catch {
        throw new ApiError(0, "Network error. Try again.");
    }

    const body = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
        const message =
            body && typeof body.message === "string"
                ? body.message
                : "Something went wrong. Try again.";
        throw new ApiError(res.status, message);
    }

    return body as T;
}

export type Profile = {
    id: string;
    name: string | null;
    username: string | null;
    dob: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    onboarding: { activity_level?: string; sports?: string[]; goals?: string };
    onboarded_at: string | null;
};

export type OnboardingPayload = {
    dob: string;
    height_cm: number;
    weight_kg: number;
    activity_level: string;
    sports: string[];
    goals: string;
};

export const api = {
    login: (email: string, password: string) =>
        request<{ message: string }>("/api/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        }),

    signup: (email: string, password: string) =>
        request<unknown>("/api/signup", {
            method: "POST",
            body: JSON.stringify({ email, password })
        }),

    resendConfirmation: (email: string) =>
        request<{ message: string }>("/api/resend-confirmation", {
            method: "POST",
            body: JSON.stringify({ email })
        }),

    logout: () => request<{ message: string }>("/api/logout", { method: "POST" }),

    /** Session check — resolves with the user if the auth cookie is valid, throws 401 otherwise. */
    me: () => request<{ id: string; email: string }>("/api/me"),

    profile: () => request<Profile>("/api/profile"),

    saveOnboarding: (onboarding: OnboardingPayload) =>
        request<Profile>("/api/profile/onboarding", {
            method: "POST",
            body: JSON.stringify(onboarding)
        })
};
