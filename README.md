# README

### Code
1. CSS folder holds all of the styles
  - Fullpage.css is a library
  - Leaflet.css is a library
  - Style.css is our own code
2. JS folder holds the javascript code, including code from outside libraries and our own code
  - Libraries (everything in this folder is a library)
    - jquery.min.js
    - fullpage.js
    - leafelet.js
    - responsify.js (borrowed code)
  - Everything else is our own code
    - main.js
    - mapVis.js
    - victims.js
    - cleanData.js
    - demographicBubbles.js
    - likelinessVis.js
    - radialVis.js
    - timeline.js
3. img folder contains all of the images used for the submission
4. index.html is our main html page
5. sf_data folder holds all of our data. Links to the data sources can be found in our process book. We have data for stops and frisks, for the NY census, for NY crime statistics, and for NY police precincts.

Video is included in the website, and can be found [here](https://drive.google.com/file/d/16QCuCawuYIt_OXAV_jXM6MKaGT8dZf3B/view):

[Link to Process Book](https://docs.google.com/document/d/1inCxJwx6ghS2Z3-Pv2s4m3bgNAKVMZbBy4oFkDpmwD4/edit)

[Link to Project Website](https://miahcaine.github.io/nsmFinalProject/?fbclid=IwAR05z9XuAcKtmL9GdN38GMP4-PKFB-SMok0OPJQEaKk58m7lrv22Be84L1Q)


### Nonobvious Features
1. It would be useful to start the visualization with full screen and with any developer tabs close, just to help with the initial sizing of the visualizations. Once all data is loaded, feel free to resize the visualization. (This is particular helpful with the visualization entitled "Who Was Targeted". If it seems to be getting cut off at the right hand side, try reloading the website in the fullest screen.
2. For the sections of the website that provide more history and context to stop and frisk, the pictures act as buttons and they link to articles to learn more about stop and frisk
3. In the “Where were these stops occurring? How frequently?” section, the timeline features a tooltip. Additionally, for the map you can hover to learn more information about each precinct and you can click on a precinct to update the timeline to that particular precinct. To reset to the regular timeline, use the select box.
