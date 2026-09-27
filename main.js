/* Fokus Window Mode — Fokus window for the Fokus theme (⌘+\).
   body.fokus-collapsed   theme hides ribbon, sidebars, tab bar, title bar, status bar */
const { Plugin, setIcon } = require('obsidian');

module.exports = class FokusWindowMode extends Plugin {
  async onload() {
    this.state = Object.assign(
      { collapsed: false },
      await this.loadData(),
    );

    this.addCommand({
      id: 'toggle-fokus',
      name: 'Toggle Fokus window',
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
    document.body.removeClass('fokus-collapsed');
    document.querySelectorAll('.fokus-collapse-chevron').forEach((el) => el.remove());
    this.strip?.remove();
    this.expandChevron?.remove();
  }

  makeChevron(cls, icon) {
    const wrap = createDiv({ cls: `workspace-tab-header-tab-list ${cls}` });
    const btn = wrap.createDiv({ cls: 'clickable-icon' });
    setIcon(btn, icon);
    btn.setAttribute('aria-label', 'Toggle Fokus window (⌘+\\)');
    btn.addEventListener('click', () => this.toggle());
    return wrap;
  }

  async toggle() {
    this.state.collapsed = !this.state.collapsed;
    document.body.toggleClass('fokus-collapsed', this.state.collapsed);
    await this.saveData(this.state);
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
