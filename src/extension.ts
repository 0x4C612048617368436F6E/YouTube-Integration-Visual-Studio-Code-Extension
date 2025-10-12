// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

//create custom class that implement webviewViewProvider

class YoutubeIntegration implements vscode.WebviewViewProvider {
  private static _viewType: string = "YouTube.Test";

  private _view?: vscode.WebviewView;
  private readonly _extensionUri: any;

  public constructor(private readonly extensionUri: any) {
    this._extensionUri = extensionUri;
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

    //below is for the javascript
    const _javascript = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/youtubeintegrationlogic.js"
    );
    //get special URI to use with webview]
    const _javascript_src = webviewView.webview.asWebviewUri(_javascript);

    return [general_src, search_src, _javascript];
  }

  //we will be using message passing some where

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
      <div class="category active">All</div>
      <div class="category">Music</div>
      <div class="category">Entertainment</div>
      <div class="category">Technology</div>
      <div class="category">Gaming</div>
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
		console.log("Checking... Are you sure");

		let search = null;
		let searchButton = null;
		try {
			let currentSearchValue = "";

  			search = document.querySelector(".Search");
  			searchButton = document.querySelector("#search-button");

  			if (!search || !searchButton) throw "Unable to find element";

			console.log("All good");

			//add event listner to search-button
			searchButton.addEventListener("click", (e) => {
				//get the current value from search
  				currentSearchValue = search.value;
				//make sure that is search value is empty string, no request is made
				console.log("Value is",currentSearchValue);
			});

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
        const provider = new YoutubeIntegration(context.extensionUri);
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
    const provider = new YoutubeIntegration(context.extensionUri);
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
