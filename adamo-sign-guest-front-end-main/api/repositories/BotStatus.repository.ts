

const baseurl = `https://adamo-sign-whatsapp-chatbot-production-885b.up.railway.app/api/whatsapp`;

class BotRepository {

    async sendSignedBot(
        token: string,
    ): Promise<{ code: number, to: number | undefined } | void> {

        let rawToken = token;
        if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
            rawToken = rawToken.slice(1, -1);
        }
        const body = JSON.stringify({ token: rawToken });

        const res = await fetch(`${baseurl}/signed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body
        });
        
        if (res.status === 204) {
            // No body in 204, so 'to' will be undefined
            return { code: 200, to: undefined };
        }

        if (res.ok) {
            // If the response has a body, parse it and extract 'to'
            const data = await res.json();
            return { code: res.status, to: data.to };
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error en fetch de documento:", res.status, errorText);
            throw new Error(`Error en fetch de documento: ${res.status} ${errorText}`);
        }
    }

    async rejectedDocumentBot(
        token: string,
    ): Promise<{ code: number, to: number | undefined } | void> {

        let rawToken = token
        if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
            rawToken = rawToken.slice(1, -1);
        }
        const body = JSON.stringify({ token: rawToken });

        const res = await fetch(`${baseurl}/rejected`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body
        });

        if (res.status === 204) {
            // No body in 204, so 'to' will be undefined
            return { code: 200, to: undefined };
        }

        if (res.ok) {
            // If the response has a body, parse it and extract 'to'
            const data = await res.json();
            return { code: res.status, to: data.to };
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error en fetch de documento:", res.status, errorText);
            throw new Error(`Error en fetch de documento: ${res.status} ${errorText}`);
        }
    }

}

const contactRepository = new BotRepository();
export default contactRepository;