import type { RegistrationResult } from "./registration-schema";

const registrationRequestError = "We couldn’t confirm your registration. Please try again shortly.";

export type RegistrationState =
  | { status: "idle" | "submitting" }
  | { status: "animating-success" | "success"; contentHeight: number }
  | { status: "error"; error: Extract<RegistrationResult, { ok: false }> };

type RegistrationAction =
  | { type: "submit" }
  | { type: "failed" }
  | { type: "animation-finished" }
  | {
    type: "response";
    result: RegistrationResult;
    httpOk: boolean;
    reducedMotion: boolean;
    contentHeight: number;
  };

export function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  switch (action.type) {
    case "submit":
      return state.status === "idle" || state.status === "error" ? { status: "submitting" } : state;
    case "failed":
      return state.status === "submitting"
        ? { status: "error", error: { ok: false, message: registrationRequestError } }
        : state;
    case "response":
      if (state.status !== "submitting") return state;
      if (!action.result.ok) return { status: "error", error: action.result };
      if (!action.httpOk) return { status: "error", error: { ok: false, message: registrationRequestError } };
      return {
        status: action.reducedMotion || action.result.alreadyRegistered ? "success" : "animating-success",
        contentHeight: action.contentHeight,
      };
    case "animation-finished":
      return state.status === "animating-success" ? { ...state, status: "success" } : state;
  }
}
