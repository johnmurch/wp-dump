const { AssetCache } = require("@11ty/eleventy-cache-assets");
const fs = require("fs").promises;
const path = require("path");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const BASE_URL = `https://botify.com`;
const ITEMS_PER_REQUEST = 10;

async function getAllKeys(key = "posts", showCache = true) {
  const cache = new AssetCache(`blog${key}`);
  let requests = [];
  let apiData = [];
  if (showCache) {
    console.log(`*Using cached blog${key}`);
    return cache.getCachedValue();
  }

  // make first request and merge results with array
  const request = await requestKeys(key);
  console.log(
    `Using API blog${key}, retrieving ` +
      request.pages +
      " pages, " +
      request.total +
      " total posts."
  );
  apiData.push(...request.data);

  if (request.pages > 1) {
    for (let page = 2; page <= request.pages; page++) {
      console.log("page", page);
      const request = requestKeys(key, page);
      await sleep(1000); // SLOW DOWN FOOL
      requests.push(request);
    }
    // resolve all additional requests in parallel
    const allResponses = await Promise.all(requests);
    allResponses.map((response) => {
      apiData.push(...response.data);
    });
  }

  // return data
  console.log("SAVE", apiData.length);
  await cache.save(apiData, "json");
  return apiData;
}

async function requestKeys(key, page = 1) {
  try {
    let keys = {
      posts: `${BASE_URL}/wp-json/wp/v2/posts`
    };
    const url = keys[key]
      ? `${keys[key]}?page=${page}&per_page=${ITEMS_PER_REQUEST}&order=desc`
      : "";
    if (url == "") {
      throw new Error("BAD URL");
    }
    console.log("url", url);
    const response = await fetch(url);
    const data = await response.json();
    let ids = data.map((d) => d.id);
    console.log(JSON.stringify(ids));

    // forget error handling for now
    let pages = parseInt(response.headers.get("x-wp-totalpages"), 10);
    let total = parseInt(response.headers.get("x-wp-total"), 10);
    return {
      total: total,
      pages: pages,
      data: data
    };
  } catch (err) {
    console.error("API not responding, no data returned", err);
    return {
      total: 0,
      pages: 0,
      data: []
    };
  }
}

// Function to save a post as a Markdown file
async function savePost(post) {
  const postContent = post.content.rendered;

  const metadata = `---
title: "${post.title.rendered.replace(/"/g, '\\"')}"
date: ${post.date}
excerpt: "${post.excerpt.rendered.replace(/"/g, '\\"').trim()}"
slug: ${post.slug}
---
`;

  const content = `${metadata}\n${postContent}`;
  await fs.writeFile(`./posts/${post.id}.md`, content, "utf8");
}

// Main function to fetch, convert, and save all posts
async function main() {
  const posts = await getAllKeys("posts", false);
  await fs.mkdir("./posts", { recursive: true }); // Ensure the directory exists
  let count = 1;
  for (const post of posts) {
    await savePost(post);
    console.log(`Saved post: ${post.id}.md`, count);
    count++;
  }
}

// Run the main function
main();
