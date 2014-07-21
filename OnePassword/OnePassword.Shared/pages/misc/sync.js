// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/misc/sync.html", {
        ready: function (element, options) {
            this.addCheckList(element)
            this.addActionButton(element)
        },

        addCheckList: function (element) {
            var $list = WinJS.Utilities.query('.fa-ul', element)[0]

            OnePassword.Helpers.OnePassword.hasCache(function (result) {
                var checks = {
                    dropbox_authentication: OnePassword.Helpers.Dropbox.isAuthenticated(),
                    dropbox_synced: result,
                    yaddi: false
                }

                Object.keys(checks).forEach(function (name) {
                    var checkClass = checks[name] ? 'fa-check-square-o' : 'fa-square-o'
                      , text = OnePassword.Helpers.t("sync_checks." + name)

                    WinJS.Utilities.insertAdjacentHTML($list, 'beforeend', '<li><i class="fa-li fa ' + checkClass + '"></i>&nbsp; ' + text + '</li>')
                })
            })
        },

        addActionButton: function (element) {
            var $list = WinJS.Utilities.query('.fa-ul', element)[0]
              , $button = document.createElement('button')

            if (!OnePassword.Helpers.Dropbox.isAuthenticated()) {
                $button.innerText = OnePassword.Helpers.t('dropbox.authenticate')
                $button.addEventListener('click', this.onAuthenticateClick.bind(this))
                $list.parentNode.insertBefore($button, $list.nextSibling)
            } else {
                OnePassword.Helpers.OnePassword.hasCache(function (result) {
                    $button.innerText = OnePassword.Helpers.t('dropbox.sync')
                    $button.addEventListener('click', this.onSyncClick.bind(this))

                    $list.parentNode.insertBefore($button, $list.nextSibling)
                }.bind(this))
            }


        },

        onAuthenticateClick: function (e) {
            e.preventDefault()

            OnePassword.Helpers.OnePassword.sync()
        },

        onSyncClick: function (e) {
            e.preventDefault()

            var $progress = WinJS.Utilities.query('#progress')[0]
              , html = '<label class="progressRingText"><progress class="win-ring withText win-large"></progress><br /></label>'
              , $stateSpan = document.createElement('span')

            WinJS.Utilities.insertAdjacentHTML($progress, 'beforeend', html)
            WinJS.Utilities.query('.progressRingText', $progress)[0].appendChild($stateSpan)

            $stateSpan.innerHTML = OnePassword.Helpers.t('sync_state.preparing') + '...'

            var onDownloaded = function () {
                WinJS.Navigation.navigate('/pages/misc/sync.html')
            }

            ;(function () {
                var total = null

                OnePassword.Helpers.OnePassword.sync(onDownloaded, {
                    onProgress: function (state, data) {
                        var msg = OnePassword.Helpers.t('sync_state.' + state) + '...'

                        if (state === 'afterReaddir') {
                            total = data
                        } else if (state === 'afterReadItem') {
                            msg += '<br>' + (total - data) + '/' + total
                        }

                        $stateSpan.innerHTML = msg
                    }
                })
            })()
        }
    });
})();
