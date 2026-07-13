import Toybox.Communications;
import Toybox.Lang;
import Toybox.System;

module ApiClient {
  const OP_CREATE_SESSION = 1;
  const OP_POST_HEART = 2;

  function deviceLabel() as String {
    try {
      var info = System.getDeviceSettings();
      if (info != null && info.partNumber != null) {
        return info.partNumber;
      }
    } catch (ex) {
    }
    return "unknown";
  }

  function jsonPostOpts(secret as String or Null) as Lang.Dictionary {
    var headers = { "Content-Type" => Communications.REQUEST_CONTENT_TYPE_JSON };
    if (secret != null && secret.length() > 0) {
      headers.put("Authorization", "Bearer " + secret);
    }
    return {
      :method => Communications.HTTP_REQUEST_METHOD_POST,
      :headers => headers,
      :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON
    };
  }

  function createSession(callback as Lang.Method) as Void {
    var body = { "device" => deviceLabel() };
    var opts = jsonPostOpts(null);
    var url = Config.sessionCreateUrl();
    HttpDebug.logRequest(url, body, opts);
    Communications.makeWebRequest(url, body, opts, callback);
  }

  function postHeart(sessionId as String, secret as String, bpm as Number, callback as Lang.Method) as Void {
    var body = { "bpm" => bpm };
    var opts = jsonPostOpts(secret);
    var url = Config.heartUrl(sessionId);
    HttpDebug.logRequest(url, body, opts);
    Communications.makeWebRequest(url, body, opts, callback);
  }
}
