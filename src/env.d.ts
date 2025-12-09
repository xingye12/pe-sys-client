/// <reference types="vite/client" />

// 可选：如果你想自定义环境变量类型
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_APP_TITLE?: string
    // 其他你定义的 VITE_ 开头环境变量
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  