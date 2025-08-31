import React, { useState } from 'react'
import "./App.css"
import Navbar from './components/Navbar'
import Editor from '@monaco-editor/react';
import Select from 'react-select';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown'
import RingLoader from "react-spinners/RingLoader";

const App = () => {
  const options = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'dart', label: 'Dart' },
    { value: 'scala', label: 'Scala' },
    { value: 'perl', label: 'Perl' },
    { value: 'haskell', label: 'Haskell' },
    { value: 'elixir', label: 'Elixir' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'bash', label: 'Bash' }
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#18181b',
      borderColor: '#3f3f46',
      color: '#fff',
      width: "100%"
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#18181b',
      color: '#fff',
      width: "100%"
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
      width: "100%"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#27272a' : '#18181b',
      color: '#fff',
      cursor: 'pointer',
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff',
      width: "100%"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a1a1aa',
      width: "100%"
    }),
  };

  const [code, setCode] = useState("");
  const ai = new GoogleGenAI({ apiKey: "AIzaSyD729Gf7UltsFnHb9DMIrVbHvNfLMJZxws" }); // replace with your real key
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  // 🔍 Review code function
  async function reviewCode() {
    setResponse("")
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are an expert software developer.
Review this ${selectedOption.value} code with:
1. Rating (Better, Good, Normal, Bad)
2. Improvements
3. Explanation step by step
4. Bugs or errors
5. Fix suggestions
6. Commented version of the code

Code:
${code}`,
    });
    setResponse(response.text)
    setLoading(false);
  }

  // 🔧 Fix code function
  async function fixCode() {
    if (code === "") {
      alert("Please enter code first");
      return;
    }
    setResponse("")
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are an expert-level ${selectedOption.value} developer.
Here is some buggy or inefficient code:
${code}

Fix this code and rewrite it cleanly with:
- Correct syntax
- Optimized performance
- Best practices
- Comments explaining changes
- IMPORTANT: Return the fixed code inside a markdown block like this:

\`\`\`${selectedOption.value}
...fixed code here...
\`\`\`

Then explain what changed below.`,
    });

    const text = response.text;

    // 🪄 Extract fixed code from markdown block using regex
    const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);

    if (match && match[1]) {
      const fixedCode = match[1].trim();
      setCode(fixedCode); // update Monaco editor
    }

    setResponse(text); // still show full explanation
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <div className="main flex justify-between" style={{ height: "calc(100vh - 90px)" }}>
        <div className="left h-[87.5%] w-[50%]">
          <div className="tabs !mt-5 !px-5 !mb-3 w-full flex items-center gap-[10px]">
            <Select
              value={selectedOption}
              onChange={(e) => { setSelectedOption(e) }}
              options={options}
              styles={customStyles}
            />
            {/* Fix Code Button */}
            <button
              className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800"
              onClick={fixCode}
            >
              Fix Code
            </button>
            {/* Review Button */}
            <button
              onClick={() => {
                if (code === "") {
                  alert("Please enter code first")
                } else {
                  reviewCode()
                }
              }}
              className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800"
            >
              Review
            </button>
          </div>

          <Editor
            height="100%"
            theme='vs-dark'
            language={selectedOption.value}
            value={code}
            onChange={(e) => { setCode(e) }}
          />
        </div>

        <div className="right overflow-scroll !p-[10px] bg-zinc-900 w-[50%] h-[101%]">
          <div className="topTab border-b-[1px] border-t-[1px] border-[#27272a] flex items-center justify-between h-[60px]">
            <p className='font-[700] text-[17px]'>Response</p>
          </div>
          {loading && <RingLoader color='#9333ea' />}
          <Markdown>{response}</Markdown>
        </div>
      </div>
    </>
  )
}

export default App
