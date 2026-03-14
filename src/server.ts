import app from './app';
import { env } from './config/env';

// Forzar la aceptación de certificados SSL (Necesario para Railway/Supabase con Prisma)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
