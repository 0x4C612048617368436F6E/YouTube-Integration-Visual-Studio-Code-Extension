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

  console.log("All good");

  //add event listner for when we receive message from extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "IS_API_KEY_VALID":
        //below will be based on whether the token is empty or there is value in it
        console.log("Value is: ", message.text);
        const token = message.text;
        //add new child
        const node = document.createElement("h3");
        node.style.fontSize = "15px";
        node.style.textAlign = "center";
        node.style.color = "#b7b7b7ff";
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
              text: "API KEY HAS BEEN Added",
            });
          }
        } else {
          console.log("Undefined");
          textNode = document.createTextNode("API KEY NOT DETECTED");
          node.appendChild(textNode);
          videos.appendChild(node);
          //send message back to extension that API KEY NOT DETECTED
          vscode.postMessage({
            command: "NO_API_KEY",
            text: "API KEY NOT DETECTED",
          });
        }
    }
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

  //add event listner to videos
  //add event listner to all
  //add event listner to music
  //add event listner to entertainment
  //add event listner to technology
  //add event listner to gaming
} catch (e) {
  console.error("An error occured: ", e);
}
