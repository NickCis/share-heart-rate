import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class ShareHeartApp extends Application.AppBase {
  function initialize() {
    AppBase.initialize();
  }

  function onStart(state as Dictionary or Null) as Void {
  }

  function onStop(state as Dictionary or Null) as Void {
  }

  function getInitialView() {
    var controller = new AppController();
    return [ controller.getInitialView(), controller ];
  }
}

function getApp() as ShareHeartApp {
  return Application.getApp() as ShareHeartApp;
}
