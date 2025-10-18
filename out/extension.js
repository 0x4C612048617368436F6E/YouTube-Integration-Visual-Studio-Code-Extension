"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const authSetting_1 = __importDefault(require("./authSetting"));
//create custom class that implement webviewViewProvider
class YoutubeIntegration {
    extensionUri;
    token;
    setting;
    static _viewType = "YouTube.Test";
    _view;
    _extensionUri;
    _token;
    _setting;
    constructor(extensionUri, token, setting) {
        this.extensionUri = extensionUri;
        this.token = token;
        this.setting = setting;
        this._extensionUri = extensionUri;
        this._token = token;
        this._setting = setting;
    }
    resolveWebviewView(webviewView, context, token) {
        (webviewView.webview.options = {
            enableScripts: true,
        }),
            (webviewView.webview.html = this.returnHTML(webviewView));
        //will be the first we send. Now there might actually be an API key, but what is the API key is invalid. pass token to webview as first
        console.log("Does this execute");
        webviewView.webview.postMessage({
            command: "IS_API_KEY_VALID",
            text: this._token,
        });
        webviewView.webview.onDidReceiveMessage((message) => {
            //store next Page Toke
            let nextPageToken = "";
            switch (message.command) {
                case "NO_API_KEY":
                    //prompt user to enter API KEY
                    (async () => {
                        //delete previous value
                        //await this._setting.delete();
                        const tokenInput = await vscode.window.showInputBox();
                        await this._setting.storeAuthData(tokenInput);
                        //after getting API key and storing it, we now get the API key
                        this._token = await this._setting.getAuthData();
                        //send message back to webview using message passing
                        webviewView.webview.postMessage({
                            command: "IS_API_KEY_VALID",
                            text: this._token,
                        });
                        return;
                    })();
                    break;
                case "API_KEY_DETECTED":
                    const customAxiosProperties = {
                        baseURL: "https://youtube.googleapis.com/youtube/v3/",
                        timeout: 0,
                        headers: {
                            Bearer: this._token,
                        },
                    };
                    const customAxios = axios_1.default.create(customAxiosProperties);
                    //most popular videos (including all)
                    //videos?part=snippet&maxResults=10&rate=viewCount&chart=mostPopular&type=video&key=${this._token}
                    const mostPopularVideosURL = nextPageToken.trim().length <= 0
                        ? `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`
                        : `videos?part=snippet&chart=mostPopular&maxResults=10&key=${nextPageToken}&type=video&key=${this._token}`;
                    //search?part=snippet&maxResults=10&q=skateboarding%20dog&type=video&key=${this._token}
                    const musicVideosURL = nextPageToken.trim().length <= 0
                        ? `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`
                        : `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`;
                    const entertainmentVideosURL = nextPageToken.trim().length <= 0
                        ? `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`
                        : `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`;
                    const technologyVideosURL = nextPageToken.trim().length <= 0
                        ? `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`
                        : `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`;
                    const gamingVideosURL = nextPageToken.trim().length <= 0
                        ? `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`
                        : `videos?part=snippet&chart=mostPopular&maxResults=10&key=${this._token}`;
                    const desiredURL = message.tab === "ALL"
                        ? mostPopularVideosURL
                        : message.tab === "MUSIC"
                            ? musicVideosURL
                            : message.tab === "ENTERTAINMENT"
                                ? entertainmentVideosURL
                                : message.tab === "TECHNOLOGY"
                                    ? technologyVideosURL
                                    : message.tab === "GAMING"
                                        ? gamingVideosURL
                                        : "ERROR";
                    if (desiredURL === "ERROR")
                        throw "An error occured";
                    customAxios
                        .get(desiredURL)
                        .then((res) => {
                        let mostPopularVideos = undefined;
                        mostPopularVideos = res;
                        //we will be using message passing some where
                        //send final response back to webview
                        console.log("Some stuff: ", mostPopularVideos);
                        //Before sending to webview, lets do some preprocessing
                        let sendResourceToWebView = this.preprocess(mostPopularVideos.data.items);
                        webviewView.webview.postMessage({
                            command: "RESOURCE",
                            text: sendResourceToWebView,
                        });
                    })
                        .catch(async (e) => {
                        if (e.response) {
                            //console.log("Error object: ", e.response.data);
                            //get error status
                            const status = e.response.data.error.code;
                            console.log(status);
                            //send back to webview
                            //invalidate token since not correct
                            this._token = undefined;
                            webviewView.webview.postMessage({
                                command: "IS_API_KEY_VALID",
                                text: this._token,
                            });
                        }
                        else if (e.request) {
                            console.log(e.request);
                        }
                        else {
                            console.log("Something else");
                        }
                    })
                        .finally(() => {
                        console.log("Request finished");
                    });
                    break;
                case "test":
                    console.log(message.text);
                    vscode.window.showInformationMessage(message.text);
                    break;
                default:
                    console.log("Not correct");
            }
        });
    }
    preprocess(items) {
        //preprocess given item and only include relevant information
        let preprocessedItem = [];
        for (let i = 0; i < items.length; i++) {
            preprocessedItem.push(new Object({
                title: items[i].snippet.title,
                //send multiple thumbnail to use depending on screen size
                thumbnail: items[i].snippet.thumbnails,
                //items[i].snippet.thumbnail
            }));
        }
        return preprocessedItem;
    }
    //From documentation:
    //This means that in order to load images, stylesheets, and other resources from your extension, or to load any content from the user's current workspace, you must use the Webview.asWebviewUri function to convert a local file: URI into a special URI that VS Code can use to load a subset of local resources.
    getAllLocalResources(webviewView) {
        //below is for general CSS
        const general = vscode.Uri.joinPath(this._extensionUri, "media", "../resources/styles/general.css");
        //get speical URI to use with WebView
        const general_src = webviewView.webview.asWebviewUri(general);
        //below is for search
        const search = vscode.Uri.joinPath(this._extensionUri, "media", "../resources/white_search.svg");
        //get special URI to use with webview
        const search_src = webviewView.webview.asWebviewUri(search);
        return [general_src, search_src];
    }
    returnHTML(webviewView) {
        let [general, search] = this.getAllLocalResources(webviewView);
        return `
	<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="stylesheet" href=${general}/>
	</head>
  <body>
    <header>
      <h2 class="youtube_padding">YouTube</h2>
      <div class="search-bar">
        <input class="Search" type="text" placeholder="Search"/>
		<button id="search-button";>
		<img class="search-icon" src=${search}/>
		</button>
      </div>
    </header>

    <div class="categories">
      <div class="category active_all">All</div>
      <div class="category active_music">Music</div>
      <div class="category active_entertainment">Entertainment</div>
      <div class="category active_technology">Technology</div>
      <div class="category active_gaming">Gaming</div>
    </div>

    <div class="videos">
      
    </div>

	<script>
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

	</script>
  </body>
</html>
	`;
    }
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    //Initialise and get current instance of instance
    authSetting_1.default.init(context);
    const settings = authSetting_1.default.instance;
    //immediately check if API key is embeeded
    let token = undefined;
    (async () => {
        token = await settings.getAuthData();
    })();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //vscode.window.showErrorMessage()
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let trackRegisteredView = new Set();
    const disposable = vscode.commands.registerCommand("youtubeintegration.YoutubeIntegration", () => {
        //       // The code you place here will be executed every time your command is executed
        //       // Display a message box to the user
        if (!trackRegisteredView.has("YouTube.Test")) {
            const provider = new YoutubeIntegration(context.extensionUri, token, settings);
            const webView = vscode.window.registerWebviewViewProvider("YouTube.Test", provider);
            trackRegisteredView.add("YouTube.Test");
            context.subscriptions.push(webView);
        }
        else {
            console.log("View already registered");
            vscode.window.showWarningMessage("View has already been registered");
        }
    });
    //Check if view already registered
    if (!trackRegisteredView.has("YouTube.Test")) {
        const provider = new YoutubeIntegration(context.extensionUri, token, settings);
        const webView = vscode.window.registerWebviewViewProvider("YouTube.Test", provider);
        trackRegisteredView.add("YouTube.Test");
        context.subscriptions.push(webView);
        //send initial message to webView
    }
    else {
        console.log("View already registered");
        vscode.window.showWarningMessage("View has already been registered");
    }
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() {
    console.log("Cleaning up");
}
//NO IDEAD
//# sourceMappingURL=extension.js.map