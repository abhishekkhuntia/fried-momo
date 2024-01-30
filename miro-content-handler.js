function initializeMiroHandler() { 
  injectExecuteScript();
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "add-to-miro") {
      window.postMessage({action: 'add-to-miro', ...request}, '*');
    }
  });
  window.isHandlerLoaded = true;
  console.log("Miro Handler Initialised!");
}

function injectExecuteScript() {
  const body = document.querySelector('body');
  const node = document.createElement('script');
  node.setAttribute('type', 'text/javascript');
  node.setAttribute('src', chrome.runtime.getURL('miro-sticky-creator.js'));

  body.appendChild(node);
}

if (!window.isHandlerLoaded) {
  initializeMiroHandler();  
}

