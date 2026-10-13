using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace LingjingZhiyouLauncher
{
    internal static class Program
    {
        private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".html", "text/html; charset=utf-8" },
            { ".js", "text/javascript; charset=utf-8" },
            { ".css", "text/css; charset=utf-8" },
            { ".json", "application/json; charset=utf-8" },
            { ".svg", "image/svg+xml" },
            { ".webp", "image/webp" },
            { ".png", "image/png" },
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".ico", "image/x-icon" },
            { ".wav", "audio/wav" },
            { ".woff", "font/woff" },
            { ".woff2", "font/woff2" },
            { ".wasm", "application/wasm" }
        };

        private static volatile bool _running = true;
        private static TcpListener _listener;
        private static string _webRoot;

        private static int Main()
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.Title = "灵境智游 - 本地运行服务";
            _webRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www"));

            if (!Directory.Exists(_webRoot) || !File.Exists(Path.Combine(_webRoot, "index.html")))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("启动失败：未找到 www\\index.html。");
                Console.WriteLine("请保持“灵境智游.exe”和“www”文件夹位于同一目录。");
                Console.ResetColor();
                Console.WriteLine("按任意键退出……");
                Console.ReadKey(true);
                return 1;
            }

            int port = FindAvailablePort(4173, 4190);
            if (port == 0)
            {
                Console.WriteLine("启动失败：4173-4190 端口均被占用。");
                Console.WriteLine("请关闭占用端口的程序后重试。");
                Console.ReadKey(true);
                return 2;
            }

            string url = "http://127.0.0.1:" + port + "/";
            Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs args)
            {
                args.Cancel = true;
                _running = false;
                try { _listener.Stop(); } catch { }
            };

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("灵境智游已启动");
            Console.ResetColor();
            Console.WriteLine("访问地址：" + url);
            Console.WriteLine("浏览器即将自动打开。关闭此窗口即可停止服务。");
            Console.WriteLine();

            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch
            {
                Console.WriteLine("未能自动打开浏览器，请手动复制上方地址访问。");
            }

            try
            {
                while (_running)
                {
                    TcpClient client = _listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(delegate { HandleClient(client); });
                }
            }
            catch (SocketException)
            {
                if (_running) return 3;
            }
            catch (ObjectDisposedException) { }
            return 0;
        }

        private static int FindAvailablePort(int start, int end)
        {
            for (int port = start; port <= end; port++)
            {
                try
                {
                    _listener = new TcpListener(IPAddress.Loopback, port);
                    _listener.Start();
                    return port;
                }
                catch (SocketException) { }
            }
            return 0;
        }

        private static void HandleClient(TcpClient client)
        {
            using (client)
            {
                client.ReceiveTimeout = 5000;
                client.SendTimeout = 10000;
                NetworkStream stream = client.GetStream();
                try
                {
                    string method;
                    string requestPath;
                    using (StreamReader reader = new StreamReader(stream, Encoding.ASCII, false, 4096, true))
                    {
                        string requestLine = reader.ReadLine();
                        if (string.IsNullOrWhiteSpace(requestLine)) return;
                        string[] parts = requestLine.Split(' ');
                        if (parts.Length < 2) return;
                        method = parts[0].ToUpperInvariant();
                        requestPath = parts[1];
                        string header;
                        do { header = reader.ReadLine(); } while (!string.IsNullOrEmpty(header));
                    }

                    if (requestPath.StartsWith("/api/tts", StringComparison.OrdinalIgnoreCase))
                    {
                        byte[] body = Encoding.UTF8.GetBytes("{\"error\":\"本地便携版使用浏览器语音回退\"}");
                        WriteResponse(stream, 503, "Service Unavailable", "application/json; charset=utf-8", body, "no-store");
                        return;
                    }

                    if (method != "GET" && method != "HEAD")
                    {
                        WriteResponse(stream, 405, "Method Not Allowed", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Method Not Allowed"), "no-store");
                        return;
                    }

                    int queryIndex = requestPath.IndexOf('?');
                    if (queryIndex >= 0) requestPath = requestPath.Substring(0, queryIndex);
                    requestPath = Uri.UnescapeDataString(requestPath).Replace('/', Path.DirectorySeparatorChar).TrimStart(Path.DirectorySeparatorChar);
                    if (string.IsNullOrEmpty(requestPath)) requestPath = "index.html";

                    string candidate = Path.GetFullPath(Path.Combine(_webRoot, requestPath));
                    if (!candidate.StartsWith(_webRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) && !string.Equals(candidate, Path.Combine(_webRoot, "index.html"), StringComparison.OrdinalIgnoreCase))
                    {
                        WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Forbidden"), "no-store");
                        return;
                    }

                    if (!File.Exists(candidate)) candidate = Path.Combine(_webRoot, "index.html");
                    byte[] content = File.ReadAllBytes(candidate);
                    string extension = Path.GetExtension(candidate);
                    string mime;
                    if (!MimeTypes.TryGetValue(extension, out mime)) mime = "application/octet-stream";
                    string cache = string.Equals(extension, ".html", StringComparison.OrdinalIgnoreCase) ? "no-cache" : "public, max-age=31536000, immutable";
                    WriteResponse(stream, 200, "OK", mime, method == "HEAD" ? new byte[0] : content, cache, method == "HEAD" ? content.Length : -1);
                }
                catch
                {
                    try { WriteResponse(stream, 500, "Internal Server Error", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Internal Server Error"), "no-store"); } catch { }
                }
            }
        }

        private static void WriteResponse(Stream stream, int statusCode, string statusText, string contentType, byte[] body, string cacheControl, int reportedLength = -1)
        {
            int length = reportedLength >= 0 ? reportedLength : body.Length;
            string headers = "HTTP/1.1 " + statusCode + " " + statusText + "\r\n" +
                             "Content-Type: " + contentType + "\r\n" +
                             "Content-Length: " + length + "\r\n" +
                             "Cache-Control: " + cacheControl + "\r\n" +
                             "X-Content-Type-Options: nosniff\r\n" +
                             "Connection: close\r\n\r\n";
            byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (body.Length > 0) stream.Write(body, 0, body.Length);
        }
    }
}
