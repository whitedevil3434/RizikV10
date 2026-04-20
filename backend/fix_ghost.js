const fs = require('fs');
let code = fs.readFileSync('src/index.ts', 'utf8');

// The replacement logic:
code = code.replace(/let userId = await verifySupabaseJWT\(token, env\.SUPABASE_JWT_SECRET\);/g, `
        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
        const resUser = await fetch(supabaseUrl + "/auth/v1/user", {
          headers: { Authorization: "Bearer " + token, "apikey": env.SUPABASE_SERVICE_ROLE_KEY }
        });
        const userData = await resUser.json();
        let userId = userData?.id;
`);

fs.writeFileSync('src/index.ts', code);
