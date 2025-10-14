//access VScode API object
const vscode = acquireVsCodeApi();
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
  searchButton.addEventListener("click", () => {
    //get the current value from search
    currentSearchValue = search.value;
    //make sure that is search value is empty string, no request is made. if the length is 0, then we do not do anything
    if (currentSearchValue.trim().length > 0) {
      vscode.postMessage({
        command: "test",
        text: "Hello world",
      });
    }
  });
} catch (e) {
  console.error("An error occured: ", e);
}
