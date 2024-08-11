/*global chrome*/
console.log('Greenhouse Autopilot Content script loaded');

// Notify popup.js that content.js is loaded
chrome.runtime.sendMessage({ action: "AutopilotScriptLoaded" });

// Function to get text from job__content div
function getJobContentText() {
    const jobContentDiv = document.querySelector('.job__content');
    return jobContentDiv ? jobContentDiv.innerText : 'Job content not found';
}

function triggerEvent(el) {
    const event = new Event('change', { bubbles: true });
    el.dispatchEvent(event);
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
                triggerEvent(greenhouseInput);
            }
            if (key === "lastName") {
                const greenhouseInput = document.getElementById("last_name");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
                triggerEvent(greenhouseInput);
            }
            if (key === "phone") {
                const greenhouseInput = document.getElementById("phone");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
                triggerEvent(greenhouseInput);
            }
            if (key === "email") {
                const greenhouseInput = document.getElementById("email");
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
                triggerEvent(greenhouseInput);
            }
            if (key === "linkedin") {
                const greenhouseInput = document.querySelector('input[aria-label="LinkedIn Profile"]');
                if (typeof greenhouseInput !== "undefined"){
                    greenhouseInput.value = formData[key]
                }
                triggerEvent(greenhouseInput);
            }
        })
        sendResponse({ message: "Autofill complete" });
    }
    if (request.action === "getJobContent") {
        sendResponse({ text: getJobContentText() });
    }
    if (request.action === "uploadResume") {
        const resume = request.resume;
        const resumeName = request.resumeName;
        const attachResumeInput = document.querySelector('input[type="file"][id="resume"]');
        if (attachResumeInput) {
            // Reconstruct the Blob from the Base64 string
            const byteCharacters = atob(resume);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create a File object from the Blob
            const file = new File([blob], resumeName, { type: 'application/pdf' });

            // // Create a DataTransfer object and add the resume file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            attachResumeInput.files = dataTransfer.files;

            // Dispatch a change event to trigger any listeners
            triggerEvent(attachResumeInput);
        } else {
            console.error("File input element with id 'resume' not found.");
        }
    }
    if (request.action === "attachCoverLetter") {
        const coverLetter = request.coverLetter;
        const enterManuallyButton = document.querySelector('button[aria-label*="Enter cover letter"]');

        if (enterManuallyButton) {
            console.log(enterManuallyButton);
            enterManuallyButton.click();
            console.log("Enter cover letter button clicked.");
        } else {
            console.error("Enter cover letter button not found.");
            //***********************/
            // DON'T CHANGE THIS LINE
            //***********************/
            sendResponse({ message: "Enter cover letter button not found." });
            return;
        }

        let isCoverLetterAttached = false;

        const intervalId = setInterval(() => {
            const coverLetterInput = document.getElementById('cover_letter_text');
            if (coverLetterInput) {
                clearInterval(intervalId); // Stop polling once the element is found
                coverLetterInput.value = coverLetter;
                triggerEvent(coverLetterInput);
                isCoverLetterAttached = true;
            }
        }, 100); // Check every 100ms

        (async () => {
            await new Promise(resolve => setTimeout(() => {
                clearInterval(intervalId);
                resolve();
            }, 5000));

            if (isCoverLetterAttached) {
                sendResponse({ message: "Cover letter attached." });
            } else {
                sendResponse({ message: "Cover letter not attached." });
            }
        })();
    }
})