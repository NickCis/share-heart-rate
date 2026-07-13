import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

class LinkView extends WatchUi.View {
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
    var marginX = 22;
    var topY = 34;
    var bottomY = h - 30;

    if (UiState.error != null) {
      dc.setColor(Graphics.COLOR_RED, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2, Graphics.FONT_SMALL, UiState.error, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, topY, Graphics.FONT_SMALL, L10n.t(Rez.Strings.LinkTitle), Graphics.TEXT_JUSTIFY_CENTER);

    var sessionId = SessionStore.getSessionId();
    if (sessionId == null || sessionId.length() == 0) {
      dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2, Graphics.FONT_SMALL, L10n.t(Rez.Strings.LinkMissing), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    var url = Config.viewerUrl(sessionId);
    var maxChars = w < 220 ? 18 : 22;
    var lines = TextLayout.wrapByLength(url, maxChars);
    var lineHeight = 16;
    var maxLines = TextLayout.maxLinesForHeight(lineHeight, topY + 14, bottomY);
    var startY = topY + 18;
    var shown = 0;

    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    for (var i = 0; i < lines.size() && shown < maxLines; i++) {
      var y = startY + shown * lineHeight;
      dc.drawText(marginX, y, Graphics.FONT_XTINY, lines[i], Graphics.TEXT_JUSTIFY_LEFT);
      shown += 1;
    }

    if (lines.size() > maxLines) {
      dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, bottomY, Graphics.FONT_XTINY, "...", Graphics.TEXT_JUSTIFY_CENTER);
    }
  }
}
