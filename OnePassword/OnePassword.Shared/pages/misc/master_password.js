// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/misc/master_password.html", {
        ready: function (element, options) {
            WinJS.Resources.processAll()

            var $button = WinJS.Utilities.query('button', element)[0]
            $button.addEventListener('click', this.onClick.bind(this))
        },

        onClick: function (e) {
            e.preventDefault()

            var password = WinJS.Utilities.query('[name="masterPassword"]')[0].value
              , keep = WinJS.Utilities.query('[name="keepPassword"]')[0].checked

            OnePassword.Helpers.OnePassword.setPassword(password, keep)
            WinJS.Navigation.navigate(Application.navigator.home)
        }
    });
})();
