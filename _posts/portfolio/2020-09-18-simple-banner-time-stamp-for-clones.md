---
layout: post
title: Simple Banner Time Stamp for cloned instances
img: "assets/img/clonecleanup.PNG"
thumbnail: "assets/img/clonecleanup.PNG"
date: September, 08 2020
tags: [ServiceNow]
---

![Image of an instance banner with a "Last Cloned" time stamp](/assets/img/clonecleanup.PNG)

We found that it is helpful to add the timestamp to the banner of our subproduction instances so that users will know when the data on that instance was last refreshed.<!--endexcerpt-->

[On Share](https://developer.servicenow.com/connect.do#!/share/contents/1655773_automatically_add_last_cloned_date_to_banner_when_cloning_to_subproduction_instances?t=PRODUCT_DETAILS) you can find an update set I loaded that has a post-clone cleanup script that will automate this for you.

If you want to add the script yourself:

1. Navigate to `System Clone` => `Clone Definition` => `Cleanup Scripts`
2. Create a new record, give it a name
3. Add the following script and save the record:

```js
var current_text = gs.getProperty('glide.product.description');
var iso = current_text.split('(');
var new_text = iso[0].trim() + ' (Last cloned: ' + new GlideDate() + ' ' + new GlideDateTime().getLocalTime().getByFormat('hh:mm:ss a') + ')';
gs.setProperty('glide.product.description', new_text);
```