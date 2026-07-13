import Toybox.Application;
import Toybox.Application.Properties;
import Toybox.Lang;

module Config {
  const DEFAULT_BASE_URL = "https://share-heart-rate.vercel.app";

  function baseUrl() as String {
    try {
      var v = Properties.getValue("baseUrl");
      if (v != null && v instanceof String) {
        var s = trim((v as String));
        if (s.length() > 0) {
          return trimTrailingSlash(s);
        }
      }
    } catch (ex) {
    }
    return DEFAULT_BASE_URL;
  }

  function trim(s as String) as String {
    var start = 0;
    var end = s.length();
    while (start < end) {
      var ch = s.substring(start, start + 1);
      if (!ch.equals(" ") && !ch.equals("\t") && !ch.equals("\n") && !ch.equals("\r")) {
        break;
      }
      start += 1;
    }
    while (end > start) {
      var ch2 = s.substring(end - 1, end);
      if (!ch2.equals(" ") && !ch2.equals("\t") && !ch2.equals("\n") && !ch2.equals("\r")) {
        break;
      }
      end -= 1;
    }
    if (start == 0 && end == s.length()) {
      return s;
    }
    return s.substring(start, end);
  }

  function trimTrailingSlash(url as String) as String {
    var s = url;
    while (s.length() > 0 && s.substring(s.length() - 1, s.length()).equals("/")) {
      s = s.substring(0, s.length() - 1);
    }
    return s;
  }

  function sessionCreateUrl() as String {
    return baseUrl() + "/api/session";
  }

  function heartUrl(sessionId as String) as String {
    return baseUrl() + "/api/session/" + sessionId + "/heart";
  }

  function viewerUrl(sessionId as String) as String {
    return baseUrl() + "/session/" + sessionId;
  }

  function qrUrl(sessionId as String, size as Number) as String {
    return baseUrl() + "/api/session/" + sessionId + "/qr.png?size=" + size.toString();
  }
}
