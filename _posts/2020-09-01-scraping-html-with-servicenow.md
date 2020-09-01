---
layout: post
title: Scraping HTML with ServiceNow
img: "assets/img/postmanscreenshot.PNG"
thumbnail: "assets/img/slackerxkcd.PNG"
date: September, 01 2020
tags: [ServiceNow,API]
---

![Using ServiceNow to find relevant XKCD comics](/assets/img/slackerxkcd.PNG)

Yesterday, @wiz0floyd on the [sndevs](https://sndevs.com/) Slack workspace requested that an !xkcd command should be added to my Slacker bot. I thought it would be an easy enough thing to make since XKCD is a _hugely popular_ webcomic; There must be an API for such a thing. I soon realized there wasn't and had to get creative.<!--endexcerpt-->

For those who don't know, [xkcd.com](https://xkcd.com/) is a webcomic that is science/math/computer/human/etc. based. There are so many of these webcomics now, there is a joke that there is a relevant XKCD comic for everything. So the idea is let's have ServiceNow find relevant comics based on keywords.

There are websites that do this already but I wasn't able to find one with an exposed API. Without an existing API that means we basically had to do it ourselves.

Last year, I posted about a [ServiceNow Web Scraper](http://earlduque.com/2019/03/26/servicenow-web-scraper.html) that I made. We're going to use part of that functionality to do that now.

Here's the business rule broken down:

```js
(function executeRule(current, previous /*null when async*/) {

	var search = gs.urlEncode(current.text.replace(/!xkcd/,'').trim());
```

First, a command like `!xkcd wisdom of the ancients` is broken down to just `wisdom of the anicents` and then URL encoded. The URL encoding part is important since this is going to be part of a query parameter.

```js
	var rm = new sn_ws.RESTMessageV2();
	rm.setHttpMethod('GET');
    rm.setEndpoint('https://www.explainxkcd.com/wiki/index.php?search=' + search + '&title=Special%3ASearch&go=Go');
    rm.setRequestHeader('User-Agent', 'servicenow');
	var response = rm.execute();
	var body = response.getBody();
```

To explain this part we have to talk about REST GET messages and HTML parsing. For most integrations, you'd send a GET request to an API and you receive back an intentional message (like a string or a JSON object), but we don't have an API this time. So instead, I found the website [explainxkcd.com](https://www.explainxkcd.com/) and am utilizing its search page.

For those who don't know, when you use your internet brower and type in a new URL, you're basically sending a GET request and it's returning an HTML payload for your browser to display (this is simplified). So when you send a GET message via REST to a regular website, your respone body is basically the entire webpage itself (minus any dynamic content).

![scrape example](/assets/img/scrapeexample.PNG)

So what we're doing here is intentionally requesting the HTML of a webpage, specifically a search page that hopefully has a comic for us.

```js
    var result = body.match(/(?:<a href="\/wiki\/index.php\/)[0-9]+/gm)[0].replace(/<a href="\/wiki\/index.php\//g,''); 
```

Now that we have an HTML payload, it's a matter of figuring out a good regex to identify what we exactly need, and in my case, I noticed that `<a href="/wiki/index.php/` followed by any number of digits was exactly what I needed to isolate a comic number.

```js
    if (parseInt(result)){
		
		var rm2 = new sn_ws.RESTMessageV2();
		rm2.setHttpMethod('GET');
		rm2.setEndpoint('https://xkcd.com/' + result + '/info.0.json');
		rm2.setRequestHeader('User-Agent', 'servicenow');
		var response2 = rm2.execute();
        var body2 = JSON.parse(response2.getBody());
```

Now as long as my result was an integer, I knew I was in business. From there, xkcd.com indeed has a JSON API if you know the exact comic number you are looking for (they don't have one for searching by keywords). I took the number I got earlier and plugged it in and received this [JSON payload](https://xkcd.com/979/info.0.json): 

```json
{
  "month": "11",
  "num": 979,
  "link": "",
  "year": "2011",
  "news": "",
  "safe_title": "Wisdom of the Ancients",
  "transcript": "[deleted to save space]",
  "alt": "All long help threads should have a sticky globally-editable post at the top saying 'DEAR PEOPLE FROM THE FUTURE: Here's what we've figured out so far ...'",
  "img": "https://imgs.xkcd.com/comics/wisdom_of_the_ancients.png",
  "title": "Wisdom of the Ancients",
  "day": "18"
}
```

Now that I have everything I need (a title, an image, and an alt text) it was just a matter of parsing it together using the Slack script include I made:

```js
        var send_chat = new SlackFall().send_chat(current.channel, body2.safe_title + '\n' + body2.img + '\nAlt: ' + body2.alt, false, '', current.thread_ts);
    }

})(current, previous);
```

That results in what you see in the original screenshot:

![Using ServiceNow to find relevant XKCD comics](/assets/img/slackerxkcd.PNG)

There you have it, now you can use this idea in ServiceNow do a whole slew of interesting things:

- [Scrape websites](http://earlduque.com/2019/03/26/servicenow-web-scraper.html)
- [Grab video game stats](http://earlduque.com/2019/03/19/discord-bot-stat-tracker.html)
- Get headlines websites
- Get up/down statuses from downtime websites
- Check to see if a website has been updated
- Back up webpages
- and so on!