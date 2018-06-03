<!-- markdownlint-disable MD022 MD024 MD032 -->
# Code Log

These notes chronicle the following:
- Administrative prep & set-up
- Making the Restaurant Review App fully responsive
- Writing code required to meet that objective
- Making any other additions necessary to meet the [project specifications](https://review.udacity.com/#!/rubrics/1090/view)

## 1. Prep
### 1.1 Local Setup
In preparation to complete stage one of this project, I had to do the following:

1. Fork and clone the [starter repository](https://github.com/udacity/mws-restaurant-stage-1).
2. Get my own [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).
3. Get an http server going on localhost. I used [http-server](https://www.npmjs.com/package/http-server), a node-based command-line http-server.

### 1.2 Set up Jekyll
This is done so I could turn my markdown notes into a statically generated website. This Jekyll setup is the same one used by GitHub Pages to generate the site on their servers once I push my Markdown notes and enable the feature on the repository.

I followed these steps to get a version of the Jekyll build system running locally.

1. Create a 'docs/' folder off my repo root.
2. Add a 'README.md' to the 'docs/' folder.
3. `git commit...` & `git push` to update the repo on GitHub.
4. On GitHub, go to your repo's Settings -> GitHubPages -> Theme Chooser. I chose the "Leap Day" theme.
5. On GitHub, under Settings -> GitHubPages -> Source, choose '**master branch /docs folder**' & hit Save.
6. This adds a new commit on GitHub so you need to do a `git pull` to get the latest changes locally.
7. Copy any customized files from the jekyll template (Leap Year theme in this case) into this repo. I have quite a few customized files, so this includes the following folders that are copied into 'docs/':
    - '_layouts/'
    - 'assets/css/'
    - 'assets/images/'
    - 'assets/js/'

### 1.3 Set up Grunt
This is done so that I can automate the process of compressing screen captured images for these notes. I followed the instructions in this post
- [Generate multi-resolution images for srcset with Grunt](https://addyosmani.com/blog/generate-multi-resolution-images-for-srcset-with-grunt/)

to create a Gruntfile.js to work with my setup.

Here's what I did
1. Create a 'docs/src/' folder to contain all original JPGs.
2. Created a packages.json under 'docs/'. Steps to do so are in [Grunt Getting Started](https://gruntjs.com/getting-started).
3. Created my Gruntfile.js.
4. Run `npm install`.
5. Run `grunt`.

#### package.json

```json
{
  "name": "mws-restaurant-stage-1-grunt",
  "version": "0.1.0",
  "description": "grunt task for creating multi-sized responsive images",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  ,
  "repository": {
    "type": "git",
    "url": "https://github.com/james-priest/mws-restaurant-stage-1.git"
  },
  "author": "James Priest",
  "license": "ISC",
  "devDependencies": {
    "grunt": "^1.0.2",
    "grunt-contrib-clean": "^1.1.0",
    "grunt-contrib-watch": "^1.1.0",
    "grunt-responsive-images": "^1.10.1"
  }
}
```

#### Gruntfile.js

 ```js
responsive_images: {
  dev: {
    options: {
      sizes: [
        {
          width: 800,
          quality: 85,
          rename: false
        },
        {
          name: 'small',
          width: 570,
          quality: 85
        }
      ]
    },
    files: [{
      expand: true,
      cwd: 'src/images/',
      src: ['*.{jpg,png}'],
      dest: 'assets/images/'
    }]
  }
},
watch: {
  dev: {
    files: ['src/images/*.{jpg,png}'],
    tasks: ['responsive_images']
  }
}
```

## 2. Work on site

### 2.1 Starting the http-server
I then fired up the server to look at the site in its current state.

```bash
http-server . -p 8000
```

### 2.2 Viewing the original site
Here are some screen grabs of the site without as it looked "out-of-the-box".

#### BEFORE
[![Homepage map](assets/images/1-small.jpg)](assets/images/1.jpg)
**Figure 1:** Homepage map

[![Homepage restaurants](assets/images/2-small.jpg)](assets/images/2.jpg)
**Figure 2:** Homepage restaurants

[![Detail restaurant page: map & image](assets/images/3-small.jpg)](assets/images/3.jpg)
**Figure 3:** Detail restaurant page: map & image

[![Detail restaurant page: reviews](assets/images/4-small.jpg)](assets/images/4.jpg)
**Figure 4:** Detail restaurant page: reviews

### 2.3 First set of changes
Here are the steps I applies

1. Added UTF meta tag to both index.html & restaurant.html
    ```html
    <meta charset="UTF-8">
    ```
2. Added viewport meta tag to both index.html & restaurant.html
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ```
3. Increased default `font-size` to `16px` for small displays
    ```css
    /* font-family: Arial, Helvetica, sans-serif; */
    /* font-size: 10pt; */
    /* line-height: 1.5; */
    body,td,th,p {
      font: 16px/1.6 Arial, Helvetica, sans-serif;
    }
    ```
4. Commented out all unnecessary css style rules in 'styles.css'. This included
    - Hardcoded `width` settings on various elements
    - Hardcoded `font-size` settings on various elements
    - Unnecessary `margin` or `padding`
    - Unnecessary `position: fixed` and `position: absolute`
5. Added `display: grid` and `display: flexbox` for content centering
    - Header nav
    - Restaurant list
6. Went back and set `width: 100%` so elements would fill available space.

### 2.4 Viewing updated flow layout

#### AFTER HTML & CSS UPDATES
[![Homepage map with flow layout](assets/images/5-small.jpg)](assets/images/5.jpg)
**Figure 5:** Homepage map with flow layout

[![Homepage restaurants with flow layout](assets/images/6-small.jpg)](assets/images/6.jpg)
**Figure 6:** Homepage restaurants with flow layout

[![Detail restaurant page: map & image with flow layout](assets/images/7-small.jpg)](assets/images/7.jpg)
**Figure 7:** Detail restaurant page: map & image with flow layout

[![Detail restaurant page: reviews with flow layout](assets/images/8-small.jpg)](assets/images/8.jpg)
**Figure 8:** Detail restaurant page: reviews with flow layout

