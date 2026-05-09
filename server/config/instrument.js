import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://dc83dab176abfd0475eb71e11d110466@o4511354218676224.ingest.us.sentry.io/4511354227982336",

  integrations: [
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration()
  ],

 // tracesSampleRate: 1.0,

  profilesSampleRate: 1.0,

  sendDefaultPii: true,
});