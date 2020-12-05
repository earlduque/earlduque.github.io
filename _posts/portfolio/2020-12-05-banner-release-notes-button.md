---
layout: post
title: Banner Release Notes Button (and thoughts about Release Notes)
img: "assets/img/portfolio/BannerReleaseNotes.PNG"
thumbnail: "assets/img/portfolio/BannerReleaseNotes.PNG"
date: December, 05 2020
tags: [ServiceNow, Documentation]
---

One of my [earliest posts here](http://earlduque.com/2017/12/20/detailed-and-user-friendly-release-notes.html) was about revamping release notes. I talked about what makes release notes better, but in today's post, I want to talk about why release notes are good in the first place.<!--endexcerpt-->

### What are the benefits of having release notes? ###

1. Publicity. Have you ever wondered how much of the stuff you release even goes noticed? If you put them into release notes, more people can appreciate the work you/your team has been putting forward.
2. Marketing. I am a big believer that a great developer can sell their stuff as much as they can make it. This is your chance to demonstrate new features and show the benefit you/your team bring to the company and user base.
3. Transparency. Proof that you are working hard and (hopefully) proof of release goals being met. This is the easiest way to keep your stakeholders informed about changes to your product.
4. A story of progress. A paper trail that shows your product's evolution. When chronicled, it's even easier to celebrate your team's work and see how your instance has grown.
5. Builds trust with Change Management. Drafted release notes demonstrates to your CAB your exact goals. At UCSD, our CAB accepts our release notes article itself as a core document.

### Banner Release Notes Button ###

Realizing why release notes are such a great tool. We added a feature to our ServiceNow instance that makes it even easier for our users to access the latest instance release notes and see when new release notes have been published

![Screenshot of button](/assets/img/portfolio/BannerReleaseNotes.PNG)

![Screenshot of button badge](/assets/img/portfolio/BannerReleaseNotesBadge.PNG)

[Download from share](https://developer.servicenow.com/connect.do#!/share/contents/1655773_banner_release_notes_button?t=PRODUCT_DETAILS)

Displays a button on the UI15 or UI16 banner that when clicked will bring the user to the latest kb_knowledge article published in a specific kb_category.
* An unread "!" badge will also appear on this button for some time to let the user know that a new article has been published that they haven't seen yet.
* The badge goes away if too much time has passed or if the user has already viewed the article.
* Note: sometimes, the icon will not appear on first loads of dashboards due to too many AJAX calls, but will appear usually on the next visited page.
* Credit to James Neale for the code I found in his Xplore toolkit for displaying a button in the banner which is used in these update set.

Configurable options:

* You can configure the hover text for the button
* You can configure where the user will read the article
* You can configure how long the unread "!" badge will appear on the button before it goes away. We use 7 days.
* You can configure which icon to use for the button
* A way to publish new articles but suppress the "!" badge.