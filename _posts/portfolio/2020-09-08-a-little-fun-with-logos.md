---
layout: post
title: Animating the ServiceNow logo (and adding it to your banner)
img: "/assets/images/snlogos/ui16demo.gif"
thumbnail: "/assets/images/snlogos/ui16demo.gif"
date: September, 08 2020
tags: [ServiceNow]
---

![The animated logo in my personal developer instnace](/assets/images/snlogos/ui16demo.gif)

A couple weeks ago, I needed to practice some sprite-work and for fun, I animated the ServiceNow logo. As you can see from the above screen recording, it adds a little charm to my personal developer instance!

## Link to images ##

A repo of all the images can be found in this github repo: [earlduque/Animated-SN-Logos](https://github.com/earlduque/Animated-SN-Logos)

## Images ###

### Transparent background, bouncing O, formatted for UI 16 ###

<div style="background-color:#2a3e41">
    <img src="/assets/images/snlogos/servicenowbouncetransparentlogoui16.gif">
</div>

### Transparent background, bouncing O ###

![img](/assets/images/snlogos/servicenowbouncetransparentlogo.gif)

### White background, bouncing O ###

![img](/assets/images/snlogos/servicenowbouncewhitebglogo.gif)

### Transparent background, non-bouncing O ###

![img](/assets/images/snlogos/servicenowtransparentlogo.gif)

### White Background, non-bouncing O ###

![img](/assets/images/snlogos/servicenowwhitebglogo.gif)

## Adding it to your PDI ##

### My Company (newer PDIs) ###

1. In the filter navigator, go to `System Properties` > `My Company`
2. Upload the `servicenowbouncetransparentlogoui16.gif` to the `UI16 Banner Image` field
3. Refresh your page

### Banner image for UI16 (older PDIs) ###

1. In the filter navigator, go to `System Properties` > `Basic Configuration UI16`
2. Under `Banner image for UI16` click the `+` icon
3. Upload the image `servicenowbouncetransparentlogoui16.gif`
4. Refresh your page

### Banner image (even older PDIs) ###

1. In the filter navigator, go to `System UI` > `Images`
2. Create a `New` record
3. Name it servicenowlogobounce.gif or whatever you want as long as it ends with .gif
4. Click `Click to add...` and upload the image `servicenowbouncetransparentlogoui16.gif`
5. In the filter navigator, go to `System Properties` > `System`
6. Change the `Banner image` property to "servicenowlogobounce.gif" or whatever you picked in step 3
7. Click `Save` at the bottom
8. Refresh your page
