/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

function notify(title, message = "", iconUrl = "icon.png") {
  const nid = "" + Date.now();
  browser.notifications.create(nid, {
    type: "basic",
    iconUrl,
    title,
    message,
  });

  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 3500);
}

browser.menus.create({
  title: extname,
  contexts: ["bookmark"],
  onclick: async (info) => {
    const baseURL = "https://www.youtube.com/watch";

    // unique vids
    const vids = new Set();

    if (!info.bookmarkId) {
      return;
    }

    const children = await browser.bookmarks.getChildren(info.bookmarkId);

    for (const child of children) {
      console.log(child.id);
      if (child.url.startsWith(baseURL)) {
        const params = new URL(child.url).searchParams;
        const param_v = params.get("v");

        if (param_v !== null) {
          // if v already in vids, we can delete this addioall bookmark
          if (vids.has(param_v)) {
            browser.bookmarks.remove(child.id);
            //console.debug('i would now remove', child.id, child.url, vids);
          } else {
            // first time seeing this vid, so lets save it
            vids.add(param_v);
          }
        }
      }
    }
    notify(extname, "done");
  },
});
