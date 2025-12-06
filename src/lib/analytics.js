const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 200;

function callUmami(method, args = [], attempt = 0) {
    if (typeof window === "undefined") return;

    const umami = window.umami;
    if (umami) {
        try {
            if (typeof umami[method] === "function") {
                umami[method](...args);
                return;
            }
            if (typeof umami === "function") {
                umami(method, ...args);
                return;
            }
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("Umami call failed", { method, args, error });
            }
        }
    }

    if (attempt < MAX_ATTEMPTS) {
        const delay = BASE_DELAY_MS * Math.pow(1.5, attempt);
        setTimeout(() => callUmami(method, args, attempt + 1), delay);
    }
}

export function trackEvent(eventName, data = {}) {
    if (!eventName) return;
    callUmami("trackEvent", [eventName, data]);
}

export function trackView(url, referrer) {
    if (!url) return;
    callUmami("trackView", [url, referrer]);
}

export function trackError(description, metadata = {}) {
    if (!description) return;
    callUmami("trackEvent", ["error", { description, ...metadata }]);
}
