import React from 'react'
import { Unity, useUnityContext } from "react-unity-webgl";
export const UnityDisplay = () => {
  const { unityProvider } = useUnityContext({
    loaderUrl: "Build/Build/Build.loader.js",
    dataUrl: "Build/Build/Build.data",
    frameworkUrl: "Build/Build/Build.framework.js",
    codeUrl: "Build/Build/Build.wasm",
  });
  return (
    <div className='unity-component-area'>
      <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100vh' }} />
    </div>
  )
}


