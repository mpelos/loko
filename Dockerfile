FROM node:13-alpine AS builder

WORKDIR /root

COPY package.json ./

RUN npm install
