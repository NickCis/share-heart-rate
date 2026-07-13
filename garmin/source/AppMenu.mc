import Toybox.Lang;
import Toybox.WatchUi;

class AppMenu extends WatchUi.Menu2 {
  function initialize() {
    Menu2.initialize({ :title => L10n.t(Rez.Strings.MenuTitle) });
    addItem(new WatchUi.MenuItem(L10n.t(Rez.Strings.MenuReset), null, :reset, null));
  }
}

class AppMenuDelegate extends WatchUi.Menu2InputDelegate {
  var _controller as AppController;

  function initialize(controller as AppController) {
    Menu2InputDelegate.initialize();
    _controller = controller;
  }

  function onSelect(item as WatchUi.MenuItem) as Void {
    var id = item.getId();
    if (id == :reset) {
      _controller.resetSession();
    }
    WatchUi.popView(WatchUi.SLIDE_DOWN);
  }
}
