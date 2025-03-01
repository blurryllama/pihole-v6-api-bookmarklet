// This file is currently empty but can be used for future background tasks
// such as scheduled checks of Pi-hole status or other background operations

browser.runtime.onInstalled.addListener(() => {
  console.log('Pi-hole v6 Controller extension installed');
}); 