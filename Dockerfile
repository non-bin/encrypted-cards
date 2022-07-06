FROM golang:alpine as builder
LABEL description="this builds and runs encrypted-cards"

# build
RUN mkdir /build
COPY . /build
WORKDIR /build
RUN go build

# make runner
FROM alpine:latest
RUN mkdir /app
WORKDIR /app
COPY --from=builder /build/ /app/

# new user to lower privs
RUN addgroup readcerts
RUN adduser -S -D -G readcerts -H -h /app appuser
RUN chown root:readcerts /app/certs/fullchain.pem 
RUN chmod 640 /app/certs/fullchain.pem 
RUN chown root:readcerts /app/certs/privkey.pem 
RUN chmod 640 /app/certs/privkey.pem
# I'm not sure this is so smart, but I think it is better than running as root or running an nginx just for TLS
USER appuser

RUN touch ./businesscards

ENTRYPOINT ./encrypted-cards -80 8080 -443 8443
# different ports, also to require less privs
EXPOSE 8080/tcp
EXPOSE 8443/tcp