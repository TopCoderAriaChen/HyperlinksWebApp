class UseCard extends HTMLElement {
  constructor() {
    super();
    const hideHeader = $(this)[0].hasAttribute('hide-header');
    const shadow = this.attachShadow({ mode: 'open' });
    $(shadow).append(`
      <style>
        @import url(./components/card/style.css);
      </style>
      ${ hideHeader ? '' :
        `<div class="header">
          <slot name="header"></slot>
        </div>` }
      
      <div class="body">
        <slot></slot>
      </div>
    `);
  }
}
window.customElements.define('use-card', UseCard);