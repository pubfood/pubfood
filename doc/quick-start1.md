# Pubfood Quick Start - Simple

## Who?
You are a publisher setting up header bidding on your site. You need a framework
to facilitate adding bidding partners incrementally.

Your developers need a simple way to add bidding partners to your particular
ad server.

## What?
You have an ad server that auctions bidders for the impression.

You have one bid partner that has a JavaScript library to make bid requests
in order to set bid targeting values for your ad server request.

## Why?
Your bid partner provider can improve the impression yield for your site.
If you can get your partner's impression bid before the ad server request,
you can run an ad server auction to prioritize campaign creative selection by:

1. Direct sold campaign contracts;
2. Partner bid value; and
3. Fallback to ad exchanges.

Partnering with a header bidder helps improve monetization potential and yield
for your content page views.

However, understanding more about header bidding partner performance will help
you further manage your yield, budget forecasts, sales planning and partnerships.

## When?
When a user visits your site, timing is important.

Firstly, user experience is key so page load latency is very important.

Therefore, asking bidders for interest in a pageview within the accepatble
page load window is key to maintaining your brand, user attention and
monetization of your content.

## How?
<u>Let's make a few assumptions to set the stage:</u>

    1. you've decided that header bidding will complement revenue generated
    from your publication.

    2. you already have direct ad sales and these are serviced using an existing
    ad server service.

    3. your IT development team already have your ad server JavaScript code deployed
    on your site and want to reuse the code.

    4. your Ad Operations team have told you that they want to setup your ad server
    with specific line items targeting a partner's bid for specific slots and dimensions
    as they do today with competing direct sold campaigns.
