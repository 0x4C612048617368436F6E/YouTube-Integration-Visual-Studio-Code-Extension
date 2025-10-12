let search = null;
let searchButton = null;
try {
  search = querySelector(".Search");
  searchButton = querySelector(".search-button");

  if (!search || !searchButton) throw "Unable to find element";
} catch (e) {
  console.error("An error occured: ", e);
}
//add event listner to search-button
search.addEventListner("click", (e) => {
  console.log(e);
});
