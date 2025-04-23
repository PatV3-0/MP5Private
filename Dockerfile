FROM node:20-bullseye

#apache
RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

#app dir
WORKDIR /app

RUN mkdir daemon cli restapi jslib web 

#copy core files
##daemon
RUN mkdir daemon/databases

COPY daemon/src/databases/ /app/daemon/databases
COPY daemon/src/templates/ /app/daemon/
COPY daemon/src/*.ts /app/daemon/
COPY daemon/src/encryption.js /app/daemon/
##cli
COPY cli/src/* /app/cli/

##rest-api
COPY rest-api/src/* /app/restapi/
COPY rest-api/jest.config.js /app/restapi/

##jslib
COPY js-lib/src/* /app/jslib/

#frontend
COPY frontend/* /app/frontend/

#front end to apache
RUN cp -r frontend/* /var/www/html/
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf


#dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

RUN npm install -D tsx @types/node && \
    npm install jsonwebtoken bcrypt chalk figlet commander

#start up
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh

#ports
EXPOSE 8080 3000 5000

#start
CMD ["/setup.sh"]
