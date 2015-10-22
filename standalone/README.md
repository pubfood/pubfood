# Hapi Simulation Server

## Requirements

- nodejs (see https://nodejs.org/en/download/package-manager/ for install instructions)

## Start the server

- npm install
- node lib/server.js
- point your browser to `http://localhost:3002/minimal.html`


This allows test scenarios to be hosted locally and is meant to serve as a
reference to allow more easily slipping into testing things by yourself.

The version of `pubfood` made available is from the build and the other
resources are served statically out of the `public` folder. The simulated
providers are available and they can have the server delay they incur tweaked
as incoming query params so as to allow a wider range of scenario testing.

## DNS and different domains
The intention is to have a "run local" style where you would edit your `/etc/hosts`
file to allow more than one domain to be hosted locally.

Also a hosted version of this simulation server will be hosted under different
domains so you could hit those hosted domains instead.
