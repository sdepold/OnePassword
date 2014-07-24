// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392287
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.protocol) {
            var requestUri = args.detail.uri.rawUri
              , params = Dropbox.Util.Oauth.queryParamsFromUrl(requestUri)

            OnePassword.Helpers.Dropbox.setParams(params)
            nav.navigate('/pages/misc/sync.html')
        }

        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();

            var p = ui.processAll().then(function () {
                observeAppBar()
            }).then(function () {
                OnePassword.Helpers.OnePassword.hasCache(function (hasCache) {
                    if (!OnePassword.Helpers.Dropbox.isAuthenticated() || !hasCache) {
                        return nav.navigate('/pages/misc/sync.html')
                    } else {
                        if (!!OnePassword.Helpers.OnePassword.getPassword()) {
                            return nav.navigate(nav.location || Application.navigator.home, nav.state)
                        } else {
                            WinJS.Navigation.navigate('/pages/misc/master_password.html')
                        }
                    }
                })
            }).then(function () {
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                ui.enableAnimations();
            })

            args.setPromise(p);
        }
    });

    app.addEventListener("checkpoint", function (args) {
        OnePassword.Helpers.OnePassword.checkPasswordExpiration()

        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    })

    var observeAppBar = function () {
        var $appBar = document.getElementById('appbar')
          , appBar = $appBar.winControl

        appBar.getCommandById("search").addEventListener("click", function (e) {
            var toggleSearchBar = function () {
                var $flyout = WinJS.Utilities.query('#search-flyout')[0]
                  , $input = WinJS.Utilities.query('input', $flyout)[0]

                if (!$flyout.classList.toggle('hidden')) {
                    $input.focus()
                    $input.select()
                    $input.click()
                } else {
                    $input.blur()
                }
            }

            if (WinJS.Utilities.query('[data-scope="home#home"]').length > 0) {
                var list = WinJS.Utilities.query("#categoryListView")[0].winControl
                list.dispatchEvent('iteminvoked', { detail: { itemIndex: 0 } })
            }

            toggleSearchBar()
        }, false)

        appBar.getCommandById("update-data").addEventListener("click", function (e) {
            nav.navigate('/pages/misc/sync.html')
        })

        appBar.getCommandById("home").addEventListener('click', function (e) {
            e.preventDefault()
            nav.navigate(Application.navigator.home)
        })

        appBar.getCommandById("lock").addEventListener("click", function (e) {
            e.preventDefault()
            OnePassword.Helpers.OnePassword.expirePassword()
            nav.navigate(Application.navigator.home)
        })
    }

    app.start();
})();
