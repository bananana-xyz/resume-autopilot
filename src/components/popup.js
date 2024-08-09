/*global chrome*/
import { useEffect, useState, useRef } from 'react';

import OpenAI from 'openai';
import Alert from '@mui/material/Alert';

// icon
import DeleteIcon from '../icons/DeleteIcon';
import DownloadIcon from '../icons/DownloadIcon';

// constant
const DefaultColor = "#9A6852"

function Main() {
  const [isSetup, setIsSetup] = useState(false);
  const [formData, setFormData] = useState({});
  const [resume, setResume] = useState(null)
  const [resumeName, setResumeName] = useState(null);
  const [jobContent, setJobContent] = useState("");
  const [openAIAPI, setOpenAIAPI] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const hiddenFileInput = useRef(null);

  useEffect(() => {
    chrome.storage?.sync.get(['formData', 'resumeName'], (data) => {
      if (data.formData) {
        setFormData(data.formData);
      }
      if (data.resumeName) {
        setResumeName(data.resumeName);
      }
    });
    chrome.storage?.local.get(['resume', 'openAIAPI'], data => {
      if (data.resume) {
        setResume(data.resume);
      }
      if (data.openAIAPI) {
        setOpenAIAPI(data.openAIAPI);
      }
    })

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: 'getJobContent',
        },
        (response) => {
          if (typeof response !== "undefined") {
            setJobContent(response.text)
          }
        }
      );
    });
  }, []);

  useEffect(() => {
    if (alert.open) {
      const timer = setTimeout(() => {
        setAlert({ open: false, message: '', severity: 'success' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.open]);

  const handleSetForms = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSetup = () => {
    setIsSetup(!isSetup);
  }

  const handleSave = (e) => {
    e.preventDefault();
    chrome.storage?.sync.set({ formData: formData }, function () {
      console.log('Data is saved:', formData);
    });
    chrome.storage?.local.set({openAIAPI: openAIAPI}, () => {
      console.log('OpenAI API Key saved');
    })
    setAlert({ open: true, message: 'Your information saved!', severity: 'success' });
  };

  const handleFill = (e) => {
    e.preventDefault();
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: 'autoFill',
          value: formData
        }
      );
    });

    if (resume) {
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'uploadResume',
            resume: resume,
            resumeName: resumeName
          }
        );
      });
    }
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resumeContentBase64 = e.target.result.split(',')[1]; // Get Base64 part of the result

        // Store the Base64 string and file name
        chrome.storage?.local.set({ resume: resumeContentBase64 }, () => {
          console.log('Resume content saved as Base64');
        });
        chrome.storage?.sync.set({ resumeName: file.name }, () => {
          console.log('Resume name saved');
        });

        setResume(resumeContentBase64);
        setResumeName(file.name);
      }
      reader.readAsDataURL(file); // Read file as data URL to get Base64 encoding

      // Change the input key to force re-render
      e.target.value = null;
    }
  }

  const handleResumeDownload = () => {
    const byteCharacters = atob(resume);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  const handleFileUpload = () => {
    if (!resume) {
      hiddenFileInput.current.click();
    } else {
      handleResumeClear()
    }
  }

  const handleResumeClear = () => {
    setResume(null);
    chrome.storage?.local.remove('resume', () => {
      console.log('Resume cleared')
    })
    setResumeName(null);
    chrome.storage?.sync.remove('resumeName', () => {
      console.log('Resume Name cleared')
    })
  }

  const handleOpenAIAPI = (e) => {
    setOpenAIAPI(e.target.value);
  }

  const handleCoverLetter = () => {
    if (jobContent) {
      const client = new OpenAI({
        apiKey: openAIAPI,
        dangerouslyAllowBrowser: true
      });
      const chatCompletion = client.chat.completions.create({
        messages: [{ role: 'user', content: jobContent}],
        model: 'gpt-3.5-turbo',
        prompt: 'write a cover letter for the following job description based on the resume'
      });
      console.log(chatCompletion.choices[0])
    }
  }

  return (
    <div className="flex-1 w-[400px] p-5" style={{backgroundColor: "rgba(218, 190, 167, 0.4)", color: DefaultColor}}>
      {alert.open && (
        <div className="fixed inset-0 justify-center p-2">
          <div className="w-full max-w-sm">
            <Alert severity="success">Your information saved!</Alert>
          </div>
        </div>
      )}

      <div className="flex-1 justify-center text-center pb-5">
        <div className="flex-1 font-bold text-2xl">Greenhouse Autopilot</div>
      </div>

      {!isSetup && (
        <div className="flex flex-col flex-1 w-full">

          <div className="pb-5 w-full">
            <button
              className="bg-green-400 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleFill}
            >
              Auto Fill
            </button>
          </div>

          <div className="pb-5 w-full flex-1">
            <button
              className="bg-green-300 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleSetup}
            >
              Setup
            </button>
          </div>

          <div className="pb-5 w-full flex-1">
            <button
              className="bg-green-300 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleCoverLetter}
            >
              Generate Cover Letter
            </button>
          </div>

        </div>
      )}

      {isSetup && (
        <div className="flex flex-col flex-1 w-full">

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleSetForms}
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleSetForms}
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">Email</label>
            <input
              type="text"
              name="email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="Email"
              value={formData.email}
              onChange={handleSetForms}
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">Phone</label>
            <input
              type="text"
              name="phone"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleSetForms}
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">LinkedIn</label>
            <input
              type="text"
              name="linkedin"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="https://www.linkedin.com/in/username"
              value={formData.linkedin}
              onChange={handleSetForms}
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">OpenAI API Key</label>
            <input
              type="text"
              name="openAIAPI"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="(Optional) sk-proj-. . ."
              value={openAIAPI}
              onChange={handleOpenAIAPI}
            />
          </div>

          {
            resume && (
              <div className='pb-2'>
                <label className="block text-bold text-base text-gray-700 pb-1">Reume</label>
                <div className='flex items-center justify-between'>
                  <p className='flex-1 text-bold text-base'>{resumeName}</p>
                  <div className="flex">
                    <div
                      className="hover:cursor-pointer hover:bg-slate-100 transition-colors duration-300 p-1 rounded-full"
                      onClick={handleResumeDownload}
                    >
                      <DownloadIcon stroke="rgb(251 146 60)" />
                    </div>
                    <div
                      className="hover:cursor-pointer hover:bg-slate-100 transition-colors duration-300 p-1 rounded-full"
                      onClick={handleFileUpload}
                    >
                      <DeleteIcon stroke="rgb(248 113 113)" />
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            !resume && (
              <div className="pt-2 w-full flex-1">
                <button
                  className={`bg-orange-400 text-white font-bold py-2 px-4 rounded w-full`}
                  onClick={handleFileUpload}
                >
                  Upload Resume
                </button>
                <input
                  type="file"
                  accept='.pdf'
                  onChange={handleResumeUpload}
                  ref={hiddenFileInput}
                  style={{display: 'none'}} // Make the file input element invisible
                />
              </div>
            )
          }

          <div className="pt-2 w-full flex-1">
            <button
              className="bg-orange-400 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleSave}
            >
              Save
            </button>
          </div>

          <div className="pt-2 w-full flex-1">
            <button
              className="bg-orange-400 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleSetup}
            >
              Back
            </button>
          </div>


        </div>
      )}


    </div>
  );
}

export default Main;