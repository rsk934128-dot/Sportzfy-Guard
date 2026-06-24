import React, { useState } from 'react';
import { Copy, Check, Shield, Code, ToggleLeft, ToggleRight, Sparkles, BookOpen } from 'lucide-react';

interface ReactNativeConfigGeneratorProps {
  language: 'EN' | 'BN';
}

export default function ReactNativeConfigGenerator({ language }: ReactNativeConfigGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    blockRedirects: true,
    disablePopups: true,
    mobileUserAgent: true,
    sandboxAndroid: true,
    injectAdBlocker: true,
    allowInlineMedia: true,
    clearCookies: true,
  });

  const toggleOption = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateCode = () => {
    const isBlockRedirects = config.blockRedirects;
    const isDisablePopups = config.disablePopups;
    const isMobileUA = config.mobileUserAgent;
    const isSandboxAndroid = config.sandboxAndroid;
    const isInjectAdBlocker = config.injectAdBlocker;
    const isInlineMedia = config.allowInlineMedia;
    const isClearCookies = config.clearCookies;

    let imports = `import React, { useRef, useEffect } from 'react';\nimport { StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';\nimport { WebView } from 'react-native-webview';`;
    if (isClearCookies) {
      imports += `\n// Note: Install standard packages: npm install react-native-cookie-manager\n// import CookieManager from '@react-native-cookies/cookies';`;
    }
    
    let adBlockJS = '';
    if (isInjectAdBlocker) {
      adBlockJS = `\n  // Custom script to hide popular ad banners, redirects, and floating popups\n  const adBlockScript = \`\n    (function() {\n      const style = document.createElement('style');\n      style.innerHTML = 'iframe[src*="bet"], div[class*="ad"], .popup, #floating-ad, [id*="google_ads"] { display: none !important; }';\n      document.head.appendChild(style);\n      \n      // Block window.open override\n      window.open = function() {\n        console.log('Blocked malicious window.open() attempt');\n        return null;\n      };\n    })();\n  \`;`;
    }

    let cookieCleanCode = '';
    if (isClearCookies) {
      cookieCleanCode = `\n  // Sovereign Fintech Shield: Clean cookies & WebStorage cache on stream load\n  useEffect(() => {\n    const cleanBrowserData = async () => {\n      try {\n        // Clears all standard WebStorage cache data\n        // WebStorage.getInstance().deleteAllData(); (Native Android Bridge API)\n        \n        // Clear third-party cookies safely\n        // await CookieManager.clearAll();\n        console.log('Sovereign Shield: Browser cache and cookies flushed successfully.');\n      } catch (err) {\n        console.warn('Failed to clear cookies: ', err);\n      }\n    };\n    cleanBrowserData();\n  }, []);\n`;
    }

    let onShouldStartLoad = '';
    if (isBlockRedirects) {
      onShouldStartLoad = `\n  // Network Filtering Blocklist (NoorNexus Suite Config)\n  const BLOCKED_DOMAINS = [\n    'bet-casino',\n    'doubleclick',\n    'ads-server',\n    'popunder',\n    '1xbet',\n    'adservice',\n    'betting'\n  ];\n\n  // Intercept requests and only allow trusted domains & media streams\n  const handleNavigationStateChange = (request) => {\n    const { url } = request;\n    const normalizedUrl = url.toLowerCase();\n    \n    // Block any matching malicious domains dynamically\n    const isBlocked = BLOCKED_DOMAINS.some(domain => normalizedUrl.includes(domain));\n    if (isBlocked) {\n      Alert.alert('Security Shield Active', 'Blocked unsafe redirect/ad domain: ' + url.substring(0, 30) + '...');\n      return false; // Prevent navigation\n    }\n    return true; // Allow streaming url loading\n  };`;
    }

    let webViewProps = `      <WebView\n        ref={webViewRef}\n        source={{ uri: 'https://your-sports-stream-link.com' }}`;

    if (isMobileUA) {
      webViewProps += `\n        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36"`;
    }
    
    if (isInlineMedia) {
      webViewProps += `\n        allowsInlineMediaPlayback={true}\n        mediaPlaybackRequiresUserAction={false}`;
    }

    if (isDisablePopups) {
      webViewProps += `\n        setSupportMultipleWindows={false} // Block popup tabs!`;
    }

    if (isSandboxAndroid) {
      webViewProps += `\n        javaScriptEnabled={true}\n        domStorageEnabled={true}\n        geolocationEnabled={false}\n        // Android specific safe configurations\n        mixedContentMode="never"`;
    }

    if (isInjectAdBlocker) {
      webViewProps += `\n        injectedJavaScript={adBlockScript}`;
    }

    if (isBlockRedirects) {
      webViewProps += `\n        onShouldStartLoadWithRequest={handleNavigationStateChange}`;
    }

    webViewProps += `\n        startInLoadingState={true}\n        renderLoading={() => <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />}\n      />`;

    return `${imports}\n${adBlockJS}\n\nexport default function SecureStreamingScreen() {\n  const webViewRef = useRef(null);\n${cookieCleanCode}${onShouldStartLoad}\n\n  return (\n    <SafeAreaView style={styles.container}>\n${webViewProps}\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#020617', // Slate 950 background\n  },\n  loader: {\n    position: 'absolute',\n    top: '50%',\n    left: '50%',\n    transform: [{ translateX: -20 }, { translateY: -20 }],\n  }\n});`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="config-generator-section" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header banner */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold border border-indigo-500/20">
              REACT NATIVE WEBVIEW
            </span>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'EN' ? 'Strict Security Config' : 'উচ্চ নিরাপত্তা কনফিগারেশন'}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-100 font-display">
            {language === 'EN' ? 'Secure React Native Code Generator' : 'নিরাপদ রিঅ্যাক্ট নেটিভ কোড জেনারেটর'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {language === 'EN'
              ? 'Aggressive third-party stream sites can leak ads or redirect mobile app views. Customize these security settings to instantly generate safe React Native code.'
              : 'থার্ড-পার্টি স্পোর্টস স্ট্রিম সাইটগুলোতে অপ্রীতিকর বিজ্ঞাপন বা ক্ষতিকর রিডাইরেক্ট থাকে। নিচের অপশনগুলো সিলেক্ট করে আপনার রিঅ্যাক্ট নেটিভ অ্যাপের জন্য সুরক্ষিত কোড তৈরি করুন।'}
          </p>
        </div>

        <button
          id="copy-rn-code-btn"
          onClick={handleCopy}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans transition shadow-lg shadow-indigo-600/20 shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>{language === 'EN' ? 'Copied Code!' : 'কপি হয়েছে!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{language === 'EN' ? 'Copy TSX Code' : 'TSX কোড কপি করুন'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Settings Toggle Column */}
        <div className="lg:col-span-4 p-6 space-y-6 bg-slate-900/50">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
              {language === 'EN' ? 'SECURITY CUSTOMIZER' : 'সিকিউরিটি কাস্টমাইজেশন'}
            </h4>
          </div>

          <div className="space-y-4">
            {/* Toggle Item 1 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('blockRedirects')}>
                  {language === 'EN' ? 'Block Malicious Redirects' : 'ক্ষতিকর রিডাইরেক্ট ব্লক করুন'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN' 
                    ? 'Intercepts request URLs to block top-level betting & popups using handles.'
                    : 'অনাকাঙ্ক্ষিত ডোমেইন, বিজ্ঞাপন ও বেটিং রিডাইরেক্ট রুখতে প্রতিটি রিকোয়েস্ট ইউআরএল ফিল্টার করে।'}
                </span>
              </div>
              <button
                id="toggle-block-redirects"
                onClick={() => toggleOption('blockRedirects')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.blockRedirects ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.blockRedirects ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Toggle Item 2 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('disablePopups')}>
                  {language === 'EN' ? 'Block Popup Tabs (Multi-Windows)' : 'পপ-আপ উইন্ডো প্রতিরোধ'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN'
                    ? 'Prevents the stream site from opening secondary ad-windows / blank tabs.'
                    : 'নতুন উইন্ডো (target="_blank") বা বিরক্তিকর ট্যাব ওপেন করা থেকে ব্রাউজারকে বিরত রাখে।'}
                </span>
              </div>
              <button
                id="toggle-disable-popups"
                onClick={() => toggleOption('disablePopups')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.disablePopups ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.disablePopups ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Toggle Item 3 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('mobileUserAgent')}>
                  {language === 'EN' ? 'Custom Mobile User Agent' : 'কাস্টম মোবাইল ইউজার এজেন্ট'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN'
                    ? 'Forces mobile optimized player viewport to prevent responsive breakage.'
                    : 'মোবাইল অপ্টিমাইজড প্লেয়ার লেআউট লোড করতে এটি সাহায্য করে এবং ব্লক হওয়া প্রতিহত করে।'}
                </span>
              </div>
              <button
                id="toggle-mobile-ua"
                onClick={() => toggleOption('mobileUserAgent')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.mobileUserAgent ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.mobileUserAgent ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Toggle Item 4 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('injectAdBlocker')}>
                  {language === 'EN' ? 'Inject Script Banner CSS Stripper' : 'অ্যাড-ব্লকার স্ক্রিপ্ট ইনজেকশন'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN'
                    ? 'Injects customized CSS overlay blockers directly into the frame DOM.'
                    : 'স্ট্রিমিং ফ্রেমের ভেতরে কাস্টম জাভাস্ক্রিপ্ট রান করে অটোমেটিকলি বিজ্ঞাপন এবং পপআপ ওভারলেগুলো লুকিয়ে ফেলে।'}
                </span>
              </div>
              <button
                id="toggle-adblock-script"
                onClick={() => toggleOption('injectAdBlocker')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.injectAdBlocker ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.injectAdBlocker ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Toggle Item 5 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('sandboxAndroid')}>
                  {language === 'EN' ? 'Restrict Device Permissions' : 'ডিভাইস পারমিশন রেস্ট্রিক্ট করুন'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN'
                    ? 'Disables camera, microphone, and geolocation inside the streaming frame.'
                    : 'স্ট্রিমিং ফ্রেমের ভেতর কোনো ক্যামেরা, অডিও বা লোকেশন অ্যাক্সেস ব্লক করে রাখে।'}
                </span>
              </div>
              <button
                id="toggle-permissions-restrict"
                onClick={() => toggleOption('sandboxAndroid')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.sandboxAndroid ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.sandboxAndroid ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            {/* Toggle Item 6 */}
            <div className="flex items-start justify-between gap-4 p-3 hover:bg-slate-800/30 rounded-xl transition">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block cursor-pointer" onClick={() => toggleOption('clearCookies')}>
                  {language === 'EN' ? 'Sovereign Cookie Cleaner' : 'সোভেরেন কুকি ক্লিনার'}
                </label>
                <span className="text-[10px] text-slate-400 block leading-normal">
                  {language === 'EN'
                    ? 'Auto flushes WebStorage cache and tracking cookies upon starting a match stream.'
                    : 'প্রতিটি নতুন স্ট্রিম সেশন চালুর আগে আগের সব কুকি এবং ব্রাউজার স্টোরেজ ক্যাশে পরিষ্কার করে।'}
                </span>
              </div>
              <button
                id="toggle-cookie-cleaner"
                onClick={() => toggleOption('clearCookies')}
                className={`transition-colors duration-200 outline-none cursor-pointer ${config.clearCookies ? 'text-indigo-400' : 'text-slate-600'}`}
              >
                {config.clearCookies ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>

          {/* Developer Tip Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 text-xs leading-normal">
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-slate-300">
              <strong className="text-slate-100 block mb-0.5 font-sans">
                {language === 'EN' ? 'Crucial React Native Warning' : 'রিঅ্যাক্ট নেটিভ সিকিউরিটি টিপ'}
              </strong>
              {language === 'EN'
                ? 'Always make sure to import react-native-webview from the correct repository. Using the standard sandbox attributes on Android provides robust container isolation.'
                : 'অ্যান্ড্রয়েডের ক্ষেত্রে shouldStartLoadWithRequest এবং allowsInlineMediaPlayback অন রাখলে ব্যবহারকারী খুব সহজে কোনো ঝামেলা ছাড়া ফুলস্ক্রিন স্পোর্টস উপভোগ করতে পারবেন।'}
            </div>
          </div>
        </div>

        {/* IDE Syntax Highlight Code Viewer Column */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>SecureStreamingScreen.tsx</span>
            </div>
            <span className="text-[10px] text-slate-500">TypeScript / React Native</span>
          </div>

          <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto max-h-[480px] overflow-y-auto bg-slate-950/80">
            <pre className="text-[11px] md:text-xs">
              {generateCode().split('\n').map((line, idx) => {
                // simple simulated syntax highlighting
                let className = "text-slate-300";
                if (line.startsWith('import')) className = "text-rose-400";
                else if (line.startsWith('//') || line.trim().startsWith('//')) className = "text-slate-500 italic";
                else if (line.includes('const') || line.includes('let') || line.includes('function')) className = "text-indigo-400";
                else if (line.includes('return') || line.includes('styles')) className = "text-sky-400";
                else if (line.includes('WebView') || line.includes('SafeAreaView')) className = "text-indigo-300";

                return (
                  <div key={idx} className="table-row">
                    <span className="table-cell select-none text-slate-600 text-right pr-4 text-[10px] w-6">{idx + 1}</span>
                    <span className={`table-cell ${className}`}>{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
