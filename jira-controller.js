function intializeJiraController() {
  console.log('JIRA CONTROLLER LOADED!');
  addMomoStyling();
  attachCardClicks();
  connectMomo();
}

function addMomoStyling() { 
  const momoStyle = document.createElement('link');
  momoStyle.setAttribute('rel', 'stylesheet');
  momoStyle.setAttribute('type', 'text/css');
  momoStyle.href = chrome.runtime.getURL('jira-style.css');
  momoStyle.id = 'momo-style';
  document.head.appendChild(momoStyle);
}

function attachCardClicks() { 
  document.addEventListener('click', (e) => { 
    const cardLink = e.target.closest('.js-key-link');

    if (cardLink) { 
      e.preventDefault();
      e.stopPropagation();

      handleCardClick(e.target);
    }
  });
}

function handleCardClick(elem) {
  const port = chrome.runtime.sendMessage({ action: 'add-to-miro-link-click', ...extractLinkData(elem) });

  port.onDisconnect.addListener(function () { 
    alert('Got Disconnected to Momo')
  });
}

function connectMomo() { 
  chrome.runtime.connect({ name: "jira-connect" });
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) { 
      case 'extract-link-metadata':
        extractLinkMetadata(request);
        break;
      
      case 'notification':
        handleNotification(request);
        break;
      
      case 'MIRO-TAB-NOT-FOUND':
        alert('MIRO TAB NOT FOUND!');
        break;
    }
  });
}

function extractLinkMetadata(request) { 
  const { selectionText } = request;
  if (selectionText) {
      const linkDom = document.querySelector(`a[title="${selectionText}"]`);
      if (linkDom) {
        const linkMetadata = extractLinkData(linkDom); 
        chrome.runtime.sendMessage({ action: 'add-to-miro-link-click', ...linkMetadata });
      }
  }
}

function extractLinkData(elem) { 
  const container = elem.closest('.ghx-issue-content');
  const summary = container.querySelector('.ghx-summary');
  const link = container.querySelector('.js-key-link');

  return { summary: summary.innerText, link: link.href, linkLabel: link.innerText };
}

function handleNotification(req) {
  alert(req.message);
}

intializeJiraController();
