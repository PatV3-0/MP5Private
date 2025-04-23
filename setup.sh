#!/bin/bash
export MP5_SECRET_TOKEN="${MP5_SECRET_TOKEN}"

# daemon
npx tsx daemon/mpdbd.ts &

#rest api
node restapi/startServer.js &

#web
apachectl -D FOREGROUND
