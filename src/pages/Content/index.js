import { printLine } from './modules/print';
import ReactDOM from 'react-dom';
import { APP_NAME_SHORT } from '../../shared/constants';
import cx from 'classnames';
import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
// import './helpers/SidebarHelper';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let sidebarRoot = document.createElement('div');
sidebarRoot.innerText = 'HELLO WORLD!';
sidebarRoot.style['height'] = '100vh';
sidebarRoot.style['top'] = 0;
sidebarRoot.style['right'] = 0;
sidebarRoot.style['position'] = 'fixed';
sidebarRoot.style['zIndex'] = 999999999;

document.body.appendChild(sidebarRoot);
sidebarRoot.setAttribute('id', 'vt-sidebar-root');

const App = (
  <div>
    <iframe
      title="sidebar-iframe"
      style={{
        // display: isSideBarOpen ? 'inline' : 'none',
        height: '100vh',
        border: 'none',
        borderSizing: 'border-box',
      }}
      src={chrome.runtime.getURL('sidebar.html')}
      // ref={(frame) => (this.frame = frame)}
      onLoad={() => console.log('iFrame loaded')}
    />
  </div>
);

ReactDOM.render(App, sidebarRoot);
