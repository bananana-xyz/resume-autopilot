// content.js
console.log('Content script loaded');

// Function to get text from job__content div
function getJobContentText() {
    const jobContentDiv = document.querySelector('.job__content');
    return jobContentDiv ? jobContentDiv.innerText : 'Job content not found';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autoFill") {
        const formData = request.value
        Object.keys(formData).forEach(key => {
            if (key === "firstName") {
                const greenhouseInput = document.getElementById("first_name");
                if (typeof greenhouseInput !== "undefined") {
                    greenhouseInput.value = formData[key]
                }
            }
            if (key === "lastName") {
                const greenhouseInput = document.getElementById("last_name");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
            }
            if (key === "phone") {
                const greenhouseInput = document.getElementById("phone");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
            }
            if (key === "email") {
                const greenhouseInput = document.getElementById("email");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
            }
        })
    }
    if (request.action === "getJobContent") {
        sendResponse({ text: getJobContentText() });
    }
})