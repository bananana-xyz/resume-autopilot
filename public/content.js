/*global chrome*/
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
    if (request.action === "uploadResume") {
        const resume = request.resume;
        const resumeName = request.resumeName;
        console.log(resume)
        const attachResumeInput = document.querySelector('input[type="file"][id="resume"]');
        console.log('File input element:', attachResumeInput);
        if (attachResumeInput) {

            // Reconstruct the Blob from the Base64 string
            const byteCharacters = atob(resume);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });

            // Create a File object from the Blob
            const file = new File([blob], resumeName, { type: 'application/octet-stream' });
            console.log('File object:', file);
            // // Create a DataTransfer object and add the resume file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            attachResumeInput.files = dataTransfer.files;

            console.log('File selected:', resumeName);

            // If the form needs to be submitted after the file is attached
            const form = attachResumeInput.closest('form');
            if (form) {
                console.log(form)
            }
        } else {
            console.error("File input element with id 'resume' not found.");
        }
    }
})