import { createApp, sendToDaemon } from "./REST_api.js";

const app = createApp(sendToDaemon);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`REST API listening on port ${PORT}`);
});