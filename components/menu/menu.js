class UseMenu extends HTMLElement {
  constructor() {
    // Calls super() to invoke the constructor of the parent class.
    super();
    // Retrieves the current page's pathname via window.location.
    const { pathname } = window.location
    // Invokes attachShadow() to create a shadow DOM and sets it to the 'closed' mode (i.e., a closed shadow DOM).
    const shadow = this.attachShadow({ mode: 'closed' });
    // Uses jQuery's append() method to add HTML content to the shadow DOM. The content consists of a menu with three links, each of which applies the active class based on whether the current page pathname matches the corresponding link's target.
    $(shadow).append(`
      <style>
        @import url(./components/menu/style.css);
      </style>
      <div id="menu" class="ribbon">
        <a href="./index.html"><span class="${ pathname == '/index.html' ? 'active' : '' }">Overview</span></a>
        <a href="./history.html"><span class="${ pathname == '/history.html' ? 'active' : '' }">History</span></a>
        <a href="./author.html"><span class="${ pathname == '/author.html' ? 'active' : '' }">Author</span></a>
      </div>
    `);
  }
}
// window.customElements.define() associates the UseMenu class with the <use-menu> tag, enabling the creation of the custom element using the <use-menu> tag in HTML.
window.customElements.define('use-menu', UseMenu);