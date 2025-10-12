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
    (webviewView.webview.options = { enableScripts: true }),
      (webviewView.webview.html = this.returnHTML(webviewView));
  }
  //From documentation:
  //This means that in order to load images, stylesheets, and other resources from your extension, or to load any content from the user's current workspace, you must use the Webview.asWebviewUri function to convert a local file: URI into a special URI that VS Code can use to load a subset of local resources.
  private getAllLocalResources(webviewView: vscode.WebviewView) {
    //below is for hamburger
    const hamburger_menu = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/hamburger-menu.svg"
    );
    //get speical URI to use with WebView
    const hamburger_menu_src = webviewView.webview.asWebviewUri(hamburger_menu);

    //below is for general CSS
    const general = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/styles/general.css"
    );
    //get speical URI to use with WebView
    const general_src = webviewView.webview.asWebviewUri(general);

    //below is for header css
    const header = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/styles/header.css"
    );
    //get special URI to use with webview
    const header_src = webviewView.webview.asWebviewUri(header);

    //below is for video css
    const video = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/styles/video.css"
    );
    //get special URI to use with webview
    const video_src = webviewView.webview.asWebviewUri(video);

    //below is for sidebar css
    const sidebar = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/styles/sidebar.css"
    );
    //get special URI to use with webview
    const sidebar_src = webviewView.webview.asWebviewUri(sidebar);

    //below is for youtube logo
    const youtube_logo = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/youtube-logo.svg"
    );
    //get special URI to use with webview
    const youtube_logo_src = webviewView.webview.asWebviewUri(youtube_logo);

    //below is for search
    const search = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/search.svg"
    );
    //get special URI to use with webview
    const search_src = webviewView.webview.asWebviewUri(search);

    //below is for voice search icon
    const voice_search_icon = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/voice-search-icon.svg"
    );
    //get special URI to use with webview
    const voice_search_icon_src =
      webviewView.webview.asWebviewUri(voice_search_icon);

    //below is for upload
    const upload = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/upload.svg"
    );
    //get special URI for upload
    const upload_src = webviewView.webview.asWebviewUri(upload);

    //below is for youtube_apps
    const youtube_apps = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "../resources/youtube-apps.svg"
    );
    //get special URI for youtube_apps
    const youtube_apps_src = webviewView.webview.asWebviewUri(youtube_apps);

    //below is for notifications
    const notifications = vscode.Uri.joinPath(
      this._extensionUri,
      "image",
      "../resources/notifications.svg"
    );
    //get special URI for notifications
    const notifications_src = webviewView.webview.asWebviewUri(notifications);

    return [
      hamburger_menu_src,
      general_src,
      header_src,
      video_src,
      sidebar_src,
      youtube_logo_src,
      search_src,
      voice_search_icon_src,
      upload_src,
      youtube_apps_src,
      notifications_src,
    ];
  }

  private returnHTML(webviewView: vscode.WebviewView): string {
    let [
      hamburger_menu,
      general,
      header,
      video,
      sidebar,
      youtube_logo,
      search,
      voice_search_icon,
      upload,
      youtube_apps,
      notifications,
    ] = this.getAllLocalResources(webviewView);
    return `<!DOCTYPE html>
<html>
    <head>
        <title>
            Youtube.com Clone
        </title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href=${general}>
        <link rel="stylesheet" href=${header}>
        <link rel="stylesheet" href=${video}>
        <link rel="stylesheet" href=${sidebar}>
    </head>
    <body>
	
	<header class="header">
            <div class="left-section">
                <img class="hamburger-logo" src=${hamburger_menu}/>
                <img class="youtube-logo" src=${youtube_logo}>
            </div>
            <div class="middle-section">
                <input class="search-bar" type="text" placeholder="Search">
                <button class="search-button">
                    <img class="search-icon" src=${search}>
                    <div class="tooltip">Search</div>
                </button>
                <button class="voice-search-button">
                    <img class="voice-search-icon" src=${voice_search_icon}>
                    <div class="tooltip">Search with your voice</div>
                </button>
            </div>
            <div class="right-section">
                <div class="upload-icon-container">
                    <img class="upload-icon" src=${upload}>
                    <div class="tooltip">Create</div>
                </div>
                <div class="youtube-apps-icon-container">
                    <img class="youtube-apps-icon" src=${youtube_apps}>
                    <div class="tooltip">Youtube apps</div>
                </div>
                <div class="notifications-icon-container">
                    <img class="notifications-icon" src=${notifications}>
                    <div class="notifications-count">3</div>
                    <div class="tooltip">Notifications</div>
                </div>
                <img class="current-user-picture-icon" src="../resources/my-channel.jpg">
            </div>
        </header>
        <nav class="sidebar">
            <div class="sidebar-link">
                <img src="../resources/home.svg">
                <div>Home</div>
            </div>
            <div class="sidebar-link">
                <img src="../resources/explore.svg">
                <div>Explore</div>
            </div>
            <div class="sidebar-link">
                <img src="../resources/subscriptions.svg">
                <div>Subscriptions</div>
            </div>
            <div class="sidebar-link">
                <img src="../resources/originals.svg">
                <div>Originals</div>
            </div>
            <div class="sidebar-link">
                <img src="../resources/youtube-music.svg">
                <div>Youtube Music</div>
            </div>
            <div class="sidebar-link">
                <img src="../resources/library.svg">
                <div>Library</div>
            </div>
        </nav>

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
