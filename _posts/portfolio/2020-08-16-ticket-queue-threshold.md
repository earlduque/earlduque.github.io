---
layout: post
title: Ticket Queue Threshold Notifications
thumbnail: "assets/img/portfolio/Ticket-Threshold-Notifications.png"
img: "assets/img/portfolio/Ticket-Threshold-Notifications.png"
date: August, 16 2020
tags: [Enhancement,ServiceNow]
---

![Image of threshold notification feature]({{ page.img | relative_url }})

Simple functionality but an example of a feature that was requested for one group ("Notify us every day our ticket queue is more than x tickets") that we re-tooled so that all groups could opt-in to the functionality. <!--endexcerpt-->

Managers of groups had the ability to configure their group so that they could:

- Receive notifications every day at 10am if their group had more active tickets than a certain threshold.
- Set the threshold number
- Set individual users or groups to receive this notification.

### Technical Direction (general steps to do it yourself) ###

- Section and fields added to sys_user_group
- UI policies control hidden fields
- Write ACLs for these fields are locked to manager
- Business Rule ensures threshold number is zero or positive
- Scheduled Script Execution runs at 10am daily, checks for groups with feature turned on then checks related ticket queue
- If conditions satisfied, creates event (under newly added event in registry)
Event generates notification