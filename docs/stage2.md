---
title: Restaurant Review App - Stage 2
description: Code Notes by James Priest
---
<!-- markdownlint-disable MD022 MD032 -->
# Code Notes

[<-- back to Restaurant Review Code Notes homepage](../index.html)

---

Here are the requirements for Stage 2:
- Pull data through Ajax (Fetch API) from a live data source
- Cache the JSON response data on the client with IndexedDB for offline access
- Create a build system with Grunt, Gulp, Webpack, or Parcel
- Ensure Lighthouse performance benchmarks meet the following:
  - **Progressive Web App** - 90 or better
  - **Performance** - 70 or better
  - **Accessibility** - 90 or better

## 1. Stage 2 Prep
### 1.1 Fork & Clone Repo
The first thing to do was fork the [mws-restaurant-stage-2](https://github.com/udacity/mws-restaurant-stage-2) starter project.

This is a Local Development API Server and will not be the project we'll be working on. Instead, we spin this server up and continue extending the  work on our stage-1 project.

- Stage-1 consists of the front-end
- Stage-2 is a back end dev server that provides the API services our app will consume

### 1.2 Install Dependencies
Read README.md. It describes the following steps to install all npm dependencies and spin up the server.

#### Install Global Dependencies
From the command line enter the following.

```bash
npm install sails -g
```

#### Install Project Dependencies
Next install all project dependencies. This will install all packages that are detailed in the `packages.json` project file.

```bash
npm install
```

### 1.3 Start Server
You can then start the server with the following command.

```bash
node server
```

## 2. Ajax with Fetch
### 2.1 API Usage
The API can be tested in a few different ways. Here's what the README shows in terms of usage.

#### Usage
##### Get Restaurants

```bash
curl "http://localhost:1337/restaurants/"
```

##### Get Restaurants by id

```bash
curl "http://localhost:1337/restaurants/{3}"
```

### 2.2 Test API
There are a few different ways to test whether the API is working properly.

You can use
- Browser URL
- Fetch in Console
- Ajax Test App

### 2.3. Test API: Browser
A quick and dirty way to test is to copy the url into the url bar of your browser.

[![Browser URL](assets/images/2-1-small.jpg)](assets/images/2-1.jpg)
**Figure 1:** Browser URL

### 2.4. Test API: DevTools
You can also write a `fetch` request right in the console of your browser.

[![DevTools Fetch Call](assets/images/2-2-small.jpg)](assets/images/2-2.jpg)
**Figure 2:** DevTools Fetch Call

You might have to use `<SHIFT>` + `<ENTER>` in order to skip lines without submitting the code.

What is initially returned is a Promise in *pending* state. Once the promise resolves the results should output to the console immediately afterwards.

You'll need to click the arrow to expand the array.

> **NOTE:** For security reasons you can only `fetch` from the same domain. Meaning you can't fetch data from `http://unsplash.com` if you are on `http://google.com`.
>
> Also note that if the Promise does not resolve with output to the console, you may need to refresh the page and try again.

[![DevTools Fetch Results](assets/images/2-3-small.jpg)](assets/images/2-3.jpg)
**Figure 3:** DevTools Fetch Results

Here is the fetch code.

```js
fetch('http://localhost:1337/restaurants')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.log("Booo"))
```

### 2.5. Test API: Ajax App
You can use an app like Postman to really test all permutations of an Ajax call.

This is a good option if need to really test and understand what is returned in a complex Web API.

Here is the output of a restaurant call

[![Postman App](assets/images/2-4-small.jpg)](assets/images/2-4.jpg)
**Figure 4:** Postman App

The advantage of an app like this is

1. You don't need to write complex code in the console to make it work. Just submit your fetch string as the request
2. The response is color coded and easier to read than browser output.

## 3. Change Folder structure
This was done to prep my code so it would fit into a more traditional build process.

This is one in which source files from one directory are transformed and copied to a working or distribution directory.

### 3.1 Organization Benefits
The next step I took was to organize my code into a build folder structure. This does the following.

- Cleans the clutter out of the project root
- Sets the folder where my source code goes to use as part of my build process (`/src/` or `app/`)
- Allows me to set a `tmp/` folder where code will be copied and served by a dev server after it's processed
- Allows me to set a `dist/` folder for minified code

### 3.2 New Folder Structure
I decided to put all source files into an `app/` folder. From there I can have my Grunt or Gulp tasks process those files and place the transpiled and minified code into a `dist/` folder.

[![New Folder Structure](assets/images/2-5-small.jpg)](assets/images/2-5.jpg)
**Figure 5:** New Folder Structure

### 3.3 Update .gitignore
Along with the folder structure changes, I made an update to my `.gitignore` file.

```bash
# build, dist, & tmp directories
build/
dist/
tmp/
```

This prevents build or output folders from being copied to GitHub which is unnecessary since those folders (and files) will be created when the build tasks are run.

## 4. Fix Grunt Tasks
Changing the folder structure broke my old Grunt tasks. I wanted to fix that before moving on to Gulp.

### 4.1 Original Build
In Stage 1, Grunt was designed to only to create a set of responsive images. This consisted of the following tasks:

- `clean` - Delete everything from the `img/` directory
- `responsive_images` - Take each image in `img_src/`, process at different resolutions (300, 400, 600, 800), and save to `img/` folder.

### 4.2 Copy Task
Since the files will be served from a new folder, I had to copy all non-processed files to the `dist/` folder.

This required a `copy` task to move css, js, & unprocessed image files.

```js
copy: {
  dev: {
    files: [
      { expand: true, cwd: 'app/', src: ['sw.js'], dest: 'dist/'},
      { expand: true, cwd: 'app/', src: ['css/*'], dest: 'dist/' },
      { expand: true, cwd: 'app/', src: ['js/*'], dest: 'dist/'},
      { expand: true, cwd: 'app/', src: ['img/fixed/*'], dest: 'dist/' }
    ]
  }
},
```

### 4.3 String Replace Task
Next, I moved my Google Maps API key out of my HTML files so it won't be visible, stolen, or used by someone else browsing my source code on GitHub.

I moved it to a file named `GM_API_KEY` and placed that file at the project root. I also updated `.gitignore` with this filename so it wouldn't be copied to GitHub.

```bash
# Google Maps API key
GM_API_KEY
```

Next, I added this task

```js
'string-replace': {
  dist: {
    files: [{
      expand: true, cwd: 'app/', src: ['*.html'], dest: 'dist/'
    }],
    options: {
      replacements: [{
        pattern: '<API_KEY_HERE>',
        replacement: '<%= grunt.file.read("GM_API_KEY") %>'
      }]
    }
  }
},
```

It looks in the `app/` folder for any HTML files and replaces `<API_KEY_HERE>` with the actual key value and then copies that to the `dist/` folder.

### 4.4 Final Gruntfile
The last steps were to update the existing `clean` and `responsive-images` tasks to use the new directory structure.

Here's the final `Gruntfile.js` configuration.

```js
module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      dev: {
        src: ['dist/*'],
      }
    },
    copy: {
      dev: {
        files: [
          { expand: true, cwd: 'app/', src: ['sw.js'], dest: 'dist/'},
          { expand: true, cwd: 'app/', src: ['css/*'], dest: 'dist/' },
          { expand: true, cwd: 'app/', src: ['js/*'], dest: 'dist/'},
          { expand: true, cwd: 'app/', src: ['img/fixed/*'], dest: 'dist/' }
        ]
      }
    },
    'string-replace': {
      dist: {
        files: [{
          expand: true, cwd: 'app/', src: ['*.html'], dest: 'dist/'
        }],
        options: {
          replacements: [{
            pattern: '<API_KEY_HERE>',
            replacement: '<%= grunt.file.read("GM_API_KEY") %>'
          }]
        }
      }
    },
    responsive_images: {
      dev: {
        options: {
          engine: 'gm',
          sizes: [
            {
              width: 300,
              quality: 40
            },
            {
              width: 400,
              quality: 40
            },
            {
              width: 600,
              quality: 40,
              suffix: '_2x'
            },
            {
              width: 800,
              quality: 40,
              suffix: '_2x'
            }
          ]
        },
        files: [{
          expand: true,
          cwd: 'app/img/',
          src: ['*.{gif,jpg,png}'],
          dest: 'dist/img/'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-responsive-images');
  
  grunt.registerTask('quick', ['copy', 'string-replace']);

  grunt.registerTask('default', ['clean', 'copy', 'string-replace', 
    'responsive_images']);
};
  
```

## 5. Gulp Tasks
### 5.1 Gulp Prep
### 5.2 Basic config

### 5.3 Transpile & Bundle

### 5.4 Responsive Images
 