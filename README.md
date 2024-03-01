# wp-dump

A quick proof of concept leveraging the power of eleventy-cache-assets for fetching, caching and creating front matter files for future data processing

### Shoutout to eleventy-cache-assets

Thanks to [https://github.com/11ty/eleventy-fetch](https://github.com/11ty/eleventy-fetch) I can fetch and then cache the data locally and rerun my build scripts without having to redownload the data

### Why

There are many times when you need to cache API requests as part of a data pipeline or processing.

### Inspiration

Inspired by this [post](https://stevenwoodson.com/blog/pulling-wordpress-content-into-eleventy) I was looking for a simple data dump for wordpress sites and stumble upon this post which was close to what I wanted to do. Given that most WordPress sites have this /wp-json/wp/v2 endpoint e.g. [https://www.botify.com/wp-json/wp/v2](https://www.botify.com/wp-json/wp/v2) you can take a quick look at all of their content as well as various parts like categories, tags, etc.

### Setup

```
npm install
```

```
node run.js
```
