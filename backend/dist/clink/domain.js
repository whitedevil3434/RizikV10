export const transitions = {
    draft: ["sent"],
    sent: ["accepted", "rejected", "expired"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["fulfilled", "cancelled"],
    fulfilled: ["accepted_by_counterparty", "partially_accepted", "disputed"],
    partially_accepted: ["disputed", "settled"],
    accepted_by_counterparty: ["settled"],
    disputed: ["settled"],
    settled: ["closed"],
    closed: [], rejected: [], cancelled: [], expired: [],
};
export class ClinkDomainError extends Error {
    code;
    status;
    constructor(code, message, status = 422) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = "ClinkDomainError";
    }
}
export function assertTransition(from, to) {
    if (!transitions[from].includes(to)) {
        throw new ClinkDomainError("INVALID_TRANSITION", `Cannot move commitment from ${from} to ${to}`);
    }
}
export function assertMaterialChange(current, next) {
    const fields = ["item", "quantity", "unit", "price", "currency", "deadline", "location", "paymentTerms", "acceptanceCriteria"];
    return fields.some((field) => next[field] !== undefined && next[field] !== current[field]);
}
export function createId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
}
export function now() { return new Date().toISOString(); }
