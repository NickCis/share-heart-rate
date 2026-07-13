import Toybox.Lang;
import Toybox.System;

module QrLayout {
  const BOTTOM_RESERVE = 30;
  const TOP_RESERVE = 12;
  const ROUND_INSCRIBED_NUM = 70;
  const ROUND_INSCRIBED_DEN = 100;
  const RECT_PADDING = 24;

  function maxQrPixelSize() as Number {
    try {
      var settings = System.getDeviceSettings();
      var w = settings.screenWidth;
      var h = settings.screenHeight;
      var minSide = w < h ? w : h;
      var vertAvail = h - BOTTOM_RESERVE - TOP_RESERVE;
      var horizMax = minSide;

      if (isRoundScreen(settings)) {
        horizMax = (minSide * ROUND_INSCRIBED_NUM) / ROUND_INSCRIBED_DEN;
      } else {
        horizMax = minSide - RECT_PADDING;
      }

      var size = vertAvail < horizMax ? vertAvail : horizMax;
      if (size < 90) {
        return 90;
      }
      if (size > 180) {
        return 180;
      }
      return size;
    } catch (ex) {
    }
    return 140;
  }

  function isRoundScreen(settings as System.DeviceSettings) as Boolean {
    try {
      return settings.screenShape == System.SCREEN_SHAPE_ROUND;
    } catch (ex) {
    }
    return true;
  }

  function bitmapTop(h as Number, bitmapH as Number) as Number {
    var areaH = h - TOP_RESERVE - BOTTOM_RESERVE;
    if (bitmapH >= areaH) {
      return TOP_RESERVE;
    }
    return TOP_RESERVE + (areaH - bitmapH) / 2;
  }

  function hintY(h as Number) as Number {
    return h - 14;
  }
}
