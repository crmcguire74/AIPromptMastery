// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'insertPrompt') {
        const textArea = document.querySelector('textarea');
        if (textArea) {
            textArea.value = request.text;
            sendResponse({status: 'success'});
        } else {
            sendResponse({status: 'failed', reason: 'No chat input box found.'});
        }
    }
});
