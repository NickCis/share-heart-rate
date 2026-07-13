import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

class QrView extends WatchUi.View {
  var _controller as AppController;

  function initialize(controller as AppController) {
    View.initialize();
    _controller = controller;
  }

  function onShow() as Void {
    _controller.onQrShow();
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

    if (UiState.qrError != null) {
      dc.setColor(Graphics.COLOR_RED, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2 - 10, Graphics.FONT_SMALL, UiState.qrError, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    var bitmap = _controller.getQrBitmap();
    if (bitmap != null) {
      var bw = bitmap.getWidth();
      var bh = bitmap.getHeight();
      var top = QrLayout.bitmapTop(h, bh);
      dc.drawBitmap(cx - bw / 2, top, bitmap);
      dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, QrLayout.hintY(h), Graphics.FONT_XTINY, L10n.t(Rez.Strings.QrHint), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    var label = UiState.qrLoading ? L10n.t(Rez.Strings.QrLoading) : L10n.t(Rez.Strings.LoadingLabel);
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, h / 2, Graphics.FONT_SMALL, label, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
  }
}
