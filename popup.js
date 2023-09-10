document.addEventListener("DOMContentLoaded", function () {
  let prompts = [];
  chrome.storage.local.get('prompts', function (data) {
    prompts = data.prompts || [];

    const editPrompt = (index) => {
      const currentPrompt = prompts[index];
      chrome.storage.local.set({ "currentPrompt": currentPrompt.text, "currentTitle": currentPrompt.title }, function() {
        chrome.windows.create({
          url: chrome.runtime.getURL("modal.html"),
          type: "popup",
          width: 500,
          height: 300
        }, function(window) {});
      });
    };

    const deletePrompt = (index) => {
      prompts.splice(index, 1);
      chrome.storage.local.set({ 'prompts': prompts }, function () {
        updateDropdown();
      });
    };

    const usePrompt = (index) => {
      // Retrieve the selected prompt text
      const selectedPromptText = prompts[index].text;
      
      // Use Chrome Tabs API to send this text to the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "insertPrompt", text: selectedPromptText },
          (response) => {
            if (response.status === "failed") {
              alert(response.reason);
            }
          }
        );
      });
    };
    

    const updateDropdown = () => {
      const dropdown = document.getElementById("dropdown");
      dropdown.innerHTML = "";
      prompts.forEach((prompt, index) => {
        const promptDiv = document.createElement("div");
        promptDiv.className = "prompt";
        const title = prompt.title ? prompt.title : prompt.text ? prompt.text.substring(0, 20) + "..." : "Untitled";
        promptDiv.textContent = title;

        const iconSpan = document.createElement("span");

        ['edit', 'delete', 'send'].forEach(action => {
          const icon = document.createElement("i");
          icon.className = "material-icons action-icon";
          icon.textContent = action;
          icon.dataset.index = index;
          iconSpan.appendChild(icon);
        });

        promptDiv.appendChild(iconSpan);
        dropdown.appendChild(promptDiv);
      });

      document.querySelectorAll('.action-icon').forEach(icon => {
        icon.addEventListener('click', function() {
          const index = this.dataset.index;
          if (this.textContent === 'edit') {
            editPrompt(index);
          } else if (this.textContent === 'delete') {
            deletePrompt(index);
          } else if (this.textContent === 'send') {
            usePrompt(index);
          }
        });
      });

      const addNewPromptButton = document.createElement("navBarButton");
      addNewPromptButton.textContent = "Add New Prompt";
      addNewPromptButton.className = "right waves-effect waves-light with-header";
      addNewPromptButton.addEventListener("click", addPrompt);
      const navBar = document.getElementById("navBarRgt");
      navBar.appendChild(addNewPromptButton);
    };

    const addPrompt = () => {
      chrome.storage.local.set({ "currentPrompt": "", "currentTitle": "" }, function() {
        chrome.windows.create({
          url: chrome.runtime.getURL("modal.html"),
          type: "popup",
          width: 500,
          height: 300
        }, function(window) {});
      });
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if(request.action === "updatePromptList") {
        updateDropdown();
      }
    });

    updateDropdown();
  });
});
