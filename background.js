function initializeMomo() {
  const tabIdMap = {
    MIRO: null,
    JIRA: null,
  };

  chrome.runtime.onConnect.addListener(function (port) { 
    if (port.name === 'houston-connect' || port.name === 'jira-connect') {
      chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        await chrome.storage.session.set({
          [port.name === 'houston-connect'? 'MIRO': 'JIRA']: tabs[0].id,
        })
        tabIdMap[port.name === 'houston-connect'? 'MIRO': 'JIRA'] = tabs[0].id;
       });
    }

    port.onDisconnect.addListener(async function () {
      let key = null;
      if (port.name === 'houston-connect') {
        key = 'MIRO';
      } else if (port.name === 'jira-connect') {
        key = 'JIRA';
      }

      if (key) { 
        await chrome.storage.session.remove(key);
        tabIdMap[key] = null;
      }
      console.log('UPDATED TAB REFS: ', tabIdMap);
    });
  });

  // Add to Miro context menu
  chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
      id: 'add-to-miro',
      title: 'ଓ Add this to Miro',
      contexts: ['link']
    });
  });
  
  // context menu click handler
  chrome.contextMenus.onClicked.addListener(function (info, tab) { 
    if (info.menuItemId == 'add-to-miro') {
      chrome.tabs.sendMessage(tabIdMap.JIRA, { ...info, action: 'extract-link-metadata', });
    }
  });

  // post link data extracation, we can call miro-sticky-creator.js
  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === 'add-to-miro-link-click') {
      try {
        const mirotab = await chrome.storage.session.get('MIRO');
        chrome.tabs.sendMessage(mirotab.MIRO, { ...request, action: 'add-to-miro' });
      } catch(e) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'MIRO-TAB-NOT-FOUND' });
      }
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => { 
    if(tabIdMap.MIRO === tabId) {
      await chrome.storage.session.remove('MIRO');
      tabIdMap.MIRO = null;
    } else if (tabIdMap.JIRA === tabId) { 
      await chrome.storage.session.remove('JIRA');
      tabIdMap.JIRA = null;
    }
  });
  console.log('MOMO CHUTTNEY LOADING!');
}


initializeMomo();
