import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

class HeartView extends WatchUi.View {
  var _controller as AppController;

  function initialize(controller as AppController) {
    View.initialize();
    _controller = controller;
  }

  function onShow() as Void {
    WatchUi.requestUpdate();
  }

  function onUpdate(dc as Graphics.Dc) as Void {
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_BLACK);
    dc.clear();
    var w = dc.getWidth();
    var h = dc.getHeight();
    var cx = w / 2;

    if (UiState.error != null) {
      dc.setColor(Graphics.COLOR_RED, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2, Graphics.FONT_SMALL, UiState.error, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, 30, Graphics.FONT_SMALL, L10n.t(Rez.Strings.HeartTitle), Graphics.TEXT_JUSTIFY_CENTER);

    var bpm = SessionStore.getLastBpm();
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    if (bpm != null && bpm > 0) {
      dc.drawText(cx, h / 2 - 10, Graphics.FONT_NUMBER_HOT, bpm.toString(), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2 + 36, Graphics.FONT_SMALL, L10n.t(Rez.Strings.HeartBpmUnit), Graphics.TEXT_JUSTIFY_CENTER);
    } else {
      dc.drawText(cx, h / 2 - 6, Graphics.FONT_NUMBER_MEDIUM, L10n.t(Rez.Strings.HeartNone), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    var status = UiState.statusLine;
    if (status == null || status.length() == 0) {
      status = L10n.t(Rez.Strings.StatusSharing);
    }
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, h - 32, Graphics.FONT_XTINY, status, Graphics.TEXT_JUSTIFY_CENTER);
  }
}
