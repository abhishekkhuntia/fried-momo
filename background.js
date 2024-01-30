chrome.CONFIG_LINK_SET = ['miroLink', 'jiraLink'];
function initializeMomo() {
  const tabIdMap = {
    MIRO: null,
    JIRA: null,
  };

  // UPDATING TAB REFS
  chrome.storage.session.onChanged.addListener(function (changes, namespace) { 
    const changedKeys = Object.keys(changes);
    if(['MIRO', 'JIRA'].some(key => changedKeys.includes(key))) {
      const { MIRO, JIRA } = changes;
      if (MIRO) {
        tabIdMap.MIRO = MIRO.newValue;
      }
      if (JIRA) { 
        tabIdMap.JIRA = JIRA.newValue;
      }
    }
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
    } else if(request.action === 'open-momo-window') {
      openMomoWindow();
      addContextMenu();
    } else if (request.action === 'close-momo-window') {
      closeMomoWindow();
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => { 
    if (tabIdMap.MIRO === tabId || tabIdMap.JIRA === tabId) {
      closeMomoWindow();
    }
    if (tabIdMap.MIRO === tabId) {
      await chrome.storage.session.remove('MIRO');
      tabIdMap.MIRO = null;
    } else if (tabIdMap.JIRA === tabId) { 
      await chrome.storage.session.remove('JIRA');
      tabIdMap.JIRA = null;
      removeContextMenu(); 
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => { 
    if (tabId === tabIdMap.MIRO && changeInfo.status === 'complete') {
      injectMiroHandler(tabId);
    } else if (tabId === tabIdMap.JIRA && changeInfo.status === 'complete') { 
      injectJiraHandler(tabId);
    }
  });

  onInstalled();
  initiateConfigHandler();
  console.log('MOMO CHUTTNEY LOADING!');
}

function onInstalled() { 
  chrome.runtime.onInstalled.addListener(async function (deatils) {
    if (deatils.reason === 'install') { 
      const firstTime = await chrome.storage.local.get('firstTimeInstallation');
      if (!firstTime.firstTimeInstallation) {
        chrome.storage.local.set({ firstTimeInstallation: true });
        chrome.tabs.create({ url: chrome.runtime.getURL('pages/intro.html') });
      }
    }
  });
}

function initiateConfigHandler() {
  chrome.storage.local.onChanged.addListener(function (changes, namespace) { 
    const changedKeys = Object.keys(changes);
    const hasConfigKeys = changedKeys.some(key => chrome.CONFIG_LINK_SET.includes(key));

    if (hasConfigKeys) {
      chrome.storage.local.set({
        isMiroConfigSet: isConfigSet(),
      })
    }
  });
}

async function isConfigSet() {
  const { miroLink, jiraLink } = await chrome.storage.local.get(chrome.CONFIG_LINK_SET);
  return miroLink && jiraLink;
}


async function openMomoWindow() {
  const { miroLink, jiraLink } = await chrome.storage.local.get(chrome.CONFIG_LINK_SET);
  chrome.windows.create({
    url: [miroLink, jiraLink],
    type: 'normal',  // 'normal' creates a regular browser window
    state: 'maximized'  // 'maximized' opens the window in a maximized state
  }, async function (newWindow) { 
    const { tabs, id } = newWindow;
    const [miroTab, jiraTab] = tabs;
    chrome.storage.session.set({
      MIRO: miroTab.id,
      JIRA: jiraTab.id,
      MOMO_WINDOW: id,
    });
    showNotification('Momo is active!');
    createGroupTabs([miroTab.id, jiraTab.id], 'Momo', 'red');
  });
}

function createGroupTabs(tabIds, title, color) {
  chrome.tabs.group({ tabIds }, function (groupId) { 
    chrome.tabGroups.update(groupId, { color, title });
  });
}

function addContextMenu() { 
  chrome.contextMenus.create({
    id: 'add-to-miro',
    title: 'Add this to Miro',
    contexts: ['link']
  });
}

function removeContextMenu() {
  try {
    chrome.contextMenus.remove('add-to-miro');
  } catch (e) { 
    console.log('CONTEXT MENU NOT FOUND!');
  }
}

function injectMiroHandler(tabId) { 
  chrome.scripting.executeScript({
    target: { tabId },
    files: [ 'miro-content-handler.js']
  });
}

function injectJiraHandler(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    files: [ 'jira-controller.js']
  });
}

async function closeMomoWindow() {
  const { MOMO_WINDOW } = await chrome.storage.session.get('MOMO_WINDOW');
  try {
    showNotification('Momo Session Ended!');
    chrome.storage.session.remove('MOMO_WINDOW');
    const window = await chrome.windows.get(MOMO_WINDOW);
    if(!window) return;
    chrome.windows.remove(MOMO_WINDOW);
  } catch (e) { 
    console.log('MOMO WINDOW NOT FOUND!');
  }
}

function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'momo-active.png',
    title: 'Momo Alert',
    message: message || 'Momo is active!',
  });
}

initializeMomo();
