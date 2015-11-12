# DRAFT: pubfood

[![npm version](https://badge.fury.io/js/pubfood.svg)](https://badge.fury.io/js/pubfood)
[![Build Status](https://travis-ci.org/pubfood/pubfood.svg?branch=master)](https://travis-ci.org/pubfood/pubfood)

A browser client header bidding JavaScript library.

# Architecture Overview

![Architecture Overview - Requests](doc/pubfood-overview.png?raw=true "Architecture Overview")

# Build Tasks

## Build

- `npm start`

## Test

- `npm test`

## Build Output

- `build/pubfood.js`
- `build/pubfood.min.js`

## Deploy Process

- `npm run cut_deploy`
- `git push --tags origin master`
 - check the [travis build](https://travis-ci.org/pubfood/pubfood)
- write a release note such as
 - https://github.com/pubfood/pubfood/releases/tag/v0.1.9
- confirm the `pubfood` package is updated on npm
 - https://www.npmjs.com/package/pubfood
- post a release announcement here
 - https://pubfood.slack.com/messages/general/

# References
Some reasonable summaries if you're new to header bidding:

- http://adexchanger.com/publishers/the-rise-of-header-bidding-and-the-end-of-the-publisher-waterfall/
- http://www.adopsinsider.com/ad-exchanges/diagramming-the-header-bidding-redirect-path/
- https://www.yieldbot.com/blog/header-bidding/
