// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios from "axios";
import AuthSetting from "./authSetting";
import { UnderlyingSink } from "stream/web";

//create custom class that implement webviewViewProvider

class YoutubeIntegration implements vscode.WebviewViewProvider {
  private static _viewType: string = "YouTube.Test";

  private _view?: vscode.WebviewView;
  private readonly _extensionUri: any;
  private readonly _token: string | undefined;

  public constructor(
    private readonly extensionUri: any,
    private readonly token: string | undefined
  ) {
    this._extensionUri = extensionUri;
    this._token = token;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Thenable<void> | void {
    (webviewView.webview.options = {
      enableScripts: true,
    }),
      (webviewView.webview.html = this.returnHTML(webviewView));

    webviewView.webview.onDidReceiveMessage((message) => {
      const customAxiosProperties = {
        baseURL: "https://youtube.googleapis.com/youtube/v3/",
        timeout: 0,
        headers: {
          Authorization: `Bearer:${process.env.API_KEY}`,
        },
      };

      const customAxios = axios.create(customAxiosProperties);
      //store next Page Toke
      let nextPageToken = "";
      switch (message.command) {
        case "initialRequest":
          //most popular videos (including all)
          const mostPopularVideosURL =
            nextPageToken.trim().length <= 0
              ? `videos?part=snippet&maxResults=10&rate=viewCount&chart=mostPopular&type=video&key=${process.env.API_KEY}`
              : `videos?part=snippet&maxResults=10&rate=viewCount&pageToken=${nextPageToken}&chart=mostPopular&type=video&key=${process.env.API_KEY}`;

          let mostPopularVideos = undefined;
          customAxios
            .get(mostPopularVideosURL)
            .then((res) => {
              mostPopularVideos = res;
            })
            .catch((e) => {
              console.error("An error occured: ", e);
            })
            .finally(() => {
              console.log("Request finished");
            });
          //pass token to webview as first

          //we will be using message passing some where
          //send final response back to webview

          break;
        case "test":
          console.log(message.text);
          vscode.window.showInformationMessage(message.text);
          break;
      }
    });
  }
  //From documentation:
  //This means that in order to load images, stylesheets, and other resources from your extension, or to load any content from the user's current workspace, you must use the Webview.asWebviewUri function to convert a local file: URI into a special URI that VS Code can use to load a subset of local resources.
  private getAllLocalResources(webviewView: vscode.WebviewView) {
    //below is for general CSS
    const general = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/styles/general.css"
    );
    //get speical URI to use with WebView
    const general_src = webviewView.webview.asWebviewUri(general);

    //below is for search
    const search = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/white_search.svg"
    );
    //get special URI to use with webview
    const search_src = webviewView.webview.asWebviewUri(search);

    return [general_src, search_src];
  }

  //be used when API response gets back
  private returnHTMLVideo(values: string | string[]) {
    return `<div class="videos">
      <div class="video">
        <div class="thumbnail"></div>
        <div class="video-info">Sample Video 1</div>
      </div>`;
  }

  private returnHTML(webviewView: vscode.WebviewView): string {
    let [general, search] = this.getAllLocalResources(webviewView);
    return `<!DOCTYPE html>
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
      <div class="video">
        <div class="thumbnail"></div>
        <div class="video-info">Sample Video 1</div>
      </div>
      <div class="video">
        <div class="thumbnail"></div>
        <div class="video-info">Sample Video 2</div>
      </div>
      <div class="video">
        <div class="thumbnail"></div>
        <div class="video-info">Sample Video 3</div>
      </div>
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

  			if (!search || !searchButton || !videos ||!all || !music || !entertainment || !technology || !gaming) throw "Unable to find element";

			console.log("All good");

			//add event listner for when we receive message from extension
			window.addEventListener("message"(event)=>{
				console.log(event);
			})

			//add event listner to search-button
			searchButton.addEventListener("click", () => {
				//get the current value from search
  				currentSearchValue = search.value;
				//make sure that is search value is empty string, no request is made. if the length is 0, then we do not do anything
				
				if((currentSearchValue.trim()).length > 0){
					console.log(currentSearchValue);
					vscode.postMessage(
					{
						command:"test",
						text:"Hello world"
					}
					)
				}
				
			});

			//add event listner to videos
			//add event listner to all
			//add event listner to music
			//add event listner to entertainment
			//add event listner to technology
			//add event listner to gaming


		} catch (e) {
  			console.error("An error occured: ", e);
		}
	</script>
  </body>
</html>`;
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  //Initialise and get current instance of instance
  AuthSetting.init(context);
  const settings = AuthSetting.instance;

  //immediately check if API key is embeeded
  let token: string | undefined = undefined;
  (async () => {
    token = await settings.getAuthData();
  })();

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  //vscode.window.showErrorMessage()

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let trackRegisteredView = new Set<string>();
  const disposable = vscode.commands.registerCommand(
    "youtubeintegration.YoutubeIntegration",
    () => {
      //       // The code you place here will be executed every time your command is executed
      //       // Display a message box to the user
      if (!trackRegisteredView.has("YouTube.Test")) {
        const provider = new YoutubeIntegration(context.extensionUri, token);
        const webView = vscode.window.registerWebviewViewProvider(
          "YouTube.Test",
          provider
        );
        trackRegisteredView.add("YouTube.Test");
        context.subscriptions.push(webView);
      } else {
        console.log("View already registered");
        vscode.window.showWarningMessage("View has already been registered");
      }
    }
  );
  //Check if view already registered
  if (!trackRegisteredView.has("YouTube.Test")) {
    const provider = new YoutubeIntegration(context.extensionUri, token);
    const webView = vscode.window.registerWebviewViewProvider(
      "YouTube.Test",
      provider
    );
    trackRegisteredView.add("YouTube.Test");
    context.subscriptions.push(webView);
  } else {
    console.log("View already registered");
    vscode.window.showWarningMessage("View has already been registered");
  }

  //const provider = new YoutubeIntegration(context.extensionUri);

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Cleaning up");
}
