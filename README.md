# DRAFT: pubfood

[![npm version](https://badge.fury.io/js/pubfood.svg)](https://badge.fury.io/js/pubfood)
[![Build Status](https://travis-ci.org/pubfood/pubfood.svg?branch=master)](https://travis-ci.org/pubfood/pubfood)

A browser client header bidding JavaScript library.

# Architecture Overview

![Architecture Overview - Requests](doc/pubfood-api-flow-requests.png?raw=true "Architecture Overview - Requests")
![Architecture Overview - Creative](doc/pubfood-api-flow-creative.png?raw=true "Architecture Overview - Creative")
![Architecture Overview - Report](doc/pubfood-api-flow-report.png?raw=true "Architecture Overview - Report")

# Build Tasks

## Build

- `npm start`

## Test

- `npm run test`

## Build Output

- `build/pubfood.js`
- `build/pubfood.min.js`

## Deploy Process

- `npm run cut_deploy`
- `git fetch`
- `git rebase`
- `git push`
- `git push origin --tags`
- check the [travis build](https://travis-ci.org/pubfood/pubfood)

# References
Some reasonable summaries if you're new to header bidding:

- http://adexchanger.com/publishers/the-rise-of-header-bidding-and-the-end-of-the-publisher-waterfall/
- http://www.adopsinsider.com/ad-exchanges/diagramming-the-header-bidding-redirect-path/
