// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/items/show.html", {
        ready: function (element, options) {
            this.item = options.item

            if (this.unlockItem()) {
                this.populateData(element)
                this.applyListView(element)
            }
        },

        unlockItem: function () {
            var securityLevel = this.item.securityLevel() || 'SL5'
            var key = OnePassword.Helpers.OnePassword._database.encryptionKeys.get(securityLevel)

            if (key) {
                if (this.item.locked()) {
                    this.item.unlock(key.value)
                }
                
                return true
            } else {
                console.log("Unable to unlock", this.item)
                return false
            }
        },

        populateData: function (element) {
            var data = []
              , self = this

            ;(['name', 'timestamp', 'type', 'url']).forEach(function (field) {
                data.push({
                    name: field,
                    value: self.item[field]
                })
            })

            data = data.concat(this.item.decrypted.fields)

            this.data = data
        },

        applyListView: function (element) {
            var $div = WinJS.Utilities.query('#item-details', element)[0]
            var html = ""

            this.data.forEach(function (data) {
                html = html + [
                    "<div class='detail'>",
                        "<label for='" + data.name + "'>" + data.name + "</label>",
                        "<input type='text' value='" + data.value + "' name='" + data.name + "' id='" + data.name + "' readonly='readonly'></input>",
                    "</div>"
                ].join("")
            })

            $div.innerHTML = window.toStaticHTML(html)

            WinJS.Utilities.query('.detail', $div).forEach(function (div) {
                div.addEventListener('click', function (e) {
                    e.preventDefault()

                    var $input = e.target

                    if ($input.tagName.toLowerCase() !== 'input') {
                        $input = WinJS.Utilities.query('input', e.target)[0]
                    }

                    $input.focus()
                    setTimeout(function () {
                        $input.select()
                    }, 100)
                })
            })
        }
    });
})();
