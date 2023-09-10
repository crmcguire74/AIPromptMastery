document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("form").addEventListener("submit", function(event) {
      event.preventDefault();
  
      const newPromptText = document.getElementById("prompt_text").value;
      const newTitleText = document.getElementById("prompt_title").value;
      const newPrompt = { text: newPromptText, title: newTitleText };
  
      chrome.storage.local.get('prompts', function(data) {
        let existingPrompts = data.prompts || [];
        existingPrompts.push(newPrompt);
        chrome.storage.local.set({ 'prompts': existingPrompts }, function() {
          chrome.runtime.sendMessage({ action: "updatePromptList" });
          window.close();
        });
      });
    });
  });
  