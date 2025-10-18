//access VScode API object
const vscode = acquireVsCodeApi();
console.log("Checking... Are you sure");

let search = null;
let searchButton = null;
let videos = null;
let all = null;
let music = null;
let entertainment = null;
let technology = null;
let gaming = null;
let currentTabPointer;

try {
  let currentSearchValue = "";

  search = document.querySelector(".Search");

  searchButton = document.querySelector("#search-button");

  videos = document.querySelector(".videos");

  all = document.querySelector(".active_all");

  music = document.querySelector(".active_music");

  entertainment = document.querySelector(".active_entertainment");

  technology = document.querySelector(".active_technology");

  gaming = document.querySelector(".active_gaming");

  if (
    !search ||
    !searchButton ||
    !videos ||
    !all ||
    !music ||
    !entertainment ||
    !technology ||
    !gaming
  )
    throw "Unable to find element";

  let listOfTabs = [all, music, entertainment, technology, gaming];
  let allVideos = []; //the trending vidoes (I do not know y I used allVideos)
  let musicVideos = [];
  let entertainmentVideos = [];
  let technologyVideos = [];
  let gamingVideos = [];

  //add currentTab class to the all tab
  if (!all.classList.contains("currentTab")) {
    all.classList.add("currentTab");
    currentTabPointer = "all";
    listOfTabs.forEach((item) => {
      if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
        if (!item.classList.contains("notCurrentTab")) {
          item.classList.add("notCurrentTab");
        }
      }
    });
  }

  //add event listner for when we receive message from extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "IS_API_KEY_VALID":
        console.log("First Pass");
        //below will be based on whether the token is empty or there is value in it
        const token = message.text;
        //add new child
        const node = document.createElement("h3");
        node.className = "h3Node";
        let textNode = undefined;

        //remove all child element if any
        for (let i = 0; i < videos.children.length; i++) {
          videos.removeChild(videos.children[i]);
        }

        //check if token is undefined
        if (token != undefined) {
          console.log("Token is: ", token);
          if (token.trim().length <= 0) {
            textNode = document.createTextNode("API KEY NOT DETECTED");
            node.appendChild(textNode);
            videos.appendChild(node);
            //send message back to extension that API KEY NOT DETECTED
            vscode.postMessage({
              command: "NO_API_KEY",
              text: "API KEY NOT DETECTED",
            });
          } else {
            //Maybe an API KEY, but could be invalid
            textNode = document.createTextNode("Loading more videos...");
            node.appendChild(textNode);
            videos.appendChild(node);
            //send message back to extension that API KEY NOT DETECTED
            vscode.postMessage({
              command: "API_KEY_DETECTED",
              tab: "ALL",
              text: "API KEY HAS BEEN Added",
            });
          }
        } else {
          console.log("TOKEN: ", token);
          textNode = document.createTextNode("API KEY NOT DETECTED");
          node.appendChild(textNode);
          videos.appendChild(node);
          //send message back to extension that API KEY NOT DETECTED
          vscode.postMessage({
            command: "NO_API_KEY",
            text: "API KEY NOT DETECTED",
          });
        }
      case "RESOURCE":
        //reset textNode -  delete all children element videos
        for (let i = 0; i < videos.children.length; i++) {
          videos.removeChild(videos.children[i]);
        }

        console.log("Current Tab: ", currentTabPointer);

        //add the CSS properties to parent div that holds the video
        let resources = message.text;
        console.log("Resources: ", typeof resources);
        console.log("Actual Resources: ", resources);
        //loop through the given array and are return array of the videos
        //Could
        if (currentTabPointer === "all" && resources.length > 0) {
          allVideos = resources;
        } else if (currentTabPointer === "music" && resources.length > 0) {
          musicVideos = resources;
        } else if (
          currentTabPointer === "entertainment" &&
          resources.length > 0
        ) {
          entertainmentVideos = resources;
        } else if (currentTabPointer === "technology" && resources.length > 0) {
          technologyVideos = resources;
        } else if (currentTabPointer === "gaming" && resources.length > 0) {
          gamingVideos = resources;
        } else {
          throw "An error occured";
        }
        //based on what value currentTabPointer is then use
        let videoArray = resources.map((item) => {
          //create video nodes for each
          let videoNode = document.createElement("div");
          videoNode.className = "video";
          //create thumbnail div
          let thumbnailNode = document.createElement("div");
          thumbnailNode.className = "thumbnail";
          //create image for thumbnail
          let thumbnailImage = document.createElement("img");
          //Seems like some image URL might not exist, check which exist
          if (item.thumbnail?.maxres) {
            thumbnailImage.src = item.thumbnail.maxres.url;
          } else if (item.thumbnail?.high) {
            thumbnailImage.src = item.thumbnail.high.url;
          } else if (item.thumbnail?.medium) {
            thumbnailImage.src = item.thumbnail.medium.url;
          } else if (item.thumbnail?.standard) {
            thumbnailImage.src = item.thumbnail.standard.url;
          } else {
            //default
            thumbnailImage.src = item.thumbnail.default.url;
          }
          thumbnailImage.width = 1280;
          thumbnailImage.height = 720;
          //append thumbmailImage to thumbnail
          thumbnailNode.appendChild(thumbnailImage);

          //append thumbnailNode to video
          videoNode.appendChild(thumbnailNode);

          //create video info node
          let videoInfoNode = document.createElement("div");
          videoInfoNode.className = "video-info";
          //create title node
          let title = document.createElement("p");
          title.innerText = item.title;
          videoInfoNode.appendChild(title);

          //append videoInfoNode to video
          videoNode.appendChild(videoInfoNode);
          return videoNode;
        });
        videos.className = "videosStyle";
        videoArray.forEach((item) => {
          videos.appendChild(item);
        });
    }
  });

  //add event listnere for webView window change
  window.addEventListener("resize", () => {
    //No point in doing this, but lets leave it just in case we need something
  });

  let isMax = false;
  const timoutInterleaved = 200;
  let timeout;
  //add event listener for scrolling
  window.addEventListener("scroll", () => {
    const maxScrollY =
      document.documentElement.scrollHeight - window.innerHeight;
    //check if we have reached end of page (Will then make request)
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      //Get current window.scrollY+window.innerHeight
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight
      ) {
        if (!isMax) {
          console.log("Has Reached Max");
        }
        isMax = true;
      }
    }, timoutInterleaved);
  });

  //add event listner to search-button
  searchButton.addEventListener("click", () => {
    //get the current value from search
    currentSearchValue = search.value;
    //make sure that is search value is empty string, no request is made. if the length is 0, then we do not do anything

    if (currentSearchValue.trim().length > 0) {
      console.log(currentSearchValue);
      vscode.postMessage({
        command: "test",
        text: "Hello world",
      });
    }
  });

  //add event listner to videos (Think this is done)

  //add event listner to all
  all.addEventListener("click", () => {
    //have a pointer to check what section current on
    if (currentTabPointer == "all") {
      //Retrieve data from 'all specfic array' (No need to change CSS)
    } else {
      //Retrieve data from 'all specfic array' (change CSS)
      currentTabPointer = "all";

      //add currentTab class to the all tab
      if (!all.classList.contains("currentTab")) {
        all.classList.add("currentTab");
        all.classList.remove("notCurrentTab");
        listOfTabs.forEach((item) => {
          if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
            if (item.classList.contains("currentTab")) {
              item.classList.remove("currentTab");
              if (!item.classList.contains("notCurrentTab")) {
                item.classList.add("notCurrentTab");
              }
            }
          }
        });
      }
    }
    //no need to make request again, simply use the data stored within the array
    console.log("allVideos Length: ", allVideos.length);
    if (allVideos.length <= 0) {
      vscode.postMessage({
        command: "API_KEY_DETECTED",
        tab: "ALL",
        text: "Lets get some music",
      });
    }
  });

  //add event listner to music
  music.addEventListener("click", () => {
    //have a pointer to check what section current on
    if (currentTabPointer == "music") {
      //Retrieve data from 'music specfic array' (No need to change CSS)
    } else {
      //Retrieve data from 'music specfic array' (change CSS)
      currentTabPointer = "music";

      //add currentTab class to the music tab
      if (!music.classList.contains("currentTab")) {
        music.classList.add("currentTab");
        music.classList.remove("notCurrentTab");
        listOfTabs.forEach((item) => {
          if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
            if (item.classList.contains("currentTab")) {
              item.classList.remove("currentTab");
              if (!item.classList.contains("notCurrentTab")) {
                item.classList.add("notCurrentTab");
              }
            }
          }
        });
      }
    }

    //when the extension first starts, obviously, no data will be within the array. So when user clicks this tab, make a request and get data. Once we have data, store it in array. No need to make more request for now
    console.log("musicVideos Length: ", musicVideos.length);
    if (musicVideos.length <= 0) {
      vscode.postMessage({
        command: "API_KEY_DETECTED",
        tab: "MUSIC",
        text: "Lets get some music",
      });
    }
  });

  //add event listner to entertainment
  entertainment.addEventListener("click", () => {
    //have a pointer to check what section current on
    if (currentTabPointer == "entertainment") {
      //Retrieve data from 'entertainment specfic array' (No need to change CSS)
    } else {
      //Retrieve data from 'entertainment specfic array' (change CSS)
      currentTabPointer = "entertainment";

      //add currentTab class to the entertainment tab
      if (!entertainment.classList.contains("currentTab")) {
        entertainment.classList.add("currentTab");
        entertainment.classList.remove("notCurrentTab");
        listOfTabs.forEach((item) => {
          if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
            if (item.classList.contains("currentTab")) {
              item.classList.remove("currentTab");
              if (!item.classList.contains("notCurrentTab")) {
                item.classList.add("notCurrentTab");
              }
            }
          }
        });
      }
    }

    //when the extension first starts, obviously, no data will be within the array. So when user clicks this tab, make a request and get data. Once we have data, store it in array. No need to make more request for now
    console.log("entertainmentVideos Length: ", entertainmentVideos.length);
    if (entertainmentVideos.length <= 0) {
      vscode.postMessage({
        command: "API_KEY_DETECTED",
        tab: "ENTERTAINMENT",
        text: "Lets get some entertainment",
      });
    }
  });

  //add event listner to technology
  technology.addEventListener("click", () => {
    //have a pointer to check what section current on
    if (currentTabPointer == "technology") {
      //Retrieve data from 'technology specfic array' (No need to change CSS)
    } else {
      //Retrieve data from 'technology specfic array' (change CSS)
      currentTabPointer = "technology";

      //add currentTab class to the technology tab
      if (!technology.classList.contains("currentTab")) {
        technology.classList.add("currentTab");
        technology.classList.remove("notCurrentTab");
        listOfTabs.forEach((item) => {
          if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
            if (item.classList.contains("currentTab")) {
              item.classList.remove("currentTab");
              if (!item.classList.contains("notCurrentTab")) {
                item.classList.add("notCurrentTab");
              }
            }
          }
        });
      }
    }

    //when the extension first starts, obviously, no data will be within the array. So when user clicks this tab, make a request and get data. Once we have data, store it in array. No need to make more request for now
    console.log("entertainmentVideos length: ", entertainmentVideos.length);
    if (technologyVideos.length <= 0) {
      vscode.postMessage({
        command: "API_KEY_DETECTED",
        tab: "TECHNOLOGY",
        text: "Lets get some technology",
      });
    }
  });

  //add event listner to gaming
  gaming.addEventListener("click", () => {
    //have a pointer to check what section current on
    if (currentTabPointer == "gaming") {
      //Retrieve data from 'gaming specfic array' (No need to change CSS)
    } else {
      //Retrieve data from 'gaming specfic array' (change CSS)
      currentTabPointer = "gaming";

      //add currentTab class to the gaming tab
      if (!gaming.classList.contains("currentTab")) {
        gaming.classList.add("currentTab");
        //remove hover
        gaming.classList.remove("notCurrentTab");
        listOfTabs.forEach((item) => {
          if (!(item.innerHTML.toLowerCase() == currentTabPointer)) {
            if (item.classList.contains("currentTab")) {
              item.classList.remove("currentTab");
              if (!item.classList.contains("notCurrentTab")) {
                item.classList.add("notCurrentTab");
              }
            }
          }
        });
      }
    }

    //when the extension first starts, obviously, no data will be within the array. So when user clicks this tab, make a request and get data. Once we have data, store it in array. No need to make more request for now
    console.log("Gaming length: ", gamingVideos.length);
    if (gamingVideos.length <= 0) {
      vscode.postMessage({
        command: "API_KEY_DETECTED",
        tab: "GAMING",
        text: "Lets get some gaming",
      });
    }
  });
} catch (e) {
  console.error("An error occured: ", e);
}
