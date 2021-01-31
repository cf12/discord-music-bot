FROM node:14.4.0-stretch

USER root
RUN groupadd -r app && useradd --no-log-init -r -g app app
WORKDIR /home/app
RUN apt-get update
RUN apt-get -y install ffmpeg i965-va-driver
COPY ./package.json /home/app/package.json
COPY ./yarn.lock /home/app/yarn.lock
RUN yarn

COPY ./src /home/app/src
COPY ./config /home/app/config

USER app:video
ENTRYPOINT [ "node" ]
CMD [ "/home/app/src/bot.js" ]
