function doStuffWithDom(resp) {
  if (resp.dom) {
    console.log("I received the following DOM content:\n" + resp.dom);
  } else {
    console.error(resp.msg);
    console.log(resp.sender);
  }
}

// receive the message from popup.js, pass message along with auth token to content.js
// This function will execute the copy sequence
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.copyCount) {
    sendResponse({
      msg: "Message passed on to content.js"
    });
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true
      },
      function(tabs) {
        // get the auth token then pass token to active tab so content.js can handle it
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          console.log("AUTH TOKEN OBTAINED");
          console.log(token);

          const fetchOptions = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };

          const tab = tabs[0];
          chrome.tabs.sendMessage(
            tab.id,
            {
              text: "report_back",
              fetchOptions: fetchOptions,
              authToken: token,
              ...msg
            },
            doStuffWithDom
          );
        });
      }
    );
  } else if (msg.getSelectedFile) {
    sendResponse({
      // do nothing
    });
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true
      },
      function(tabs) {
        var tab = tabs[0];
        // send message to content.js
        chrome.tabs.sendMessage(
          tab.id,
          {
            getSelectedFile: true
          },
          function() {}
        );
      }
    );
  } else {
    sendResponse({
      msg: "Error: background.js received unexpected message from sender:",
      sender: sender
    });
  }
});
