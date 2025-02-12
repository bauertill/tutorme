"use client";

import { useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function CodeSandbox() {
  const [code, setCode] = useState('console.log("Hello, World!");');

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Code Sandbox</h2>
      <div className="flex-1">
        <Sandpack
          template="vanilla"
          files={{
            "/src/index.js": code,
          }}
          options={{
            showNavigator: false,
            showTabs: false,
            showConsole: true,
            classes: {
              "sp-wrapper": "h-full",
              "sp-layout": "h-full",
            },
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}
