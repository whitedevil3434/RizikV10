export async function verifyClinkBearer(request, secret) {
    const header = request.headers.get("Authorization");
    if (!header?.startsWith("Bearer ") || !secret)
        return null;
    try {
        const token = header.slice(7);
        const parts = token.split(".");
        const encodedHeader = parts[0];
        const encodedPayload = parts[1];
        const encodedSignature = parts[2];
        if (!encodedHeader || !encodedPayload || !encodedSignature)
            return null;
        const input = new TextEncoder().encode(encodedHeader + "." + encodedPayload);
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        const signature = Uint8Array.from(atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
        if (!await crypto.subtle.verify("HMAC", key, signature, input))
            return null;
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
        if (!payload.sub || (payload.exp && payload.exp < Math.floor(Date.now() / 1000)))
            return null;
        return payload.sub;
    }
    catch {
        return null;
    }
}
