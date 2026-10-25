import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var backendProcess: Process?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let app = NSApplication.shared
        app.setActivationPolicy(.regular)

        let windowWidth: CGFloat = 1240
        let windowHeight: CGFloat = 820
        let screenRect = NSScreen.main?.frame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let rect = NSRect(
            x: (screenRect.width - windowWidth) / 2,
            y: (screenRect.height - windowHeight) / 2,
            width: windowWidth,
            height: windowHeight
        )

        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Mudra AI"
        window.minSize = NSSize(width: 960, height: 640)
        window.center()

        let config = WKWebViewConfiguration()
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.uiDelegate = self
        webView.navigationDelegate = self
        window.contentView?.addSubview(webView)

        let loadingHtml = """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              background-color: #07090e;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #f8fafc;
            }
            .spinner {
              width: 44px;
              height: 44px;
              border: 3px solid rgba(99, 102, 241, 0.2);
              border-top-color: #6366f1;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            h1 {
              margin-top: 24px;
              font-size: 20px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            p {
              margin-top: 8px;
              font-size: 13px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h1>Mudra AI</h1>
          <p>Starting local AI engine...</p>
        </body>
        </html>
        """
        webView.loadHTMLString(loadingHtml, baseURL: nil)

        window.makeKeyAndOrderFront(nil)
        app.activate(ignoringOtherApps: true)

        startBackendAndLoad()
    }

    func isBackendRunning() -> Bool {
        guard let url = URL(string: "http://127.0.0.1:8000/api/health") else { return false }
        var request = URLRequest(url: url)
        request.timeoutInterval = 0.8
        let semaphore = DispatchSemaphore(value: 0)
        var healthy = false

        let task = URLSession.shared.dataTask(with: request) { _, response, _ in
            if let http = response as? HTTPURLResponse, http.statusCode == 200 {
                healthy = true
            }
            semaphore.signal()
        }
        task.resume()
        _ = semaphore.wait(timeout: .now() + 1.0)
        return healthy
    }

    func startBackendAndLoad() {
        if isBackendRunning() {
            DispatchQueue.main.async {
                self.loadApp()
            }
            return
        }

        let bundle = Bundle.main
        let resPath = bundle.resourcePath ?? ""
        let fileManager = FileManager.default

        let possiblePythons = [
            (resPath as NSString).appendingPathComponent(".venv/bin/python"),
            NSHomeDirectory() + "/codes/projects/Mudra-AI/.venv/bin/python",
            NSHomeDirectory() + "/.venv/bin/python",
            "/opt/homebrew/bin/python3",
            "/usr/local/bin/python3",
            "/usr/bin/python3"
        ]

        var pythonBin: String?
        for path in possiblePythons {
            if fileManager.fileExists(atPath: path) {
                pythonBin = path
                break
            }
        }

        let scriptPath = (resPath as NSString).appendingPathComponent("backend_entry.py")

        if let python = pythonBin, fileManager.fileExists(atPath: scriptPath) {
            let proc = Process()
            proc.executableURL = URL(fileURLWithPath: python)
            proc.arguments = [scriptPath]
            proc.currentDirectoryURL = URL(fileURLWithPath: resPath)
            var env = ProcessInfo.processInfo.environment
            env["PYTHONUNBUFFERED"] = "1"
            proc.environment = env
            proc.standardOutput = FileHandle.nullDevice
            proc.standardError = FileHandle.nullDevice

            do {
                try proc.run()
                self.backendProcess = proc
            } catch {
                print("Backend spawn error: \(error)")
            }
        }

        DispatchQueue.global().async {
            var attempts = 0
            while attempts < 40 {
                if self.isBackendRunning() {
                    DispatchQueue.main.async {
                        self.loadApp()
                    }
                    return
                }
                Thread.sleep(forTimeInterval: 0.5)
                attempts += 1
            }
            DispatchQueue.main.async {
                self.loadApp()
            }
        }
    }

    func loadApp() {
        if let url = URL(string: "http://127.0.0.1:8000") {
            webView.load(URLRequest(url: url))
        }
    }

    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        if let proc = backendProcess, proc.isRunning {
            proc.terminate()
        }
    }
}

let delegate = AppDelegate()
let app = NSApplication.shared
app.delegate = delegate
app.run()
