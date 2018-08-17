# Mobile Web Specialist Certification Course

---
> **NOTE:** These are updated README instructions.
---

## Restaurant App Stage 2 - client app

Stage 1 required that a simple HTTP server be run manually in order to view and test the project. Stage 2 includes a build system that will automatically serve  the optimized site.

Two things must happen to run this project:

1. Create a file containing a valid Google Maps API key
2. Run the build system which will serve the optimized site

### Google API Key

A file named `GM_API_KEY` needs to be created in the root folder (`\`) with a valid Google Maps API key.

### Serve optimized site

Run the following command to build & serve the optimized site.

```bash
grunt serve:dist
```

This will start the server at `http://localhost:8000`.

### Build System
If you want to develop you can use the following commands.

#### Start the dev server

```bash
grunt serve
```

This will start the server at `http://localhost:8001`.

Changes can be made to the files in the `app/` directory. The browser will reload the changes on each file save.

#### Build & Optimize

```bash
grunt
```

This will build and optimize the project ready for deployment. It will output to the `dist/` folder

---
> **NOTE:** The original README notes are below this line
---

#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### Google API Key
A file named `GM_API_KEY` needs to be created in the root folder (`\`) of this project with a valid Google Maps API key.

Once done, run `grunt` from the command line. This will build the site and insert the API key into the HTML files.

```bash
grunt
```

### What do I do from here

1. From the `dist/` folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

    In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 
