## cli commands
npx tsx cli.ts start (to start the daemon)
npx tsx cli.ts status (to check the status of the daemon)
npx tsx cli.ts stop (to stop the daemon)

## format of requests for cli
npx tsx cli.ts send-request --action="register" --payload="{\"username\":\"brobruh\",\"password\":\"yesno\",\"email\":\"bgayioui@gmail.com\",\"name\":\"yes\",\"surname\":\"no\"}"
npx tsx cli.ts register --payload="{\"username\":\"Ronan\",\"password\":\"yesno\",\"email\":\"bgayioui@gmail.com\",\"name\":\"yes\",\"surname\":\"no\"}"
