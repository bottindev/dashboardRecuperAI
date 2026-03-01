export const config = {
  matcher: ["/((?!_vercel|favicon\\.ico).*)"],
};

export default function middleware(request) {
  const authHeader = request.headers.get("authorization") || "";

  if (authHeader.startsWith("Basic ")) {
    try {
      const base64 = authHeader.slice(6);
      const decoded = atob(base64);
      const colonIndex = decoded.indexOf(":");
      const user = decoded.substring(0, colonIndex);
      const pass = decoded.substring(colonIndex + 1);

      const expectedUser = process.env.AUTH_USER;
      const expectedPass = process.env.AUTH_PASSWORD;

      if (
        expectedUser &&
        expectedPass &&
        user === expectedUser &&
        pass === expectedPass
      ) {
        return;
      }
    } catch {
      // header malformado — cai no 401 abaixo
    }
  }

  return new Response("Acesso negado. Credenciais inválidas.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RecuperAI Dashboard", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
