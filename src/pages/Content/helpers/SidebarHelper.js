import ReactDOM from 'react-dom';
import Frame from '../modules/frame/frame';

console.log("============ Import SidebarHelper A ============")

let shouldShrinkBody = true;
let sidebarLocation = 'left';
let autoShowHide = false;
let autoShowHideDelay = 500;
const toggleButtonLocation = 'bottom';
let sidebarWidth = 280;

const setSidebarWidth = (width) => {
  sidebarWidth = width;
};

export let sidebarRoot = document.createElement('div');
document.body.appendChild(sidebarRoot);
sidebarRoot.setAttribute('id', 'vt-sidebar-root');

function shrinkBody(isOpen) {
  if (shouldShrinkBody) {
    if (sidebarLocation === 'right') {
      if (isOpen) {
        document.body.style.marginRight = `${sidebarWidth + 10}px`;
      } else {
        document.body.style.marginRight = '0px';
      }
    } else if (sidebarLocation === 'left') {
      if (isOpen) {
        document.body.style.marginLeft = `${sidebarWidth + 10}px`;
      } else {
        document.body.style.marginLeft = '0px';
      }
    }
  }
}

function fixShrinkBody(isOpen) {
  if (isOpen) {
    if (shouldShrinkBody) {
      if (sidebarLocation === 'left') {
        document.body.style.marginLeft = `${sidebarWidth + 10}px`;
      } else {
        document.body.style.marginRight = `${sidebarWidth + 10}px`;
      }
    } else {
      if (sidebarLocation === 'left') {
        document.body.style.marginLeft = '0px';
      } else {
        document.body.style.marginRight = '0px';
      }
    }
  } else {
    document.body.style.marginLeft = '0px';
    document.body.style.marginRight = '0px';
  }
}

function mountSidebar() {
  console.log('Mounting sidebar on the', sidebarLocation);
  const App = (
    <Frame
      url={chrome.runtime.getURL('sidebar.html')}
      shrinkBody={shrinkBody}
      fixShrinkBody={fixShrinkBody}
      viewportWidth={window.innerWidth}
      sidebarLocation={sidebarLocation}
      toggleButtonLocation={toggleButtonLocation}
      setSidebarWidth={setSidebarWidth}
    />
  );
  ReactDOM.render(App, sidebarRoot);
}

function unmountSidebar() {
  try {
    document.body.style.marginLeft = '0px';
    document.body.style.marginRight = '0px';
    ReactDOM.unmountComponentAtNode(sidebarRoot);
  } catch (e) {
    console.log(e);
  }
}

chrome.storage.sync.get(['sidebarOnLeft'], (result) => {
  if (result.sidebarOnLeft !== undefined) {
    sidebarLocation = result.sidebarOnLeft === true ? 'left' : 'right';
  }
  mountSidebar();
});

const checkSidebarStatus = () => {
  console.log("checkSidebarStatus...")
  chrome.runtime.sendMessage(
    {
      from: 'content',
      msg: 'REQUEST_SIDEBAR_STATUS',
    },
    (response) => {
      let sidebarOpen = response.sidebarOpen;
      if (Frame.isReady()) {
        Frame.toggle(sidebarOpen);
      }
    }
  );
};

checkSidebarStatus();


/**
 * Chrome runtime event listener
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // if (request.from === 'background' && request.msg === 'TOGGLE_SIDEBAR') {
  //   if (Frame.isReady()) {
  //     isToggledOpenGloballyFromBackground =
  //       request.toStatus === true ? true : false;
  //
  //     Frame.toggle(request.toStatus);
  //   }
  // } else if (
  if (
    request.from === 'background' &&
    request.msg === 'UPDATE_SIDEBAR_ON_LEFT_STATUS'
  ) {
    const { toStatus } = request;
    sidebarLocation = toStatus === true ? 'left' : 'right';
    unmountSidebar();
    mountSidebar();
    checkSidebarStatus();
  }
  // } else if (
  //   request.from === 'background' &&
  //   request.msg === 'UPDATE_SHOULD_SHRINK_BODY_STATUS'
  // ) {
  //   const { toStatus } = request;
  //   shouldShrinkBody = toStatus;
  //   Frame.shrinkBody();
  // } else if (
  //   request.from === 'background' &&
  //   request.msg === 'UPDATE_AUTO_SHOW_HIDE_STATUS'
  // ) {
  //   const { toStatus } = request;
  //   autoShowHide = toStatus;
  //   if (autoShowHide) {
  //     mountAutoShowHideListener();
  //   } else {
  //     unmountAutoShowHideListener();
  //   }
  // } else if (
  //   request.from === 'background' &&
  //   request.msg === 'UPDATE_AUTO_SHOW_HIDE_DELAY_STATUS'
  // ) {
  //   const { toStatus } = request;
  //   autoShowHideDelay = toStatus;
  // }
});