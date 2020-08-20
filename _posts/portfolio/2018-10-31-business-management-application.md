---
layout: post
title: Business Management
thumbnail: "assets/img/portfolio/Business Management Dashboard.png"
img: "assets/img/portfolio/Business Management Dashboard.png"
tags: [ServiceNow,App]
---

![Business Management Dashboard]({{ page.img | relative_url }})

Several departments that already operated their IT teams within our ServiceNow instance had the desire to bring their non-IT counterparts into ServiceNow to start gaining the benefit of the "help desk" features available and other functionality that ServiceNow provided (all infinitely better than the current "by e-mail" and Microsoft Excel solutions currently used). They sought to bring these non-IT teams into our Incident application, which would have caused complications to what Incident was designed for. <!--endexcerpt-->

From September to October, I created the Business Management custom application to provide a location for these non-IT departments to enter Service-Now but not necessarily jump into the IT-centric Incident.

The following features have been incorporated:
- Inbound actions with custom routing for different service desk e-mails.
- Process flow UI formatter
- The ability for individual Assignment Groups to self-define their own categories
- A working dashboard (pictured above) that displayed their groups stats and response times
- Quick report statistics like first response time, first response duration, and active times
- Several user-friendly UI actions for user's to adjust the state of their Business Management Case
- Color highlighting for VIP requestors
- Ability to restrict view-access to specific groups or users for security purposes.
- A robust event-based notification rule to ensure emails are distributed as expected and are centralized so editing them in the future makes sense

As of July 2019 and since its original implementation on 10/31/2018, there have been more than 8,000 Business Management cases created with more than 80 unique users. These users are entirely new users to our instances and thus new ITIL licenses joining our current IT-centric technician user base.