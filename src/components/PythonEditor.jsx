"use client";
import CodeMirror from "@uiw/react-codemirror";
import { monokai, monokaiInit } from "@uiw/codemirror-theme-monokai";
import { python } from "@codemirror/lang-python";

const PythonEditor = ({ code, setCode }) => {
  console.log(code);
  const handleCodeChange = (value) => {
    setCode(value);
  };

  return (
    <div className="border p-2 mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        Python Code Editor
      </label>
      <CodeMirror
        value={code}
        theme={monokai}
        extensions={[python({ py: true })]}
        height="150px"
        options={{
          mode: "python",
          lineNumbers: true,
        }}
        onChange={handleCodeChange}
      />
    </div>
  );
};

export default PythonEditor;
