import Toybox.Lang;

module TextLayout {
  // Break text into lines that fit a round watch face (keep within horizontal safe zone).
  function wrapByLength(text as String, maxLen as Number) as Lang.Array<String> {
    var lines = [] as Lang.Array<String>;
    if (text == null || text.length() == 0) {
      return lines;
    }
    var i = 0;
    while (i < text.length()) {
      var end = i + maxLen;
      if (end > text.length()) {
        end = text.length();
      } else {
        var splitAt = end;
        var j = end;
        while (j > i) {
          var ch = text.substring(j - 1, j);
          if (ch.equals("/") || ch.equals("-") || ch.equals(".")) {
            splitAt = j;
            break;
          }
          j -= 1;
        }
        if (splitAt > i) {
          end = splitAt;
        }
      }
      lines.add(text.substring(i, end));
      i = end;
    }
    return lines;
  }

  function maxLinesForHeight(lineHeight as Number, topY as Number, bottomY as Number) as Number {
    var available = bottomY - topY;
    if (available <= 0 || lineHeight <= 0) {
      return 1;
    }
    return available / lineHeight;
  }
}
