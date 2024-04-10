function addScript(url){
	document.write(`<script src="${ url }"></script>`);
}
addScript('./components/menu/menu.js')
addScript('./components/card/card.js')
console.log('main.js');