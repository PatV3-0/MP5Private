If you're on Windows run this first in the root of MP5:
dos2unix setup.sh

Install Docker

To start the container run:
docker compose up --build

Ports:
Daemon      -> 5000
Rest API    -> 3000 
Web         -> 8080

To use the cli