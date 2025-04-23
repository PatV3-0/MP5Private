FROM node:20-bullseye

#apache
RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

#app dir
WORKDIR /app

RUN mkdir daemon
RUN mkdir cli
RUN mkdir restapi
RUN mkdir jslib
RUN mkdir web

#copy core files
##daemon
COPY ../daemon/src/databases/* /app/daemon/
COPY ../daemon/src/templates/* /app/daemon/
COPY ../daemon/src/*.ts /app/daemon/

##cli
COPY ../daemon/src/databases/* /app/daemon/
COPY ../daemon/src/templates/* /app/daemon/
COPY ../daemon/src/*.ts /app/daemon/

##rest-api
COPY ../rest-api/src/* /app/restapi/

#front end to apache
RUN cp -r web-src/* /var/www/html/

# Install dependencies
RUN npm install -D tsx @types/node && \
    npm install jsonwebtoken bcrypt

# Copy entrypoint script from docker subfolder
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose required ports
EXPOSE 8080 3000 5000

# Start everything
CMD ["/entrypoint.sh"]
