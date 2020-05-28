FROM jrottenberg/ffmpeg:4.1-nvidia

USER root
RUN groupadd -r app && useradd --no-log-init -r -g app app
WORKDIR /home/app
COPY ./package.json /home/app/package.json
COPY ./yarn.lock /home/app/yarn.lock
COPY ./src /home/app/src
COPY ./config /home/app/config
RUN apt-get update
RUN apt-get -y install git curl gnupg build-essential libtool autoconf
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN npm install -g yarn
RUN yarn

USER app
ENTRYPOINT [ "node" ]
CMD [ "/home/app/src/bot.js" ]
