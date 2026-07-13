import Toybox.Application;
import Toybox.Communications;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Sensor;
import Toybox.System;
import Toybox.Timer;
import Toybox.WatchUi;

class AppController extends WatchUi.BehaviorDelegate {
  const OP_NONE = 0;
  const OP_CREATE_SESSION = 1;
  const OP_POST_HEART = 2;

  const HEART_INTERVAL_MS = 30000;
  const SCREEN_QR = 0;
  const SCREEN_HEART = 1;
  const SCREEN_LINK = 2;

  var _op as Number = OP_NONE;
  var _screen as Number = SCREEN_QR;
  var _heartTimer as Timer.Timer or Null = null;
  var _lastHttpUrl as String = "";
  var _qrView as QrView or Null = null;
  var _heartView as HeartView or Null = null;
  var _linkView as LinkView or Null = null;
  var _qrBitmap as WatchUi.BitmapResource or Graphics.BitmapReference or Null = null;
  var _qrSize as Number = 160;

  function getInitialView() as QrView {
    return _qrView;
  }

  function initialize() {
    BehaviorDelegate.initialize();
    _qrView = new QrView(self);
    _heartView = new HeartView(self);
    _linkView = new LinkView(self);
    UiState.setStatus(L10n.t(Rez.Strings.StatusSharing));
    ensureSession();
    startHeartTimer();
  }

  function getQrBitmap() as WatchUi.BitmapResource or Graphics.BitmapReference or Null {
    return _qrBitmap;
  }

  function onQrShow() as Void {
    if (_qrBitmap == null && UiState.qrError == null) {
      loadQrImage();
    }
  }

  function onMenu() as Boolean {
    showMenu();
    return true;
  }

  function onSelect() as Boolean {
    showMenu();
    return true;
  }

  function onSwipe(swipeEvent as WatchUi.SwipeEvent) as Boolean {
    var dir = swipeEvent.getDirection();
    if (dir == WatchUi.SWIPE_UP) {
      showNextScreen();
      return true;
    }
    if (dir == WatchUi.SWIPE_DOWN) {
      showPreviousScreen();
      return true;
    }
    return false;
  }

  function onNextPage() as Boolean {
    showNextScreen();
    return true;
  }

  function onPreviousPage() as Boolean {
    showPreviousScreen();
    return true;
  }

  function showNextScreen() as Void {
    if (_screen == SCREEN_QR) {
      showHeartScreen();
    } else if (_screen == SCREEN_HEART) {
      showLinkScreen();
    } else {
      showQrScreen();
    }
  }

  function showPreviousScreen() as Void {
    if (_screen == SCREEN_LINK) {
      showHeartScreen();
    } else if (_screen == SCREEN_HEART) {
      showQrScreen();
    } else {
      showLinkScreen();
    }
  }

  function showMenu() as Void {
    if (UiState.loading) {
      return;
    }
    WatchUi.pushView(new AppMenu(), new AppMenuDelegate(self), WatchUi.SLIDE_UP);
  }

  function showLinkScreen() as Void {
    if (_screen == SCREEN_LINK) {
      return;
    }
    _screen = SCREEN_LINK;
    WatchUi.switchToView(_linkView, self, WatchUi.SLIDE_UP);
  }

  function showQrScreen() as Void {
    if (_screen == SCREEN_QR) {
      return;
    }
    _screen = SCREEN_QR;
    WatchUi.switchToView(_qrView, self, WatchUi.SLIDE_DOWN);
  }

  function showHeartScreen() as Void {
    if (_screen == SCREEN_HEART) {
      return;
    }
    _screen = SCREEN_HEART;
    WatchUi.switchToView(_heartView, self, WatchUi.SLIDE_UP);
  }

  function ensureSession() as Void {
    if (SessionStore.hasSession()) {
      loadQrImage();
      postHeartRate();
      return;
    }
    beginCreateSession();
  }

  function resetSession() as Void {
    stopHeartTimer();
    SessionStore.clear();
    _qrBitmap = null;
    UiState.setError(null);
    UiState.setQrError(null);
    ensureSession();
    startHeartTimer();
    WatchUi.requestUpdate();
  }

  function beginCreateSession() as Void {
    UiState.setLoading(true);
    WatchUi.requestUpdate();
    _op = OP_CREATE_SESSION;
    _lastHttpUrl = Config.sessionCreateUrl();
    ApiClient.createSession(method(:onHttpResponse));
  }

  function startHeartTimer() as Void {
    stopHeartTimer();
    _heartTimer = new Timer.Timer();
    _heartTimer.start(method(:onHeartTimer), HEART_INTERVAL_MS, true);
  }

  function stopHeartTimer() as Void {
    if (_heartTimer != null) {
      _heartTimer.stop();
      _heartTimer = null;
    }
  }

  function onHeartTimer() as Void {
    postHeartRate();
  }

  function postHeartRate() as Void {
    if (UiState.loading || _op != OP_NONE) {
      return;
    }
    var sessionId = SessionStore.getSessionId();
    var secret = SessionStore.getSecret();
    if (sessionId == null || secret == null) {
      return;
    }

    var bpm = readHeartRate();
    if (bpm == null) {
      UiState.setStatus(L10n.t(Rez.Strings.ErrorNoHeartRate));
      WatchUi.requestUpdate();
      return;
    }

    _op = OP_POST_HEART;
    _lastHttpUrl = Config.heartUrl(sessionId);
    ApiClient.postHeart(sessionId, secret, bpm, method(:onHttpResponse));
  }

  function readHeartRate() as Number or Null {
    try {
      var info = Sensor.getInfo();
      if (info != null && info.heartRate != null) {
        var hr = info.heartRate;
        if (hr > 0 && hr < 255) {
          return hr;
        }
      }
    } catch (ex) {
    }
    return null;
  }

  function loadQrImage() as Void {
    var sessionId = SessionStore.getSessionId();
    if (sessionId == null) {
      return;
    }
    UiState.setQrLoading(true);
    WatchUi.requestUpdate();

    var size = QrLayout.maxQrPixelSize();
    _qrSize = size;
    var url = Config.qrUrl(sessionId, size);
    var options = {
      :palette => [Graphics.COLOR_WHITE, Graphics.COLOR_BLACK],
      :maxWidth => size,
      :maxHeight => size,
      :dithering => Communications.IMAGE_DITHERING_NONE
    };
    HttpDebug.logRequest(url, null, null);
    Communications.makeImageRequest(url, null, options, method(:onQrImageResponse));
  }

  function onQrImageResponse(code as Number, data as WatchUi.BitmapResource or Graphics.BitmapReference or Null) as Void {
    HttpDebug.logResponse("qr.png", code, data);
    UiState.setQrLoading(false);
    if (code == 200 && data != null) {
      _qrBitmap = data;
      UiState.setQrError(null);
    } else if (code < 0) {
      UiState.setQrError(HttpDebug.communicationsErrorLabel(code));
    } else {
      UiState.setQrError(L10n.tf(Rez.Strings.ErrorHttp, [code]));
    }
    WatchUi.requestUpdate();
  }

  (:typecheck(false))
  function onHttpResponse(code as Number, data as Dictionary or String or Null) as Void {
    HttpDebug.logResponse(_lastHttpUrl, code, data);
    var op = _op;
    _op = OP_NONE;

    if (op == OP_CREATE_SESSION) {
      handleCreateSession(code, data);
      return;
    }
    if (op == OP_POST_HEART) {
      handlePostHeart(code, data);
      return;
    }
  }

  (:typecheck(false))
  function handleCreateSession(code as Number, data as Dictionary or String or Null) as Void {
    UiState.setLoading(false);
    if (code < 0) {
      UiState.setError(HttpDebug.communicationsErrorLabel(code));
      WatchUi.requestUpdate();
      return;
    }
    if (code != 201 && code != 200) {
      UiState.setError(L10n.tf(Rez.Strings.ErrorHttp, [code]));
      WatchUi.requestUpdate();
      return;
    }
    if (data == null || !(data instanceof Lang.Dictionary)) {
      UiState.setError(L10n.t(Rez.Strings.ErrorInvalidResponse));
      WatchUi.requestUpdate();
      return;
    }
    var dict = data as Lang.Dictionary;
    var id = dict.get("id");
    var secret = dict.get("secret");
    if (id == null || secret == null || !(id instanceof String) || !(secret instanceof String)) {
      UiState.setError(L10n.t(Rez.Strings.ErrorInvalidResponse));
      WatchUi.requestUpdate();
      return;
    }
    SessionStore.saveSession(id as String, secret as String);
    UiState.setError(null);
    _qrBitmap = null;
    loadQrImage();
    postHeartRate();
    WatchUi.requestUpdate();
  }

  (:typecheck(false))
  function handlePostHeart(code as Number, data as Dictionary or String or Null) as Void {
    if (code < 0) {
      UiState.setError(HttpDebug.communicationsErrorLabel(code));
      WatchUi.requestUpdate();
      return;
    }
    if (code != 201 && code != 200) {
      UiState.setError(L10n.tf(Rez.Strings.ErrorHttp, [code]));
      WatchUi.requestUpdate();
      return;
    }
    var bpm = readHeartRate();
    if (bpm != null) {
      SessionStore.setLastBpm(bpm);
    }
    UiState.setError(null);
    UiState.setStatus(L10n.t(Rez.Strings.StatusSharing));
    WatchUi.requestUpdate();
  }
}
