import Toybox.Application.Storage;
import Toybox.Lang;

module SessionStore {
  const KEY_SESSION_ID = "shr_session_id";
  const KEY_SECRET = "shr_session_secret";
  const KEY_LAST_BPM = "shr_last_bpm";

  function clear() as Void {
    safeDel(KEY_SESSION_ID);
    safeDel(KEY_SECRET);
    safeDel(KEY_LAST_BPM);
  }

  function safeDel(key as String) as Void {
    try {
      Storage.deleteValue(key);
    } catch (e) {
    }
  }

  function saveSession(id as String, secret as String) as Void {
    Storage.setValue(KEY_SESSION_ID, id);
    Storage.setValue(KEY_SECRET, secret);
  }

  function hasSession() as Boolean {
    var id = getSessionId();
    var secret = getSecret();
    return id != null && id.length() > 0 && secret != null && secret.length() > 0;
  }

  function getSessionId() as String or Null {
    return readString(KEY_SESSION_ID);
  }

  function getSecret() as String or Null {
    return readString(KEY_SECRET);
  }

  function setLastBpm(bpm as Number) as Void {
    Storage.setValue(KEY_LAST_BPM, bpm);
  }

  function getLastBpm() as Number or Null {
    try {
      var v = Storage.getValue(KEY_LAST_BPM);
      if (v != null && v instanceof Number) {
        return v as Number;
      }
    } catch (ex) {
    }
    return null;
  }

  function readString(key as String) as String or Null {
    try {
      var v = Storage.getValue(key);
      if (v != null && v instanceof String) {
        return v as String;
      }
    } catch (ex) {
    }
    return null;
  }
}
