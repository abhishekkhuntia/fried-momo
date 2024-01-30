async function init() {
  const activateButton = document.getElementById('activate');
  const deactivateButton = document.getElementById('deactivate');
  const { isMiroConfigSet } = await chrome.storage.local.get('isMiroConfigSet');
  const { MOMO_WINDOW } = await chrome.storage.session.get('MOMO_WINDOW');

  if (!isMiroConfigSet) {
    activateButton.style.display = 'none';
    deactivateButton.style.display = 'none';
    showNotification('Please set the Miro and Jira links in the settings page!');
  } else if (MOMO_WINDOW) {
    activateButton.style.display = 'none';
    deactivateButton.style.display = 'block';
    showNotification('Momo is active!');
  } else {
    activateButton.style.display = 'block';
    deactivateButton.style.display = 'none';
    showNotification();
  }

  document.getElementById('configure')
    .addEventListener('click', function () {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/settings/settings.html') });
    });
  
  activateButton.addEventListener('click', function () { 
    chrome.runtime.sendMessage({ action: 'open-momo-window' });
    setTimeout(() => {
      activateButton.style.display = 'none';
      deactivateButton.style.display = 'block';
    }, 500);
  });

  deactivateButton.addEventListener('click', function () { 
    chrome.runtime.sendMessage({ action: 'close-momo-window' });
    setTimeout(() => { 
      activateButton.style.display = 'block';
      deactivateButton.style.display = 'none';
    }, 500);
  });
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!message) {
    notification.innerText = '';
    notification.style.display = 'none';
    return;    
  };
  notification.innerText = message;
  notification.style.display = 'block';
}


init();
console.log('POPUP laoded!')
