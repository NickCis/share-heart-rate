import Toybox.Lang;

module UiState {
  var loading as Boolean = false;
  var error as String or Null = null;
  var statusLine as String = "";
  var qrLoading as Boolean = false;
  var qrError as String or Null = null;

  function setLoading(on as Boolean) as Void {
    loading = on;
    if (on) {
      error = null;
    }
  }

  function setError(msg as String or Null) as Void {
    error = msg;
    loading = false;
  }

  function setStatus(msg as String) as Void {
    statusLine = msg;
  }

  function setQrLoading(on as Boolean) as Void {
    qrLoading = on;
    if (on) {
      qrError = null;
    }
  }

  function setQrError(msg as String or Null) as Void {
    qrError = msg;
    qrLoading = false;
  }
}
