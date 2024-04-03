class UseMenu extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    $(shadow).append(`
      <style>
        @import url(./components/menu/style.css);
      </style>
      <div id="menu" class="ribbon">
        <a href="#"><span>Concept</span></a>
        <a href="#"><span>History</span></a>
        <a href="#"><span>Author</span></a>
      </div>
    `);
  }
}
window.customElements.define('use-menu', UseMenu);