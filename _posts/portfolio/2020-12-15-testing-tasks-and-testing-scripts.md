---
layout: post
title: Test Plans and Test Scripts
img: "assets/img/portfolio/TestingScript.PNG"
thumbnail: "assets/img/portfolio/TestingScript.PNG"
date: December, 05 2020
tags: [ServiceNow, Documentation]
---

Does your development team have a testing task baked into your development pipeline? If yes, do you have a testing script style that is consistent throughout your team? It's a great step that provides plenty of benefits despite the extra time added to the process:<!--endexcerpt-->

## Why ##

- Quality assurance
- Collaboration without disrupting individual autonomy
- Forces developers to remember someone will use their creation
- Easy to convert to techncial documentation or end-user how-to guides
- A mean of communication to other members of the team and stakeholders
- Quantifiable step that allows for more accurate level of effort
- Easy to identify where in the pipeline a story/task is
- Risk management

## Process example ##

Both at my previous and current workplace we implemented a version of the development workflow:

1. An analyst is assigned a discovery/anlaysis/requirement gathering task.
2. A developer is assigned a development task based on requirements.
3. The developer moves their work from a development environment to a QA/Test environment.
4. A testing task with a test script is assigned to someone that was not the developer.
5. A successful test means the work is prepped for release to production. A unsuccessful test means we go back to step 2.

Step 4 could actually be one test task or even three; At my last workplace, we had a testing task for a different developer (peer review), an analyst (quality assurance), and finally the end-user (user acceptance).

## Writing test scripts ##

- Be descriptive. Does this script need to be written for someone who is not tech-savvy? Or someone who isn't a power-user of your application?
- Remember access/roles. Is it important to distinguish that the test should be done as a specific user or type of user? It's easy for admins to forget that the end-user experience may look different because of access.
- Have clear pass/fail checks. Explicitly tell the tester when they should be verifying something.
- Remember requirements. Your script should be based on the desire to validate the original story's requirements.

### Example of a test script ###

```
1. Log into the agent view of ServiceNow
2. In the filter navigator, navigate to Case => Cases => All Cases - All Groups
3. Open the most recently created case
4. Change the assignment group to another assignment group
5. Verify that the “Work notes” field becomes a required field.
6. Do not update the work notes field and click the “Save and Stay” button
7. Verify:
    a. The user’s view scrolls down to the “Work notes” field
    b. An error banner appears at the top of the case that says something similar to “Error Message: The following mandatory fields are not filled in: Work notes”
```

## For fun ##

I don't have anything on share.servicenow.com to make this easier for ya'll because it's more of a process improvement, but for fun, a long while ago I made a little tool to randomly generate silly ServiceNow testing scripts.

Try it out either by typing `!test` in the [sndevs](https://sndevs.com/) slack. Or by going to [this page hosted on the devprogramresources ServiceNow instance](https://devprogramresources.service-now.com/pc?id=servicenow_test_script_generator&sysparm_domain_restore=false&sysparm_stack=no).

![Screenshot of fake testing script](/assets/img/portfolio/TestingScript.PNG)