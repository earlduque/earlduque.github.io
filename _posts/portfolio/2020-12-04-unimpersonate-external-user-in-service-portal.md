---
layout: post
title: Unimpersonate external user in Service Portal
img: "assets/img/portfolio/UnimpersonateExternalUser.PNG"
thumbnail: "assets/img/portfolio/UnimpersonateExternalUser.PNG"
date: December, 04 2020
tags: [ServiceNow]
---

![Image of unimpersonating an external user](/assets/img/portfolio/UnimpersonateExternalUser.PNG)

On share, there is a great project by Phuong Nguyen for implementing a great impersonate dialog window into the Service Portal, found [here](https://developer.servicenow.com/connect.do#!/share/contents/6416148_service_portal_impersonate_dialog?t=PRODUCT_DETAILS). Unfortunately, it uses a NOW API to handle a lot of the impersonating and end impersonation functionality, which snc_external users (from the Explicit Roles plugin, which is a required plugin for some bigger plugins like Customer Service management) aren't able to access. Until Phuong implements functionality to handle this into his share project, this small update will at least add an "unimpersonate" button to the service portal for specifically snc_external users.<!--endexcerpt-->

After installing [the update set from share](https://developer.servicenow.com/connect.do#!/share/contents/1655773_service_portal_unimpersonate_external_user_for_instances_with_explicit_roles?t=PRODUCT_DETAILS), to implement, choose either of these methods:

#### If you are using the "Service Portal - Impersonate Dialog" feature by Phuong Nguyen from share.servicenow.com OR if you are using an already customized sp\_header\_footer record:

1.  Go to Service Portal -> Headers & Footers
2.  Open the record that your portal uses (You can find this by going to Service Portal -> Portals -> your portal -> Theme -> Header)
3.  Clone it
4.  Add `<li ng-if="data.isImpersonating"><widget id="unimpersonate-button"></widget></li>` to the end of the dropdown ul tag
5.  Add `if(gs.getImpersonatingUserName() != null && gs.hasRole('snc_external')) data.isImpersonating = true;` to the end of the server script
6.  Save
7.  Go to Service Portal -> Themes and open the theme you are using
8.  Change the Header field to the newly cloned sp\_header\_footer record
9.  Save

#### If you are not using the "Service Portal - Impersonate Dialog":

1.  Go to Service Portal -> Themes and open the theme you're using (You can find this by going to Service Portal -> Portals -> your portal -> Theme)
2.  Change the Header to "Stock Header with Unimpersonate"