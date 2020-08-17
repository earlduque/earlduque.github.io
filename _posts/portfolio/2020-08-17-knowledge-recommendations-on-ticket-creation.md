---
layout: post
title: Knowledge Recommendations upon ticket creation
img: "assets/img/portfolio/ticket-knowledge-1.png"
date: August, 17 2020
tags: [Enhancement,ServiceNow]
---

To better aid customers in self-resolving their tickets, group managers can enable this feature so that users can receive an automatically generated list of Knowledge Base articles. Managers also have the ability to enforce certain articles to always appear in this list of these "recommended" articles. <!--endexcerpt-->

ServiceNow has [Contextual search for notifications](https://docs.servicenow.com/bundle/orlando-platform-administration/page/administer/contextual-search/task/define-email-configuration-for-cxs.html) but we wanted:

1. functionality to be uniform between roled users and public users
2. the ability to close the ticket immediately via links in the email
3. group managers can determine themselves if they want to use this functionality or not
4. group managers can co-opt this functionality to force specific articles to always appear ("Always this article because this month we know 90% of our tickets will be about this")

Managers can choose to have ServiceNow determine which articles will show:

![Image of automatic knowledge inclusion feature]({{ page.img | relative_url }})

Using this method, ServiceNow will attempt to find public knowledge base articles in this order:

1. Articles that contain every word that is found in the email subject/case short description
2. If no articles are found in step 1, then articles that contain at least one or more words from the email subject/case short description

ServiceNow uses an internal algorithm to rank the found articles by relevancy. The top three articles are chosen for the user. If less than three articles are found then only that many articles are provided. If no articles are found, this entire functionality is skipped for this case.

Or they can choose to manually include specific articles:

![Image of manual knowledge inclusion feature](/assets/img/portfolio/ticket-knowledge-2.png)

Using this method, ServiceNow will follow the same exact steps noted above for the "automatic" method, but will intentionally place the manually chosen articles first.

For example, in the screenshot above. Article 1 will always be KB0030588 v2.0. Since Article 2 and Article 3 was left blank, the automatic method will be run to try to fill in these two spaces. Likewise, if Article 1 and Article 2 was left blank but Article 3 was manually chosen, the automatic method will run to try to fill the first two spaces and the manually chosen article will be listed as number 3.

#### Notification to the user ####

When a new ticket is created for this group, a section appears in their email that provides a link to articles along with "Close my case" for self-resolution. When a user clicks on "Close my case" in their email, they are sent to the Service Portal and a closure notification is immediately shown to them:

![Image of articles included and what happens when a user clicks Close my case](/assets/img/portfolio/ticket-knowledge-3.png)

If the ticket was already resolved or closed, the user will instead see:

![Image of error message since the ticket was already closed](/assets/img/portfolio/ticket-knowledge-4.png)

On the ticket form, ITIL users will see a number of things:

![Image of Work Notes saying that the ticket has been closed by customer](/assets/img/portfolio/ticket-knowledge-5.png)

- Work notes are updated to inform the ServiceNow assignees that the cases has been closed by the customer and provides a link to the knowledge article that helped the customer
- The resolution notes are set to "Closed by Knowledge Article" and a hidden field "Knowledge Article" is revealed and set to the knowledge article that helped the customer
- The case status is set to "Resolved"

### Technical Direction (general steps to do it yourself) ###

- Section and fields added to sys_user_group
  - UI policies control hidden fields
  - Write ACLs for these fields are locked to manager/leads with snc_internal
- Email Template/Notification edited to include newly added email script
- Email script that attempts to find public knowledge articles according to the group configuration and email subject/case short_description. A lot of heavy lifting occurs in this script. A general rundown of its structure is provided below.
- "Close my case" links in notification have three URL parameters included: case sys_id, case number (to avoid having to do additional querying, this is displayed in the modal window), and knowledge article sys_id
- Widget on Service Portal homepage (no HTML widget) that checks for the three URL parameters, and if found, checks to see if the case is still open (if it isn't, displays the "already closed" modal window) and displays a mobile-friendly modal window informing the user that the case is closed.
- The widget does this by creating an event (under newly added event in registry)
- Event triggers newly added script action that in turn sets the case's status to "solution proposed," adds a work note, and sets resolution fields. **We do this via event** because we have to assume that the user has not logged in to ServiceNow yet. This is also the reason why we only query public knowledge articles.

#### Email script ####

Most code was simplified for readability. The actual script is 63 monstrous lines.

```
	if (/*feature is enabled for this ticket's group*/){
		
		var display_scores = false; // if true, shows actual ir_query score as determined by ServiceNow

		// Find top 3 articles according to the short description of the case
		if (/*Automatic articles are needed*/ ){
			/* Gliderecord that finds top 3 articles that match the ticket's short description*/
		}

		// If the group is set to "automatic" use the articles found in the query (if any)
		if (/*group is set to automatic*/){
			if (/*Articles were found*/) {
				//Introduction to knowledge section
			}
			while (kb_gr.next()){
				//Print links to articles and "Close my case" links
			}

		} else { //If set to "manual", use the given articles in the group settings, otherwise use the articles found in the query (if any)
			if (/*Manual articles were set or automatic articles found*/) {
				//Introduction to knowledge section
			}

			// Article 1
			if (/*Article 1 set*/){
				//Print link for article 1
			} else {
				//Print automatic link
			}

			// Article 2
			if (/*Article 2 set*/){
				//Print link for article 2
			} else {
				//Print automatic link
			}

			// Article 3
			if (/*Article 3 set*/){
				//Print link for article 3
			} else {
				//Print automatic link
			}
		}
	}

```