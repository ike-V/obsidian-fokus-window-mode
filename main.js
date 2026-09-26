/* Fokus Window Mode — focus window for the Fokus theme (⌘+\).
   body.fokus-collapsed   theme hides tab bar / title bar / status bar
   leftSplit / rightSplit sidebars */
const { Plugin, setIcon } = require('obsidian');

module.exports = class FokusWindowMode extends Plugin {
  async onload() {
    this.state = Object.assign(
      { collapsed: false, leftBefore: false, rightBefore: false },
      await this.loadData(),
    );

    this.addCommand({
      id: 'toggle-focus',
      name: 'Toggle focus window',
      hotkeys: [{ modifiers: ['Mod'], key: '\\' }],
      callback: () => this.toggle(),
    });

    this.strip = document.body.createDiv({ cls: 'fokus-drag-strip' });
    this.expandChevron = this.makeChevron('fokus-expand-chevron', 'chevron-down');
    document.body.appendChild(this.expandChevron);

    this.app.workspace.onLayoutReady(() => {
      document.body.toggleClass('fokus-collapsed', this.state.collapsed);
      this.addButtons();
    });
    this.registerEvent(this.app.workspace.on('layout-change', () => this.addButtons()));
  }

  onunload() {
    if (this.state.collapsed) this.restore();
    document.body.removeClass('fokus-collapsed');
    document.querySelectorAll('.fokus-collapse-chevron').forEach((el) => el.remove());
    this.strip?.remove();
    this.expandChevron?.remove();
  }

  makeChevron(cls, icon) {
    const wrap = createDiv({ cls: `workspace-tab-header-tab-list ${cls}` });
    const btn = wrap.createDiv({ cls: 'clickable-icon' });
    setIcon(btn, icon);
    btn.setAttribute('aria-label', 'Toggle focus window (⌘+\\)');
    btn.addEventListener('click', () => this.toggle());
    return wrap;
  }

  async toggle() {
    const ws = this.app.workspace;
    this.state.collapsed = !this.state.collapsed;

    if (this.state.collapsed) {
      this.state.leftBefore = !ws.leftSplit.collapsed;
      this.state.rightBefore = !ws.rightSplit.collapsed;
      ws.leftSplit.collapse();
      ws.rightSplit.collapse();
    } else {
      this.restore();
    }

    document.body.toggleClass('fokus-collapsed', this.state.collapsed);
    await this.saveData(this.state);
  }

  restore() {
    const ws = this.app.workspace;
    this.state.leftBefore ? ws.leftSplit.expand() : ws.leftSplit.collapse();
    this.state.rightBefore ? ws.rightSplit.expand() : ws.rightSplit.collapse();
  }

  addButtons() {
    document.querySelectorAll('.mod-root .workspace-tab-header-container').forEach((container) => {
      if (container.querySelector('.fokus-collapse-chevron')) return;
      const btn = this.makeChevron('fokus-collapse-chevron', 'chevron-up');
      const tabList = container.querySelector('.workspace-tab-header-tab-list:not(.fokus-collapse-chevron)');
      tabList ? container.insertBefore(btn, tabList) : container.appendChild(btn);
    });
  }

};
